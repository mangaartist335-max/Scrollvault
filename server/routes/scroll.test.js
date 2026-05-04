import assert from 'node:assert/strict';
import test from 'node:test';

test('withUserScrollLock serializes concurrent tasks for the same user', async () => {
  process.env.SUPABASE_URL = 'http://localhost:54321';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.JWT_SECRET = 'test-secret';

  const { withUserScrollLock } = await import('./scroll.js?lock-test');
  const events = [];

  let releaseFirst;
  const firstMayFinish = new Promise((resolve) => {
    releaseFirst = resolve;
  });

  let firstStarted = false;
  const first = withUserScrollLock('user-1', async () => {
    firstStarted = true;
    events.push('first-start');
    await firstMayFinish;
    events.push('first-end');
    return 'first';
  });

  await Promise.resolve();
  assert.equal(firstStarted, true);

  let secondStarted = false;
  const second = withUserScrollLock('user-1', async () => {
    secondStarted = true;
    events.push('second-start');
    return 'second';
  });

  await Promise.resolve();
  assert.equal(secondStarted, false);

  releaseFirst();

  assert.deepEqual(await Promise.all([first, second]), ['first', 'second']);
  assert.equal(secondStarted, true);
  assert.deepEqual(events, ['first-start', 'first-end', 'second-start']);
});
