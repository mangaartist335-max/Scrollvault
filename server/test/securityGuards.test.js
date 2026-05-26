import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import express from 'express';
import jwt from 'jsonwebtoken';

process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.FRONTEND_URLS = 'https://app.scrollvault.test,https://preview.scrollvault.test';
process.env.JWT_SECRET = 'test-secret';
process.env.PAYPAL_CLIENT_ID = 'test-client';
process.env.PAYPAL_CLIENT_SECRET = 'test-secret';
process.env.SUPABASE_URL = 'https://scrollvault.test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
delete process.env.GOOGLE_CLIENT_ID;
delete process.env.GOOGLE_CLIENT_SECRET;

const [{ default: socialAuthRoutes }, { default: balanceRoutes }, { default: supabase }] = await Promise.all([
  import('../routes/socialAuth.js'),
  import('../routes/balance.js'),
  import('../db.js'),
]);

function startApp(routesPath, routes) {
  const app = express();
  app.use(express.json());
  app.use(routesPath, routes);
  const server = app.listen(0);
  const port = server.address().port;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    }),
  };
}

const apps = [];

after(async () => {
  await Promise.all(apps.map((app) => app.close()));
});

test('social sign-in ignores attacker-controlled returnTo targets', async () => {
  const app = startApp('/api/auth', socialAuthRoutes);
  apps.push(app);

  const res = await fetch(
    `${app.url}/api/auth/google?from=login&returnTo=${encodeURIComponent('https://evil.example')}`,
    { redirect: 'manual' }
  );

  assert.equal(res.status, 302);
  const location = res.headers.get('location');
  assert.match(location, /^http:\/\/localhost:5173\/login\?social_error=/);
  assert.doesNotMatch(location, /evil\.example/);
});

test('social sign-in allows configured frontend return targets', async () => {
  const app = startApp('/api/auth', socialAuthRoutes);
  apps.push(app);

  const res = await fetch(
    `${app.url}/api/auth/google?from=login&returnTo=${encodeURIComponent('https://preview.scrollvault.test')}`,
    { redirect: 'manual' }
  );

  assert.equal(res.status, 302);
  assert.match(res.headers.get('location'), /^https:\/\/preview\.scrollvault\.test\/login\?social_error=/);
});

test('unsupported withdrawal methods are rejected before balance lookup', async () => {
  const originalFrom = supabase.from;
  let touchedDatabase = false;
  supabase.from = () => {
    touchedDatabase = true;
    throw new Error('unexpected database access');
  };

  try {
    const app = startApp('/api/balance', balanceRoutes);
    apps.push(app);
    const token = jwt.sign({ sub: 'user-123' }, process.env.JWT_SECRET);

    const res = await fetch(`${app.url}/api/balance/withdraw`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 10,
        method: 'Chase Bank',
        details: 'account details',
      }),
    });

    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'Unsupported withdrawal method' });
    assert.equal(touchedDatabase, false);
  } finally {
    supabase.from = originalFrom;
  }
});
