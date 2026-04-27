import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../lib/api';
import AmbientBackground from '../components/AmbientBackground';

/**
 * Captured once at module load (before Strict Mode remount clears window.location.hash).
 * OAuth always lands here via full page redirect, so this is the fragment we must parse.
 */
const SV_OAUTH_FRAGMENT =
  typeof window !== 'undefined' ? (window.location.hash || '').replace(/^#/, '') : '';

/** Survives React 18 Strict Mode (remount) so the OAuth handler does not run twice. */
let __svOauthHandlerStarted = false;

export default function AuthCallbackScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    if (__svOauthHandlerStarted) return;
    __svOauthHandlerStarted = true;

    const effective = SV_OAUTH_FRAGMENT;
    const params = new URLSearchParams(effective);
    const token = params.get('token');
    const userRaw = params.get('user');
    const err = params.get('error');

    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    if (err) {
      navigate(`/login?error=${encodeURIComponent(err)}`, { replace: true });
      return;
    }
    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        setToken(token);
        localStorage.setItem('sv_user', JSON.stringify(user));
        navigate('/dashboard', { replace: true });
      } catch (e) {
        navigate(`/login?error=${encodeURIComponent('Could not complete sign-in')}`, { replace: true });
      }
      return;
    }
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <AmbientBackground />
      <p className="relative z-10 text-vault-text-secondary text-center">Completing sign-in…</p>
    </div>
  );
}
