import assert from 'node:assert/strict';
import test from 'node:test';

process.env.SUPABASE_URL ||= 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY ||= 'test-anon-key';
process.env.JWT_SECRET ||= 'test-jwt-secret';
process.env.PAYPAL_CLIENT_ID ||= 'test-paypal-client';
process.env.PAYPAL_CLIENT_SECRET ||= 'test-paypal-secret';
process.env.FRONTEND_URL = 'https://app.scrollvault.example';
process.env.FRONTEND_URLS = 'https://preview.scrollvault.example,https://beta.scrollvault.example/path';

const { isAdminRequestAuthorized } = await import('../routes/admin.js');
const { isReservedOAuthEmail } = await import('../routes/auth.js');
const { isSupportedWithdrawMethod } = await import('../routes/balance.js');
const { resolveFrontendBase } = await import('../routes/socialAuth.js');

test('social auth return targets must resolve to allowlisted origins', () => {
  assert.equal(
    resolveFrontendBase('https://evil.example/auth/callback'),
    'https://app.scrollvault.example'
  );
  assert.equal(
    resolveFrontendBase('javascript:alert(1)'),
    'https://app.scrollvault.example'
  );
  assert.equal(
    resolveFrontendBase('https://preview.scrollvault.example/some/path'),
    'https://preview.scrollvault.example'
  );
  assert.equal(
    resolveFrontendBase('http://localhost:5173/login'),
    'http://localhost:5173'
  );
});

test('admin authorization ignores query-string keys', () => {
  assert.equal(
    isAdminRequestAuthorized(
      { query: { key: 'secret' }, headers: {} },
      'secret'
    ),
    false
  );
  assert.equal(
    isAdminRequestAuthorized(
      { query: {}, headers: { 'x-admin-key': 'secret' } },
      'secret'
    ),
    true
  );
});

test('withdrawals only allow implemented payout methods', () => {
  assert.equal(isSupportedWithdrawMethod('PayPal'), true);
  assert.equal(isSupportedWithdrawMethod('TD Bank'), false);
  assert.equal(isSupportedWithdrawMethod(undefined), false);
});

test('password signup cannot claim reserved synthetic OAuth emails', () => {
  assert.equal(isReservedOAuthEmail('twitter_123@oauth.scrollvault.invalid'), true);
  assert.equal(isReservedOAuthEmail('USER@OAUTH.SCROLLVAULT.INVALID'), true);
  assert.equal(isReservedOAuthEmail('user@example.com'), false);
});
