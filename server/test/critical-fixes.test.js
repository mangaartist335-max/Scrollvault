import test from 'node:test';
import assert from 'node:assert/strict';

process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ADMIN_KEY = 'test-admin-key';
process.env.PAYPAL_CLIENT_ID = 'test-paypal-client';
process.env.PAYPAL_CLIENT_SECRET = 'test-paypal-secret';

const { resolveFrontendBase } = await import('../routes/socialAuth.js');
const { isSupportedWithdrawMethod } = await import('../routes/balance.js');
const { requireAdmin } = await import('../routes/admin.js');

test('resolveFrontendBase only returns explicitly allowed origins', () => {
  const allowedFrontends = new Set([
    'http://localhost:5173',
    'https://app.scrollvault.example',
  ]);

  assert.equal(
    resolveFrontendBase('https://app.scrollvault.example/dashboard?tab=login', allowedFrontends),
    'https://app.scrollvault.example'
  );
  assert.equal(
    resolveFrontendBase('https://attacker.example', allowedFrontends),
    'http://localhost:5173'
  );
  assert.equal(
    resolveFrontendBase('javascript:alert(1)', allowedFrontends),
    'http://localhost:5173'
  );
});

test('withdrawals reject methods without a payout implementation', () => {
  assert.equal(isSupportedWithdrawMethod('PayPal'), true);
  assert.equal(isSupportedWithdrawMethod('Chase Bank'), false);
  assert.equal(isSupportedWithdrawMethod(undefined), false);
});

test('admin auth requires the shared secret in a header', () => {
  const unauthorized = {
    statusCode: undefined,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  let nextCalled = false;

  requireAdmin(
    { headers: {}, query: { key: 'test-admin-key' } },
    unauthorized,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(nextCalled, false);
  assert.equal(unauthorized.statusCode, 401);

  requireAdmin(
    { headers: { 'x-admin-key': 'test-admin-key' }, query: {} },
    {},
    () => {
      nextCalled = true;
    }
  );

  assert.equal(nextCalled, true);
});
