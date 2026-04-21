import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import supabase from '../db.js';
import auth from '../middleware/auth.js';

const router = Router();

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
const BASE = 'http://localhost:' + (process.env.PORT || 3001);

// ─── Platform-specific OAuth configs ────────────────────────────────

const platformConfigs = {
  instagram: {
    authorizeUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    profileUrl: 'https://graph.instagram.com/me?fields=id,username&access_token=',
    scope: 'user_profile',
    clientId: () => process.env.META_APP_ID,
    clientSecret: () => process.env.META_APP_SECRET,
    callbackPath: '/api/oauth/instagram/callback',
    parseProfile: (data) => ({ id: data.id, name: data.username || data.name }),
  },

  facebook: {
    authorizeUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    profileUrl: 'https://graph.facebook.com/me?fields=id,name&access_token=',
    scope: 'public_profile,email',
    clientId: () => process.env.META_APP_ID,
    clientSecret: () => process.env.META_APP_SECRET,
    callbackPath: '/api/oauth/facebook/callback',
    parseProfile: (data) => ({ id: data.id, name: data.name }),
  },

  youtube: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    profileUrl: null, // uses separate fetch
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    callbackPath: '/api/oauth/youtube/callback',
    extraAuthParams: { access_type: 'offline', prompt: 'consent' },
    parseProfile: (data) => ({
      id: data.items?.[0]?.id,
      name: data.items?.[0]?.snippet?.title,
    }),
  },

  tiktok: {
    authorizeUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    profileUrl: null,
    scope: 'user.info.basic',
    clientId: () => process.env.TIKTOK_CLIENT_KEY,
    clientSecret: () => process.env.TIKTOK_CLIENT_SECRET,
    callbackPath: '/api/oauth/tiktok/callback',
    usePKCE: true,
    parseProfile: (data) => ({
      id: data.data?.user?.open_id,
      name: data.data?.user?.display_name,
    }),
  },

  twitter: {
    authorizeUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.x.com/2/oauth2/token',
    profileUrl: 'https://api.x.com/2/users/me',
    scope: 'tweet.read users.read offline.access',
    clientId: () => process.env.TWITTER_CLIENT_ID,
    clientSecret: () => process.env.TWITTER_CLIENT_SECRET,
    callbackPath: '/api/oauth/twitter/callback',
    usePKCE: true,
    parseProfile: (data) => ({ id: data.data?.id, name: data.data?.username }),
  },
};

// Store PKCE verifiers and state-to-userId mappings temporarily in memory.
// In production, use Redis or a database-backed session store.
const pendingStates = new Map();

// ─── Helper: extract userId from state token ────────────────────────

function createState(userId, platform) {
  const state = crypto.randomBytes(24).toString('hex');
  pendingStates.set(state, { userId, platform, createdAt: Date.now() });
  // Clean up stale states older than 10 minutes
  for (const [k, v] of pendingStates) {
    if (Date.now() - v.createdAt > 600_000) pendingStates.delete(k);
  }
  return state;
}

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

// ─── GET /api/oauth/status ──────────────────────────────────────────

router.get('/status', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('linked_accounts')
      .select('platform, profile_name, connected_at')
      .eq('user_id', req.userId);

    if (error) throw error;

    const status = {};
    for (const row of data || []) {
      status[row.platform] = { profileName: row.profile_name, connectedAt: row.connected_at };
    }
    res.json({ connected: status });
  } catch (err) {
    console.error('OAuth status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/oauth/:platform/connect ───────────────────────────────

router.get('/:platform/connect', auth, async (req, res) => {
  const { platform } = req.params;
  const config = platformConfigs[platform];
  if (!config) return res.status(400).json({ error: 'Unsupported platform' });

  const state = createState(req.userId, platform);
  const redirectUri = BASE + config.callbackPath;

  const params = new URLSearchParams({
    client_key: platform === 'tiktok' ? config.clientId() : undefined,
    client_id: platform !== 'tiktok' ? config.clientId() : undefined,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
    ...(config.extraAuthParams || {}),
  });

  // Remove undefined params
  for (const [k, v] of params) {
    if (v === 'undefined' || v === undefined) params.delete(k);
  }

  // PKCE for Twitter
  if (config.usePKCE) {
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    pendingStates.get(state).codeVerifier = verifier;
    params.set('code_challenge', challenge);
    params.set('code_challenge_method', 'S256');
  }

  const url = `${config.authorizeUrl}?${params.toString()}`;
  res.json({ url });
});

// ─── GET /api/oauth/:platform/callback ──────────────────────────────

router.get('/:platform/callback', async (req, res) => {
  const { platform } = req.params;
  const { code, state } = req.query;
  const config = platformConfigs[platform];

  if (!config || !code || !state) {
    return res.redirect(`${FRONTEND}/dashboard?oauth_error=invalid_request`);
  }

  const pending = pendingStates.get(state);
  if (!pending || pending.platform !== platform) {
    return res.redirect(`${FRONTEND}/dashboard?oauth_error=invalid_state`);
  }
  pendingStates.delete(state);

  const redirectUri = BASE + config.callbackPath;

  try {
    // ── Exchange code for token ──
    let tokenData;

    if (platform === 'tiktok') {
      const tokenRes = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: config.clientId(),
          client_secret: config.clientSecret(),
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code_verifier: pending.codeVerifier,
        }),
      });
      tokenData = await tokenRes.json();
    } else if (platform === 'twitter') {
      const basicAuth = Buffer.from(`${config.clientId()}:${config.clientSecret()}`).toString('base64');
      const tokenRes = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code_verifier: pending.codeVerifier,
        }),
      });
      tokenData = await tokenRes.json();
    } else {
      // Meta (Instagram/Facebook) and Google (YouTube)
      const tokenRes = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId(),
          client_secret: config.clientSecret(),
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });
      tokenData = await tokenRes.json();
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token || null;

    if (!accessToken) {
      console.error(`OAuth token error for ${platform}:`, tokenData);
      return res.redirect(`${FRONTEND}/dashboard?oauth_error=token_failed`);
    }

    // ── Fetch profile ──
    let profile;

    if (platform === 'youtube') {
      const profileRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const profileData = await profileRes.json();
      profile = config.parseProfile(profileData);
    } else if (platform === 'tiktok') {
      const profileRes = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const profileData = await profileRes.json();
      profile = config.parseProfile(profileData);
    } else if (platform === 'twitter') {
      const profileRes = await fetch(config.profileUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profileData = await profileRes.json();
      profile = config.parseProfile(profileData);
    } else {
      // Instagram or Facebook
      const profileRes = await fetch(config.profileUrl + accessToken);
      const profileData = await profileRes.json();
      profile = config.parseProfile(profileData);
    }

    // ── Upsert linked account ──
    const { error } = await supabase
      .from('linked_accounts')
      .upsert(
        {
          user_id: pending.userId,
          platform,
          platform_user_id: profile.id || 'unknown',
          access_token: accessToken,
          refresh_token: refreshToken,
          profile_name: profile.name || platform,
          connected_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,platform' }
      );

    if (error) throw error;

    res.redirect(`${FRONTEND}/dashboard?oauth_success=${platform}`);
  } catch (err) {
    console.error(`OAuth callback error for ${platform}:`, err);
    res.redirect(`${FRONTEND}/dashboard?oauth_error=server_error`);
  }
});

// ─── DELETE /api/oauth/:platform/disconnect ─────────────────────────

router.delete('/:platform/disconnect', auth, async (req, res) => {
  const { platform } = req.params;

  try {
    const { error } = await supabase
      .from('linked_accounts')
      .delete()
      .eq('user_id', req.userId)
      .eq('platform', platform);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Disconnect error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;