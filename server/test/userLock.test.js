import test from 'node:test';
import assert from 'node:assert/strict';
import { activeLockCount, runExclusiveForKey } from '../lib/userLock.js';

function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function nextTurn() {
  return new Promise((resolve) => setImmediate(resolve));
}

test('runExclusiveForKey serializes work for the same key', async () => {
  const firstGate = deferred();
  const events = [];

  const first = runExclusiveForKey('user-1', async () => {
    events.push('first:start');
    await firstGate.promise;
    events.push('first:end');
    return 'first';
  });

  const second = runExclusiveForKey('user-1', async () => {
    events.push('second:start');
    return 'second';
  });

  await nextTurn();
  assert.deepEqual(events, ['first:start']);

  firstGate.resolve();
  assert.equal(await first, 'first');
  assert.equal(await second, 'second');
  assert.deepEqual(events, ['first:start', 'first:end', 'second:start']);
  await nextTurn();
  assert.equal(activeLockCount(), 0);
});

test('runExclusiveForKey allows different keys to run concurrently', async () => {
  const firstGate = deferred();
  const events = [];

  const first = runExclusiveForKey('user-1', async () => {
    events.push('user-1:start');
    await firstGate.promise;
    events.push('user-1:end');
  });

  const second = runExclusiveForKey('user-2', async () => {
    events.push('user-2:start');
  });

  await nextTurn();
  await second;
  assert.deepEqual(events, ['user-1:start', 'user-2:start']);

  firstGate.resolve();
  await first;
  assert.deepEqual(events, ['user-1:start', 'user-2:start', 'user-1:end']);
  await nextTurn();
  assert.equal(activeLockCount(), 0);
});

test('runExclusiveForKey continues the queue after a failure', async () => {
  await assert.rejects(
    runExclusiveForKey('user-failure', async () => {
      throw new Error('boom');
    }),
    /boom/
  );

  const result = await runExclusiveForKey('user-failure', async () => 'recovered');
  assert.equal(result, 'recovered');
  await nextTurn();
  assert.equal(activeLockCount(), 0);
});
