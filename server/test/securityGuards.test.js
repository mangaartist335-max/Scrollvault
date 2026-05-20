import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import express from 'express';
import jwt from 'jsonwebtoken';

process.env.SUPABASE_URL ||= 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY ||= 'test-anon-key';
process.env.JWT_SECRET = 'test-secret';
process.env.ADMIN_KEY = 'admin-secret';
process.env.FRONTEND_URL = 'https://app.scrollvault.test';
process.env.FRONTEND_URLS = 'https://preview.scrollvault.test';

const [
  { default: socialAuthRoutes, resolveFrontendBase },
  { default: balanceRoutes, isSupportedWithdrawMethod },
  { default: adminRoutes },
] = await Promise.all([
  import('../routes/socialAuth.js'),
  import('../routes/balance.js'),
  import('../routes/admin.js'),
]);

async function withServer(app, run) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    return await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

test('social sign-in returnTo is limited to configured frontend origins', () => {
  assert.equal(
    resolveFrontendBase('https://evil.example/auth/callback'),
    'https://app.scrollvault.test'
  );
  assert.equal(
    resolveFrontendBase('https://preview.scrollvault.test/some/path'),
    'https://preview.scrollvault.test'
  );
  assert.equal(resolveFrontendBase('http://localhost:5173'), 'http://localhost:5173');
});

test('social sign-in config errors never redirect to an untrusted returnTo', async () => {
  const app = express();
  app.use('/api/auth', socialAuthRoutes);

  await withServer(app, async (baseUrl) => {
    const res = await fetch(
      `${baseUrl}/api/auth/google?returnTo=${encodeURIComponent('https://evil.example')}`,
      { redirect: 'manual' }
    );

    assert.equal(res.status, 302);
    assert.match(res.headers.get('location'), /^https:\/\/app\.scrollvault\.test\/signup\?/);
  });
});

test('withdrawals reject unsupported payout methods before balance lookup', async () => {
  assert.equal(isSupportedWithdrawMethod('PayPal'), true);
  assert.equal(isSupportedWithdrawMethod('TD Bank'), false);

  const app = express();
  app.use(express.json());
  app.use('/api/balance', balanceRoutes);
  const token = jwt.sign({ sub: 'user-1' }, process.env.JWT_SECRET);

  await withServer(app, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/balance/withdraw`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ amount: 10, method: 'TD Bank', details: 'acct' }),
    });

    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'Unsupported withdrawal method' });
  });
});

test('admin stats rejects admin keys sent in query strings', async () => {
  const app = express();
  app.use('/api/admin', adminRoutes);

  await withServer(app, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/admin/stats?key=admin-secret`);

    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: 'Unauthorized' });
  });
});
