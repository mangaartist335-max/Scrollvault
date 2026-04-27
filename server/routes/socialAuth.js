import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../db.js';

const router = Router();

const DEFAULT_FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

/** In-memory OAuth state for sign-in (no logged-in user yet). */
const pending = new Map();

function publicBaseUrl(req) {
  if (process.env.PUBLIC_BACKEND_URL) {
    return process.env.PUBLIC_BACKEND_URL.replace(/\/$/, '');
  }
  const host = req.get('host');
  const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
  return `${proto}://${host}`;
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function createState(provider, extra = {}) {
  const state = crypto.randomBytes(24).toString('hex');
  pending.set(state, { provider, createdAt: Date.now(), ...extra });
  for (const [k, v] of pending) {
    if (Date.now() - v.createdAt > 600_000) pending.delete(k);
  }
  return state;
}

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

async function findOrCreateUser({ email, name }) {
  const normalized = email.toLowerCase();
  const { data: existing } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('email', normalized)
    .maybeSingle();

  if (existing) {
    console.log('[findOrCreateUser] existing user found, attempting update with email_verified');
    const { error: verifyErr } = await supabase.from('users').update({ email_verified: true }).eq('id', existing.id);
    console.log('[findOrCreateUser] update result:', { verifyErr });
    if (verifyErr && verifyErr.code !== 'PGRST204') {
      throw verifyErr;
    }
    // If it is PGRST204, we ignore it and return the user
    if (verifyErr && verifyErr.code === 'PGRST204') {
        console.log('[findOrCreateUser] ignoring PGRST204 on update');
    }
    return existing;
  }

  const password_hash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
  const displayName = name?.trim() || normalized.split('@')[0];

  let user;
  let error;
  console.log('[findOrCreateUser] attempting insert with email_verified');
  ({ data: user, error } = await supabase
    .from('users')
    .insert({ email: normalized, password_hash, name: displayName, email_verified: true })
    .select('id, email, name')
    .single());

  console.log('[findOrCreateUser] first insert result:', { hasUser: !!user, error });

  // Backward-compatible path: DB may not yet have email_verified column.
  if (error?.code === 'PGRST204') {
    console.log('[findOrCreateUser] attempting fallback insert');
    ({ data: user, error } = await supabase
      .from('users')
      .insert({ email: normalized, password_hash, name: displayName })
      .select('id, email, name')
      .single());
    console.log('[findOrCreateUser] fallback insert result:', { hasUser: !!user, error });
  }

  if (error) {
    if (error.code === '23505') {
      const { data: again } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', normalized)
        .single();
      if (again) return again;
    }
    throw error;
  }

  await supabase.from('balances').insert({ user_id: user.id, amount: 0 });
  return user;
}

function redirectWithToken(res, frontendBase, token, user) {
  const userJson = encodeURIComponent(JSON.stringify(user));
  res.redirect(`${frontendBase}/auth/callback#token=${encodeURIComponent(token)}&user=${userJson}`);
}

function redirectError(res, frontendBase, message) {
  res.redirect(`${frontendBase}/auth/callback#error=${encodeURIComponent(message)}`);
}

function redirectConfigError(res, frontendBase, message, from = 'signup') {
  const path = from === 'login' ? 'login' : 'signup';
  res.redirect(`${frontendBase}/${path}?social_error=${encodeURIComponent(message)}`);
}

// ─── Google ─────────────────────────────────────────────────────────

router.get('/google', (req, res) => {
  const fromPage = req.query.from === 'login' ? 'login' : 'signup';
  const frontendBase = req.query.returnTo || DEFAULT_FRONTEND;
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !secret) {
    return redirectConfigError(res, frontendBase, 'Google sign-in is not configured on the server.', fromPage);
  }

  const state = createState('google', { fromPage, frontendBase });
  const redirectUri = `${publicBaseUrl(req)}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: id,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'offline',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  console.log('[google/callback] hit', { hasCode: !!code, hasState: !!state });
  if (!code || !state) return redirectError(res, DEFAULT_FRONTEND, 'Missing code or state');

  const rec = pending.get(state);
  console.log('[google/callback] pending lookup', { found: !!rec, provider: rec?.provider, pendingSize: pending.size });
  pending.delete(state);
  if (!rec || rec.provider !== 'google') {
    console.log('[google/callback] invalid session');
    return redirectError(res, DEFAULT_FRONTEND, 'Invalid or expired session');
  }
  const frontendBase = rec.frontendBase || DEFAULT_FRONTEND;

  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${publicBaseUrl(req)}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: id,
        client_secret: secret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenRes.json();
    console.log('[google/callback] token response', { ok: tokenRes.ok, hasAccessToken: !!tokenData.access_token, error: tokenData.error });
    if (!tokenData.access_token) {
      console.error('Google token exchange:', tokenData);
      return redirectError(res, frontendBase, 'Could not sign in with Google');
    }

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();
    console.log('[google/callback] profile response', { ok: profileRes.ok, hasEmail: !!profile.email });
    const email = profile.email;
    if (!email) return redirectError(res, frontendBase, 'Google did not return an email for this account');

    const user = await findOrCreateUser({
      email,
      name: profile.name || profile.given_name,
    });
    const token = signToken(user.id);
    redirectWithToken(res, frontendBase, token, user);
  } catch (err) {
    console.error('Google callback:', err);
    const causeCode = err?.cause?.code;
    const isNetwork =
      err?.message === 'fetch failed' ||
      String(err).includes('fetch failed') ||
      ['ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET'].includes(causeCode);
    const msg = isNetwork
      ? 'Could not reach the database. Check your connection or Supabase settings.'
      : 'Sign-in failed';
    redirectError(res, frontendBase || DEFAULT_FRONTEND, msg);
  }
});

// ─── Facebook (Meta) ────────────────────────────────────────────────

router.get('/facebook', (req, res) => {
  const fromPage = req.query.from === 'login' ? 'login' : 'signup';
  const frontendBase = req.query.returnTo || DEFAULT_FRONTEND;
  const id = process.env.META_APP_ID;
  const secret = process.env.META_APP_SECRET;
  if (!id || !secret) {
    return redirectConfigError(res, frontendBase, 'Facebook sign-in is not configured on the server.', fromPage);
  }

  const state = createState('facebook', { fromPage, frontendBase });
  const redirectUri = `${publicBaseUrl(req)}/api/auth/facebook/callback`;
  const params = new URLSearchParams({
    client_id: id,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email,public_profile',
    state,
  });
  res.redirect(`https://www.facebook.com/v21.0/dialog/oauth?${params}`);
});

router.get('/facebook/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) return redirectError(res, DEFAULT_FRONTEND, 'Missing code or state');

  const rec = pending.get(state);
  pending.delete(state);
  if (!rec || rec.provider !== 'facebook') return redirectError(res, DEFAULT_FRONTEND, 'Invalid or expired session');
  const frontendBase = rec.frontendBase || DEFAULT_FRONTEND;

  const id = process.env.META_APP_ID;
  const secret = process.env.META_APP_SECRET;
  const redirectUri = `${publicBaseUrl(req)}/api/auth/facebook/callback`;

  try {
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?${new URLSearchParams({
        client_id: id,
        client_secret: secret,
        redirect_uri: redirectUri,
        code,
      })}`
    );
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Facebook token:', tokenData);
      return redirectError(res, frontendBase, 'Could not sign in with Facebook');
    }

    const profileRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`
    );
    const profile = await profileRes.json();
    let email = profile.email;
    if (!email) {
      email = `facebook_${profile.id}@oauth.scrollvault.invalid`;
    }

    const user = await findOrCreateUser({
      email,
      name: profile.name,
    });
    const token = signToken(user.id);
    redirectWithToken(res, frontendBase, token, user);
  } catch (err) {
    console.error('Facebook callback:', err);
    redirectError(res, frontendBase || DEFAULT_FRONTEND, 'Sign-in failed');
  }
});

// ─── Twitter / X ──────────────────────────────────────────────────────

router.get('/twitter', (req, res) => {
  const fromPage = req.query.from === 'login' ? 'login' : 'signup';
  const frontendBase = req.query.returnTo || DEFAULT_FRONTEND;
  const id = process.env.TWITTER_CLIENT_ID;
  const secret = process.env.TWITTER_CLIENT_SECRET;
  if (!id || !secret) {
    return redirectConfigError(res, frontendBase, 'X (Twitter) sign-in is not configured on the server.', fromPage);
  }

  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const state = createState('twitter', { codeVerifier: verifier, fromPage, frontendBase });
  const redirectUri = `${publicBaseUrl(req)}/api/auth/twitter/callback`;
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: id,
    redirect_uri: redirectUri,
    scope: 'tweet.read users.read offline.access',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  res.redirect(`https://twitter.com/i/oauth2/authorize?${params}`);
});

router.get('/twitter/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) return redirectError(res, DEFAULT_FRONTEND, 'Missing code or state');

  const rec = pending.get(state);
  pending.delete(state);
  if (!rec || rec.provider !== 'twitter' || !rec.codeVerifier) {
    return redirectError(res, DEFAULT_FRONTEND, 'Invalid or expired session');
  }
  const frontendBase = rec.frontendBase || DEFAULT_FRONTEND;

  const id = process.env.TWITTER_CLIENT_ID;
  const secret = process.env.TWITTER_CLIENT_SECRET;
  const redirectUri = `${publicBaseUrl(req)}/api/auth/twitter/callback`;
  const basicAuth = Buffer.from(`${id}:${secret}`).toString('base64');

  try {
    const tokenRes = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: rec.codeVerifier,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Twitter token:', tokenData);
      return redirectError(res, frontendBase, 'Could not sign in with X');
    }

    const profileRes = await fetch('https://api.x.com/2/users/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData = await profileRes.json();
    const tw = profileData.data;
    if (!tw?.id) return redirectError(res, frontendBase, 'Could not read X profile');

    const email = `twitter_${tw.id}@oauth.scrollvault.invalid`;
    const user = await findOrCreateUser({
      email,
      name: tw.username ? `@${tw.username}` : tw.name,
    });
    const token = signToken(user.id);
    redirectWithToken(res, frontendBase, token, user);
  } catch (err) {
    console.error('Twitter callback:', err);
    redirectError(res, frontendBase || DEFAULT_FRONTEND, 'Sign-in failed');
  }
});

// ─── TikTok ──────────────────────────────────────────────────────────

router.get('/tiktok', (req, res) => {
  const fromPage = req.query.from === 'login' ? 'login' : 'signup';
  const frontendBase = req.query.returnTo || DEFAULT_FRONTEND;
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) {
    return redirectConfigError(res, frontendBase, 'TikTok sign-in is not configured on the server.', fromPage);
  }

  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const state = createState('tiktok', { codeVerifier: verifier, fromPage, frontendBase });
  const redirectUri = `${publicBaseUrl(req)}/api/auth/tiktok/callback`;
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: 'code',
    scope: 'user.info.basic',
    redirect_uri: redirectUri,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  res.redirect(`https://www.tiktok.com/v2/auth/authorize/?${params}`);
});

router.get('/tiktok/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) return redirectError(res, DEFAULT_FRONTEND, 'Missing code or state');

  const rec = pending.get(state);
  pending.delete(state);
  if (!rec || rec.provider !== 'tiktok' || !rec.codeVerifier) {
    return redirectError(res, DEFAULT_FRONTEND, 'Invalid or expired session');
  }
  const frontendBase = rec.frontendBase || DEFAULT_FRONTEND;

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = `${publicBaseUrl(req)}/api/auth/tiktok/callback`;

  try {
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: rec.codeVerifier,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('TikTok token:', tokenData);
      return redirectError(res, frontendBase, 'Could not sign in with TikTok');
    }

    const profileRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const profileData = await profileRes.json();
    const tt = profileData.data?.user;
    if (!tt?.open_id) return redirectError(res, frontendBase, 'Could not read TikTok profile');

    const email = `tiktok_${tt.open_id}@oauth.scrollvault.invalid`;
    const user = await findOrCreateUser({
      email,
      name: tt.display_name || `TikTok User`,
    });
    const token = signToken(user.id);
    redirectWithToken(res, frontendBase, token, user);
  } catch (err) {
    console.error('TikTok callback:', err);
    redirectError(res, frontendBase || DEFAULT_FRONTEND, 'Sign-in failed');
  }
});

export default router;
