import assert from 'node:assert/strict';
import test from 'node:test';

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.PAYPAL_CLIENT_ID = 'test-paypal-client';
process.env.PAYPAL_CLIENT_SECRET = 'test-paypal-secret';
process.env.FRONTEND_URL = 'https://app.scrollvault.com/';
process.env.FRONTEND_URLS = 'https://preview.scrollvault.com,https://staging.scrollvault.com/app';

const { requireAdmin } = await import('../routes/admin.js');
const { isSupportedWithdrawMethod } = await import('../routes/balance.js');
const { resolveFrontendBase } = await import('../routes/socialAuth.js');

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('OAuth return targets are limited to configured frontend origins', () => {
  assert.equal(resolveFrontendBase('https://app.scrollvault.com/login'), 'https://app.scrollvault.com');
  assert.equal(resolveFrontendBase('https://staging.scrollvault.com/anything'), 'https://staging.scrollvault.com');
  assert.equal(resolveFrontendBase('http://localhost:5173/signup'), 'http://localhost:5173');
  assert.equal(resolveFrontendBase('https://evil.example/callback'), 'https://app.scrollvault.com');
  assert.equal(resolveFrontendBase('not a url'), 'https://app.scrollvault.com');
});

test('admin stats key must be sent in the x-admin-key header', () => {
  process.env.ADMIN_KEY = 'correct-secret';

  let nextCalled = false;
  const acceptedRes = createResponse();
  requireAdmin(
    { headers: { 'x-admin-key': 'correct-secret' }, query: {} },
    acceptedRes,
    () => {
      nextCalled = true;
    }
  );
  assert.equal(nextCalled, true);
  assert.equal(acceptedRes.statusCode, 200);

  nextCalled = false;
  const rejectedRes = createResponse();
  requireAdmin(
    { headers: {}, query: { key: 'correct-secret' } },
    rejectedRes,
    () => {
      nextCalled = true;
    }
  );
  assert.equal(nextCalled, false);
  assert.equal(rejectedRes.statusCode, 401);
});

test('withdrawals only allow methods with a real payout implementation', () => {
  assert.equal(isSupportedWithdrawMethod('PayPal'), true);
  assert.equal(isSupportedWithdrawMethod('TD Bank'), false);
  assert.equal(isSupportedWithdrawMethod(undefined), false);
});
