import test from 'node:test';
import assert from 'node:assert/strict';

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'anon-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'paypal-client';
process.env.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'paypal-secret';
process.env.FRONTEND_URL = 'https://app.scrollvault.test';
process.env.FRONTEND_URLS = 'https://preview.scrollvault.test, http://localhost:5174';

const socialAuth = await import('../routes/socialAuth.js');
const balance = await import('../routes/balance.js');
const admin = await import('../routes/admin.js');
const oauth = await import('../routes/oauth.js');

test('social auth returnTo is restricted to configured frontend origins', () => {
  assert.equal(
    socialAuth.resolveFrontendBase('https://evil.example/callback'),
    'https://app.scrollvault.test'
  );
  assert.equal(
    socialAuth.resolveFrontendBase('https://app.scrollvault.test/some/path'),
    'https://app.scrollvault.test'
  );
  assert.equal(
    socialAuth.resolveFrontendBase('https://preview.scrollvault.test/login'),
    'https://preview.scrollvault.test'
  );
  assert.equal(
    socialAuth.resolveFrontendBase('javascript:alert(1)'),
    'https://app.scrollvault.test'
  );
});

test('withdrawals only allow methods with a real payout implementation', () => {
  assert.equal(balance.isSupportedWithdrawMethod('PayPal'), true);
  assert.equal(balance.isSupportedWithdrawMethod('TD Bank'), false);
  assert.equal(balance.isSupportedWithdrawMethod(''), false);
});

test('admin authorization requires the configured header value', () => {
  assert.equal(admin.isAdminKeyAuthorized('secret', 'secret'), true);
  assert.equal(admin.isAdminKeyAuthorized('wrong', 'secret'), false);
  assert.equal(admin.isAdminKeyAuthorized(undefined, 'secret'), false);
  assert.equal(admin.isAdminKeyAuthorized('secret', undefined), false);
});

test('platform oauth callbacks use the deployed backend origin', () => {
  const originalPublicBackendUrl = process.env.PUBLIC_BACKEND_URL;
  const req = {
    protocol: 'http',
    get(name) {
      if (name === 'host') return 'api.scrollvault.test';
      if (name === 'x-forwarded-proto') return 'https';
      return undefined;
    },
  };

  delete process.env.PUBLIC_BACKEND_URL;
  assert.equal(oauth.publicBaseUrl(req), 'https://api.scrollvault.test');

  process.env.PUBLIC_BACKEND_URL = 'https://render.scrollvault.test/';
  assert.equal(oauth.publicBaseUrl(req), 'https://render.scrollvault.test');

  if (originalPublicBackendUrl === undefined) {
    delete process.env.PUBLIC_BACKEND_URL;
  } else {
    process.env.PUBLIC_BACKEND_URL = originalPublicBackendUrl;
  }
});
