const DEFAULT_LOCAL_FRONTEND = 'http://localhost:5173';
const LOCAL_FRONTEND_ORIGINS = [
  DEFAULT_LOCAL_FRONTEND,
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

function normalizeOrigin(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

function splitOrigins(value) {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((entry) => normalizeOrigin(entry.trim()))
    .filter(Boolean);
}

export function allowedFrontendOrigins(env = process.env) {
  return new Set([
    ...LOCAL_FRONTEND_ORIGINS,
    ...splitOrigins(env.FRONTEND_URL),
    ...splitOrigins(env.FRONTEND_URLS),
  ]);
}

export function defaultFrontendOrigin(env = process.env) {
  return normalizeOrigin(env.FRONTEND_URL) || DEFAULT_LOCAL_FRONTEND;
}

export function resolveFrontendBase(returnTo, env = process.env) {
  const requested = normalizeOrigin(returnTo);
  if (requested && allowedFrontendOrigins(env).has(requested)) {
    return requested;
  }
  return defaultFrontendOrigin(env);
}
