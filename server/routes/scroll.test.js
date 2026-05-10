import assert from 'node:assert/strict';
import test from 'node:test';

process.env.SUPABASE_URL ??= 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY ??= 'test-key';

const { withUserScrollLock } = await import('./scroll.js');

test('withUserScrollLock serializes tasks for a single user', async () => {
  const events = [];
  let releaseFirst;
  const firstMayFinish = new Promise((resolve) => {
    releaseFirst = resolve;
  });
  let firstStarted;
  const firstDidStart = new Promise((resolve) => {
    firstStarted = resolve;
  });

  const first = withUserScrollLock('user-1', async () => {
    events.push('first-start');
    firstStarted();
    await firstMayFinish;
    events.push('first-end');
  });

  await firstDidStart;

  let secondRan = false;
  const second = withUserScrollLock('user-1', async () => {
    secondRan = true;
    events.push('second-start');
  });

  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(secondRan, false);

  releaseFirst();
  await Promise.all([first, second]);

  assert.deepEqual(events, ['first-start', 'first-end', 'second-start']);
});

test('withUserScrollLock releases the queue after a rejected task', async () => {
  await assert.rejects(
    withUserScrollLock('user-2', async () => {
      throw new Error('boom');
    }),
    /boom/
  );

  let ranAfterFailure = false;
  await withUserScrollLock('user-2', async () => {
    ranAfterFailure = true;
  });

  assert.equal(ranAfterFailure, true);
});
