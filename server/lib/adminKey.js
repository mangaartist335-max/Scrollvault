export function adminKeyFromRequest(req) {
  return req.headers?.['x-admin-key'];
}
