import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';

process.env.SUPABASE_URL ||= 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY ||= 'anon-key';
process.env.JWT_SECRET ||= 'test-secret';
process.env.ADMIN_KEY = 'admin-secret';
process.env.FRONTEND_URL = 'https://app.scrollvault.com';
process.env.FRONTEND_URLS = 'https://preview.scrollvault.com';
process.env.PAYPAL_CLIENT_ID ||= 'paypal-client';
process.env.PAYPAL_CLIENT_SECRET ||= 'paypal-secret';

const { resolveFrontendBase } = await import('../routes/socialAuth.js');
const { isSupportedWithdrawMethod } = await import('../routes/balance.js');
const adminRoutes = (await import('../routes/admin.js')).default;

test('social auth return targets are restricted to configured frontend origins', () => {
  assert.equal(resolveFrontendBase('https://evil.example/steal'), 'https://app.scrollvault.com');
  assert.equal(resolveFrontendBase('not-a-url'), 'https://app.scrollvault.com');
  assert.equal(resolveFrontendBase('https://preview.scrollvault.com/auth'), 'https://preview.scrollvault.com');
  assert.equal(resolveFrontendBase('http://localhost:5173/login'), 'http://localhost:5173');
});

test('admin stats rejects query-string admin keys', async () => {
  const app = express();
  app.use('/api/admin', adminRoutes);

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  try {
    const { port } = server.address();
    const res = await fetch(`http://127.0.0.1:${port}/api/admin/stats?key=admin-secret`);
    assert.equal(res.status, 401);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});

test('withdrawals only support implemented payout methods', () => {
  assert.equal(isSupportedWithdrawMethod('PayPal'), true);
  assert.equal(isSupportedWithdrawMethod('TD Bank'), false);
  assert.equal(isSupportedWithdrawMethod(undefined), false);
});
