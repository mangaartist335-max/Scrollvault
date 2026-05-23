import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import jwt from 'jsonwebtoken';

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'anon-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'paypal-client';
process.env.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'paypal-secret';
process.env.FRONTEND_URL = 'https://app.scrollvault.test';
process.env.FRONTEND_URLS = 'https://preview.scrollvault.test';
delete process.env.GOOGLE_CLIENT_ID;
delete process.env.GOOGLE_CLIENT_SECRET;

async function withServer(router, mountPath, run) {
  const app = express();
  app.use(express.json());
  app.use(mountPath, router);

  const server = await new Promise((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });

  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

test('OAuth config redirects ignore unapproved returnTo origins', async () => {
  const { default: socialAuthRoutes, resolveFrontendBase } = await import('../routes/socialAuth.js');

  assert.equal(
    resolveFrontendBase('https://evil.example/path'),
    'https://app.scrollvault.test'
  );
  assert.equal(
    resolveFrontendBase('https://preview.scrollvault.test/anything'),
    'https://preview.scrollvault.test'
  );

  await withServer(socialAuthRoutes, '/api/auth', async (baseUrl) => {
    const res = await fetch(
      `${baseUrl}/api/auth/google?from=login&returnTo=${encodeURIComponent('https://evil.example')}`,
      { redirect: 'manual' }
    );

    assert.equal(res.status, 302);
    assert.match(
      res.headers.get('location'),
      /^https:\/\/app\.scrollvault\.test\/login\?social_error=/
    );
  });
});

test('unsupported withdrawal methods fail before balance access', async () => {
  const { default: balanceRoutes, isSupportedWithdrawMethod } = await import('../routes/balance.js');
  const token = jwt.sign({ sub: 'user-1' }, process.env.JWT_SECRET);

  assert.equal(isSupportedWithdrawMethod('PayPal'), true);
  assert.equal(isSupportedWithdrawMethod('Chase Bank'), false);

  await withServer(balanceRoutes, '/api/balance', async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/balance/withdraw`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        amount: 25,
        method: 'Chase Bank',
        details: 'account details',
      }),
    });

    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'Unsupported withdrawal method' });
  });
});

test('admin stats does not accept admin keys in query strings', async () => {
  process.env.ADMIN_KEY = 'admin-secret';
  const { default: adminRoutes } = await import('../routes/admin.js');

  await withServer(adminRoutes, '/api/admin', async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/admin/stats?key=admin-secret`);

    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: 'Unauthorized' });
  });
});
