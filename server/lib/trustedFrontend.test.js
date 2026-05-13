import assert from 'node:assert/strict';
import test from 'node:test';
import { getTrustedFrontendOrigin } from './trustedFrontend.js';

const options = {
  defaultFrontend: 'https://scrollvault.example',
  extraAllowedOrigins: 'https://preview.scrollvault.example',
};

test('accepts only configured frontend origins for OAuth redirects', () => {
  assert.equal(
    getTrustedFrontendOrigin('https://scrollvault.example/login', options),
    'https://scrollvault.example'
  );
  assert.equal(
    getTrustedFrontendOrigin('https://preview.scrollvault.example/auth/callback', options),
    'https://preview.scrollvault.example'
  );
});

test('falls back when OAuth returnTo points at an untrusted origin', () => {
  assert.equal(
    getTrustedFrontendOrigin('https://attacker.example/capture', options),
    'https://scrollvault.example'
  );
  assert.equal(
    getTrustedFrontendOrigin('javascript:alert(1)', options),
    'https://scrollvault.example'
  );
  assert.equal(
    getTrustedFrontendOrigin('https://scrollvault.example.attacker.example', options),
    'https://scrollvault.example'
  );
});

test('keeps local development origins available', () => {
  assert.equal(
    getTrustedFrontendOrigin('http://localhost:5173', options),
    'http://localhost:5173'
  );
  assert.equal(
    getTrustedFrontendOrigin('http://127.0.0.1:5174/path', options),
    'http://127.0.0.1:5174'
  );
});
