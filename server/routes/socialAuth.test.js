import assert from 'node:assert/strict';
import test from 'node:test';

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'anon-key';
process.env.JWT_SECRET = 'test-secret';
process.env.FRONTEND_URL = 'https://app.scrollvault.test';
process.env.FRONTEND_URLS = 'https://preview.scrollvault.test,http://localhost:5173/';

const { resolveFrontendBase } = await import('./socialAuth.js');

test('resolveFrontendBase accepts only configured frontend origins', () => {
  assert.equal(
    resolveFrontendBase('https://app.scrollvault.test/auth/callback?x=1'),
    'https://app.scrollvault.test'
  );
  assert.equal(
    resolveFrontendBase('https://preview.scrollvault.test'),
    'https://preview.scrollvault.test'
  );
  assert.equal(resolveFrontendBase('http://localhost:5173/login'), 'http://localhost:5173');
});

test('resolveFrontendBase rejects hostile or malformed return targets', () => {
  assert.equal(resolveFrontendBase('https://attacker.example'), 'https://app.scrollvault.test');
  assert.equal(resolveFrontendBase('javascript:alert(1)'), 'https://app.scrollvault.test');
  assert.equal(resolveFrontendBase('//attacker.example'), 'https://app.scrollvault.test');
  assert.equal(
    resolveFrontendBase(['https://attacker.example', 'https://app.scrollvault.test']),
    'https://app.scrollvault.test'
  );
});
