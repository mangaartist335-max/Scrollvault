const FALLBACK_FRONTEND = 'http://localhost:5173';
const LOCAL_DEV_FRONTENDS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

export function normalizeFrontendBase(value) {
  if (!value || typeof value !== 'string') return null;

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function defaultFrontendBase(env = process.env) {
  return normalizeFrontendBase(env.FRONTEND_URL) || FALLBACK_FRONTEND;
}

export function allowedFrontendBases(env = process.env) {
  const configured = [
    env.FRONTEND_URL,
    ...(env.FRONTEND_URLS || '').split(','),
    ...LOCAL_DEV_FRONTENDS,
  ];

  return new Set(
    configured
      .map((value) => normalizeFrontendBase(value?.trim()))
      .filter(Boolean)
  );
}

export function resolveFrontendBase(returnTo, env = process.env) {
  const requestedBase = normalizeFrontendBase(returnTo);
  if (requestedBase && allowedFrontendBases(env).has(requestedBase)) {
    return requestedBase;
  }

  return defaultFrontendBase(env);
}
