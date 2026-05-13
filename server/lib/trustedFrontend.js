const DEFAULT_FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

const LOCAL_FRONTEND_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

function normalizeOrigin(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

function splitOriginList(value) {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function allowedFrontendOrigins({
  defaultFrontend = DEFAULT_FRONTEND,
  extraAllowedOrigins =
    process.env.OAUTH_ALLOWED_RETURN_ORIGINS || process.env.ALLOWED_FRONTEND_ORIGINS || '',
} = {}) {
  const origins = new Set(LOCAL_FRONTEND_ORIGINS);
  const defaultOrigin = normalizeOrigin(defaultFrontend);
  if (defaultOrigin) origins.add(defaultOrigin);

  for (const origin of splitOriginList(extraAllowedOrigins)) {
    const normalized = normalizeOrigin(origin);
    if (normalized) origins.add(normalized);
  }

  return origins;
}

export function getTrustedFrontendOrigin(returnTo, options = {}) {
  const fallback =
    normalizeOrigin(options.defaultFrontend ?? DEFAULT_FRONTEND) || 'http://localhost:5173';
  const requested = normalizeOrigin(returnTo);

  if (requested && allowedFrontendOrigins(options).has(requested)) {
    return requested;
  }

  return fallback;
}
