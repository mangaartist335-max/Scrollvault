const LOCAL_FRONTEND_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

function originFrom(value) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function allowedOrigins(defaultFrontend) {
  const origins = new Set(LOCAL_FRONTEND_ORIGINS);
  const configured = originFrom(defaultFrontend);
  if (configured) origins.add(configured);

  const extra = process.env.ALLOWED_FRONTEND_ORIGINS;
  if (extra) {
    for (const entry of extra.split(',')) {
      const origin = originFrom(entry.trim());
      if (origin) origins.add(origin);
    }
  }

  return origins;
}

export function normalizeFrontendBase(candidate, defaultFrontend) {
  const fallback = originFrom(defaultFrontend) || 'http://localhost:5173';
  if (!candidate) return fallback;

  const origin = originFrom(candidate);
  if (!origin) return fallback;

  return allowedOrigins(defaultFrontend).has(origin) ? origin : fallback;
}
