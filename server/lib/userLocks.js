const locks = new Map();

export async function withUserLock(userId, work) {
  const key = String(userId);
  const previous = locks.get(key) || Promise.resolve();

  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  const next = previous.then(() => current, () => current);
  locks.set(key, next);

  await previous.catch(() => {});

  try {
    return await work();
  } finally {
    release();
    if (locks.get(key) === next) {
      locks.delete(key);
    }
  }
}
