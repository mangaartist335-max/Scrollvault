import assert from 'node:assert/strict';
import test from 'node:test';

process.env.FRONTEND_URL = 'https://app.scrollvault.example';
process.env.FRONTEND_URLS = 'https://preview.scrollvault.example,http://localhost:5173/';
process.env.JWT_SECRET = 'test-secret';
process.env.PAYPAL_CLIENT_ID = 'test-client';
process.env.PAYPAL_CLIENT_SECRET = 'test-secret';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

const { isSupportedWithdrawMethod } = await import('../routes/balance.js');
const { resolveFrontendBase } = await import('../routes/socialAuth.js?security-test');

test('rejects unsupported withdrawal methods', () => {
  assert.equal(isSupportedWithdrawMethod('PayPal'), true);
  assert.equal(isSupportedWithdrawMethod('paypal'), false);
  assert.equal(isSupportedWithdrawMethod('Bank Transfer'), false);
  assert.equal(isSupportedWithdrawMethod(undefined), false);
});

test('OAuth return target falls back for untrusted origins', () => {
  assert.equal(
    resolveFrontendBase('https://attacker.example/callback'),
    'https://app.scrollvault.example'
  );
  assert.equal(
    resolveFrontendBase('javascript:alert(1)'),
    'https://app.scrollvault.example'
  );
});

test('OAuth return target allows configured frontend origins only', () => {
  assert.equal(
    resolveFrontendBase('https://preview.scrollvault.example/some/path'),
    'https://preview.scrollvault.example'
  );
  assert.equal(resolveFrontendBase('http://localhost:5173/login'), 'http://localhost:5173');
});
