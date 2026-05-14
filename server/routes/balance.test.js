import assert from 'node:assert/strict';
import test from 'node:test';

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'anon-key';
process.env.PAYPAL_CLIENT_ID = 'paypal-client-id';
process.env.PAYPAL_CLIENT_SECRET = 'paypal-client-secret';

const { isSupportedWithdrawMethod } = await import('./balance.js');

test('withdrawals only support methods with a real payout implementation', () => {
  assert.equal(isSupportedWithdrawMethod('PayPal'), true);
  assert.equal(isSupportedWithdrawMethod('TD Bank'), false);
  assert.equal(isSupportedWithdrawMethod('Bank of America'), false);
  assert.equal(isSupportedWithdrawMethod(undefined), false);
});
