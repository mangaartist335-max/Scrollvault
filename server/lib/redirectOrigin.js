const LOCAL_DEV_ORIGINS = [
  'http://localhost:5173',
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

function splitExtraOrigins(value) {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function allowedFrontendOrigins({
  defaultFrontend = process.env.FRONTEND_URL || 'http://localhost:5173',
  extraOrigins = process.env.OAUTH_REDIRECT_ORIGINS,
} = {}) {
  const origins = new Set();

  const defaultOrigin = normalizeOrigin(defaultFrontend);
  if (defaultOrigin) origins.add(defaultOrigin);

  for (const origin of LOCAL_DEV_ORIGINS) origins.add(origin);

  for (const origin of splitExtraOrigins(extraOrigins)) {
    const normalized = normalizeOrigin(origin);
    if (normalized) origins.add(normalized);
  }

  return origins;
}

export function resolveFrontendBase(
  requestedFrontend,
  {
    defaultFrontend = process.env.FRONTEND_URL || 'http://localhost:5173',
    extraOrigins = process.env.OAUTH_REDIRECT_ORIGINS,
  } = {}
) {
  const fallback = normalizeOrigin(defaultFrontend) || 'http://localhost:5173';
  const requestedOrigin = normalizeOrigin(requestedFrontend);

  if (!requestedOrigin) return fallback;

  const allowedOrigins = allowedFrontendOrigins({ defaultFrontend, extraOrigins });
  return allowedOrigins.has(requestedOrigin) ? requestedOrigin : fallback;
}
