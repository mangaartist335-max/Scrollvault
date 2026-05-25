import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allowedFrontendOrigins,
  defaultFrontendOrigin,
  resolveFrontendBase,
} from '../lib/frontendRedirect.js';

test('resolveFrontendBase rejects unconfigured redirect origins', () => {
  const env = {
    FRONTEND_URL: 'https://app.scrollvault.example',
    FRONTEND_URLS: 'https://preview.scrollvault.example, http://localhost:5174',
  };

  assert.equal(
    resolveFrontendBase('https://evil.example/auth/callback', env),
    'https://app.scrollvault.example'
  );
});

test('resolveFrontendBase accepts configured frontend origins only', () => {
  const env = {
    FRONTEND_URL: 'https://app.scrollvault.example',
    FRONTEND_URLS: 'https://preview.scrollvault.example',
  };

  assert.equal(
    resolveFrontendBase('https://preview.scrollvault.example/signup?from=oauth', env),
    'https://preview.scrollvault.example'
  );
  assert.equal(
    resolveFrontendBase('https://app.scrollvault.example/login', env),
    'https://app.scrollvault.example'
  );
});

test('resolveFrontendBase keeps local development origins available', () => {
  assert.equal(
    resolveFrontendBase('http://127.0.0.1:5174/login', {}),
    'http://127.0.0.1:5174'
  );
});

test('frontend allowlist normalizes comma-separated configuration', () => {
  const allowed = allowedFrontendOrigins({
    FRONTEND_URL: 'https://app.scrollvault.example/',
    FRONTEND_URLS: ' https://one.scrollvault.example/path,https://two.scrollvault.example ',
  });

  assert.equal(defaultFrontendOrigin({ FRONTEND_URL: 'notaurl' }), 'http://localhost:5173');
  assert.equal(allowed.has('https://app.scrollvault.example'), true);
  assert.equal(allowed.has('https://one.scrollvault.example'), true);
  assert.equal(allowed.has('https://two.scrollvault.example'), true);
});
