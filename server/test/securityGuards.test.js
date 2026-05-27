import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';

process.env.FRONTEND_URL = 'https://app.scrollvault.test';
process.env.FRONTEND_URLS = 'https://preview.scrollvault.test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ADMIN_KEY = 'test-admin-key';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-supabase-anon-key';
process.env.PAYPAL_CLIENT_ID = 'test-paypal-client-id';
process.env.PAYPAL_CLIENT_SECRET = 'test-paypal-client-secret';

const [{ default: socialAuthRoutes }, { default: adminRoutes }, { default: balanceRoutes }] =
  await Promise.all([
    import('../routes/socialAuth.js'),
    import('../routes/admin.js'),
    import('../routes/balance.js'),
  ]);

async function withServer(app, callback) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    return await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', socialAuthRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/balance', balanceRoutes);
  return app;
}

test('social OAuth ignores untrusted returnTo origins before redirecting with auth fragments', async () => {
  await withServer(makeApp(), async (baseUrl) => {
    const res = await fetch(
      `${baseUrl}/api/auth/google?from=login&returnTo=${encodeURIComponent('https://evil.example')}`,
      { redirect: 'manual' }
    );

    assert.equal(res.status, 302);
    assert.match(res.headers.get('location'), /^https:\/\/app\.scrollvault\.test\/login\?/);
  });
});

test('social OAuth accepts configured frontend returnTo origins', async () => {
  await withServer(makeApp(), async (baseUrl) => {
    const res = await fetch(
      `${baseUrl}/api/auth/google?from=signup&returnTo=${encodeURIComponent('https://preview.scrollvault.test')}`,
      { redirect: 'manual' }
    );

    assert.equal(res.status, 302);
    assert.match(res.headers.get('location'), /^https:\/\/preview\.scrollvault\.test\/signup\?/);
  });
});

test('admin stats does not accept the admin key in the URL query string', async () => {
  await withServer(makeApp(), async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/admin/stats?key=${process.env.ADMIN_KEY}`);
    const body = await res.json();

    assert.equal(res.status, 401);
    assert.equal(body.error, 'Unauthorized');
  });
});

test('withdrawals reject unsupported payout methods before debiting balances', async () => {
  await withServer(makeApp(), async (baseUrl) => {
    const token = jwt.sign({ sub: 'user-123' }, process.env.JWT_SECRET);
    const res = await fetch(`${baseUrl}/api/balance/withdraw`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 10,
        method: 'Chase Bank',
        details: 'routing/account',
      }),
    });
    const body = await res.json();

    assert.equal(res.status, 400);
    assert.equal(body.error, 'Unsupported withdrawal method');
  });
});
