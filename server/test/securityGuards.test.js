import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allowedFrontendBases,
  resolveFrontendBase,
} from '../lib/frontendBase.js';
import { adminKeyFromRequest } from '../lib/adminKey.js';
import { isSupportedWithdrawMethod } from '../lib/withdrawalMethods.js';

test('resolveFrontendBase allows only configured frontend origins', () => {
  const env = {
    FRONTEND_URL: 'https://app.scrollvault.example',
    FRONTEND_URLS: 'https://preview.scrollvault.example, https://admin.scrollvault.example/path',
  };

  assert.equal(
    resolveFrontendBase('https://preview.scrollvault.example/auth/callback', env),
    'https://preview.scrollvault.example'
  );
  assert.equal(
    resolveFrontendBase('https://attacker.example', env),
    'https://app.scrollvault.example'
  );
  assert.equal(
    resolveFrontendBase('javascript:alert(1)', env),
    'https://app.scrollvault.example'
  );
});

test('allowedFrontendBases includes local development origins', () => {
  const origins = allowedFrontendBases({ FRONTEND_URL: 'https://app.scrollvault.example' });

  assert.equal(origins.has('http://localhost:5174'), true);
  assert.equal(origins.has('https://app.scrollvault.example'), true);
});

test('adminKeyFromRequest ignores query string secrets', () => {
  assert.equal(
    adminKeyFromRequest({
      query: { key: 'leaked-in-url' },
      headers: {},
    }),
    undefined
  );
  assert.equal(
    adminKeyFromRequest({
      query: { key: 'leaked-in-url' },
      headers: { 'x-admin-key': 'header-secret' },
    }),
    'header-secret'
  );
});

test('withdrawal methods are limited to implemented payout paths', () => {
  assert.equal(isSupportedWithdrawMethod('PayPal'), true);
  assert.equal(isSupportedWithdrawMethod('TD Bank'), false);
  assert.equal(isSupportedWithdrawMethod(undefined), false);
});
