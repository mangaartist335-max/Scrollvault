import test from 'node:test';
import assert from 'node:assert/strict';

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'test-client';
process.env.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'test-secret';
process.env.FRONTEND_URL = 'https://app.scrollvault.example';
process.env.FRONTEND_URLS = 'https://preview.scrollvault.example';

const { resolveFrontendBase } = await import('../routes/socialAuth.js');
const { isAdminRequestAuthorized } = await import('../routes/admin.js');
const { isSupportedWithdrawMethod } = await import('../routes/balance.js');
const { calculateScrollEarn } = await import('../routes/scroll.js');

test('OAuth sign-in redirects only to allowlisted frontend origins', () => {
  assert.equal(
    resolveFrontendBase('https://evil.example/auth/callback'),
    'https://app.scrollvault.example'
  );
  assert.equal(
    resolveFrontendBase('https://preview.scrollvault.example/path?x=1'),
    'https://preview.scrollvault.example'
  );
});

test('admin auth ignores query string keys', () => {
  assert.equal(
    isAdminRequestAuthorized({ headers: {}, query: { key: 'secret' } }, 'secret'),
    false
  );
  assert.equal(
    isAdminRequestAuthorized({ headers: { 'x-admin-key': 'secret' }, query: {} }, 'secret'),
    true
  );
});

test('withdrawals are limited to implemented payout methods', () => {
  assert.equal(isSupportedWithdrawMethod('PayPal'), true);
  assert.equal(isSupportedWithdrawMethod('Chase Bank'), false);
});

test('TikTok rewards respect the lifetime earning cap', () => {
  assert.equal(
    calculateScrollEarn({
      platform: 'tiktok',
      earnedToday: 0,
      tiktokEarnedTotal: 19.95,
      dailyCap: 2,
      tiktokCap: 20,
    }),
    0.05
  );
  assert.equal(
    calculateScrollEarn({
      platform: 'tiktok',
      earnedToday: 0,
      tiktokEarnedTotal: 20,
      dailyCap: 2,
      tiktokCap: 20,
    }),
    0
  );
});
