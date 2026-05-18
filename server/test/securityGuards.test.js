import assert from 'node:assert/strict';
import { test } from 'node:test';

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'anon-key';
process.env.ADMIN_KEY = 'expected-admin-key';

const { requireAdmin } = await import('../routes/admin.js');
const { isSupportedWithdrawMethod } = await import('../routes/balance.js');

function createRes() {
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

test('admin auth ignores keys supplied in query strings', () => {
  const req = {
    query: { key: 'expected-admin-key' },
    headers: {},
  };
  const res = createRes();
  let nextCalled = false;

  requireAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'Unauthorized' });
});

test('admin auth accepts the configured x-admin-key header', () => {
  const req = {
    query: {},
    headers: { 'x-admin-key': 'expected-admin-key' },
  };
  const res = createRes();
  let nextCalled = false;

  requireAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test('only implemented withdrawal methods are supported', () => {
  assert.equal(isSupportedWithdrawMethod('PayPal'), true);
  assert.equal(isSupportedWithdrawMethod('TD Bank'), false);
  assert.equal(isSupportedWithdrawMethod(''), false);
  assert.equal(isSupportedWithdrawMethod(undefined), false);
});
