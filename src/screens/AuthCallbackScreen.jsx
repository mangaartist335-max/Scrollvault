import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../lib/api';
import AmbientBackground from '../components/AmbientBackground';

// #region agent log
const debugLogFront = (hyp, msg, data) => {
  fetch('http://127.0.0.1:7396/ingest/ebd3c031-3b02-465b-864f-2114d507da85',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57b68c'},body:JSON.stringify({sessionId:'57b68c',location:'AuthCallback.jsx',message:msg,data,timestamp:Date.now(),hypothesisId:hyp})}).catch(()=>{});
};
// #endregion

export default function AuthCallbackScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash?.replace(/^#/, '') || '';
    const params = new URLSearchParams(hash);
    const token = params.get('token');
    const userRaw = params.get('user');
    const err = params.get('error');

    // #region agent log
    debugLogFront('E', 'AuthCallback loaded', { hash, hasToken: !!token, hasUser: !!userRaw, err });
    // #endregion

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
        // #region agent log
        debugLogFront('E', 'AuthCallback success', { userId: user.id });
        // #endregion
        navigate('/dashboard', { replace: true });
      } catch (e) {
        // #region agent log
        debugLogFront('E', 'AuthCallback parsing error', { error: String(e), userRaw });
        // #endregion
        navigate(`/login?error=${encodeURIComponent('Could not complete sign-in')}`, { replace: true });
      }
      return;
    }
    // #region agent log
    debugLogFront('E', 'AuthCallback missing data', { token, userRaw });
    // #endregion
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <AmbientBackground />
      <p className="relative z-10 text-vault-text-secondary text-center">Completing sign-in…</p>
    </div>
  );
}
