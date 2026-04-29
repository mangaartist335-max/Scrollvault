import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { normalizeFrontendBase } from '../lib/frontendOrigin.js';

afterEach(() => {
  delete process.env.ALLOWED_FRONTEND_ORIGINS;
});

test('rejects untrusted OAuth return origins', () => {
  assert.equal(
    normalizeFrontendBase('https://evil.example/callback', 'https://scrollvault.vercel.app'),
    'https://scrollvault.vercel.app'
  );
});

test('allows configured and local frontend origins', () => {
  process.env.ALLOWED_FRONTEND_ORIGINS = 'https://preview.scrollvault.example, https://app.scrollvault.com/path';

  assert.equal(
    normalizeFrontendBase('https://preview.scrollvault.example/login', 'https://scrollvault.vercel.app'),
    'https://preview.scrollvault.example'
  );
  assert.equal(
    normalizeFrontendBase('https://app.scrollvault.com/signup', 'https://scrollvault.vercel.app'),
    'https://app.scrollvault.com'
  );
  assert.equal(
    normalizeFrontendBase('http://localhost:5173/signup', 'https://scrollvault.vercel.app'),
    'http://localhost:5173'
  );
});

test('falls back when returnTo is missing or malformed', () => {
  assert.equal(
    normalizeFrontendBase(undefined, 'https://scrollvault.vercel.app'),
    'https://scrollvault.vercel.app'
  );
  assert.equal(
    normalizeFrontendBase('not a url', 'https://scrollvault.vercel.app'),
    'https://scrollvault.vercel.app'
  );
});
