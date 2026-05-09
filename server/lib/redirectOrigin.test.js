import assert from 'node:assert/strict';
import test from 'node:test';
import { allowedFrontendOrigins, resolveFrontendBase } from './redirectOrigin.js';

test('resolveFrontendBase returns the configured frontend by default', () => {
  assert.equal(
    resolveFrontendBase(undefined, { defaultFrontend: 'https://app.scrollvault.example' }),
    'https://app.scrollvault.example'
  );
});

test('resolveFrontendBase accepts the configured frontend origin only', () => {
  assert.equal(
    resolveFrontendBase('https://app.scrollvault.example/auth/callback', {
      defaultFrontend: 'https://app.scrollvault.example',
    }),
    'https://app.scrollvault.example'
  );
});

test('resolveFrontendBase rejects attacker-controlled origins', () => {
  assert.equal(
    resolveFrontendBase('https://evil.example', {
      defaultFrontend: 'https://app.scrollvault.example',
    }),
    'https://app.scrollvault.example'
  );
  assert.equal(
    resolveFrontendBase('https://app.scrollvault.example.evil.example', {
      defaultFrontend: 'https://app.scrollvault.example',
    }),
    'https://app.scrollvault.example'
  );
});

test('resolveFrontendBase rejects non-http schemes and malformed values', () => {
  assert.equal(
    resolveFrontendBase('javascript:alert(1)', {
      defaultFrontend: 'https://app.scrollvault.example',
    }),
    'https://app.scrollvault.example'
  );
  assert.equal(
    resolveFrontendBase('not a url', { defaultFrontend: 'https://app.scrollvault.example' }),
    'https://app.scrollvault.example'
  );
});

test('resolveFrontendBase accepts explicit extra redirect origins', () => {
  assert.equal(
    resolveFrontendBase('https://preview.scrollvault.example', {
      defaultFrontend: 'https://app.scrollvault.example',
      extraOrigins: 'https://preview.scrollvault.example',
    }),
    'https://preview.scrollvault.example'
  );
});

test('allowedFrontendOrigins includes local development origins', () => {
  const origins = allowedFrontendOrigins({
    defaultFrontend: 'https://app.scrollvault.example',
  });

  assert.equal(origins.has('http://localhost:5173'), true);
  assert.equal(origins.has('http://127.0.0.1:5174'), true);
});
