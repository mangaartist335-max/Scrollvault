import assert from 'node:assert/strict';
import test from 'node:test';
import { withUserLock } from './userLocks.js';

test('withUserLock serializes work for the same user', async () => {
  const events = [];
  let releaseFirst;

  const first = withUserLock('user-1', async () => {
    events.push('first:start');
    await new Promise((resolve) => {
      releaseFirst = resolve;
    });
    events.push('first:end');
  });

  await Promise.resolve();

  const second = withUserLock('user-1', async () => {
    events.push('second:start');
  });

  await Promise.resolve();
  assert.deepEqual(events, ['first:start']);

  releaseFirst();
  await Promise.all([first, second]);

  assert.deepEqual(events, ['first:start', 'first:end', 'second:start']);
});

test('withUserLock allows different users to run concurrently', async () => {
  const events = [];
  let releaseFirst;

  const first = withUserLock('user-1', async () => {
    events.push('first:start');
    await new Promise((resolve) => {
      releaseFirst = resolve;
    });
    events.push('first:end');
  });

  await Promise.resolve();

  const second = withUserLock('user-2', async () => {
    events.push('second:start');
  });

  await second;
  assert.deepEqual(events, ['first:start', 'second:start']);

  releaseFirst();
  await first;

  assert.deepEqual(events, ['first:start', 'second:start', 'first:end']);
});
