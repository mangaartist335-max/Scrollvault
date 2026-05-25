const locks = new Map();

export function runExclusiveForKey(key, work) {
  const previous = locks.get(key) || Promise.resolve();
  const current = previous.then(work);
  let cleanup;
  cleanup = current.catch(() => {}).finally(() => {
    if (locks.get(key) === cleanup) {
      locks.delete(key);
    }
  });
  locks.set(key, cleanup);
  return current;
}

export function activeLockCount() {
  return locks.size;
}
