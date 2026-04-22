import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AnimatedInput from '../components/AnimatedInput';
import AmbientBackground from '../components/AmbientBackground';
import { apiLogin, API_BASE } from '../lib/api';
import {
  staggerContainer,
  fadeUp,
  fadeIn,
  lockRotate,
  expandFromCenter,
  tapScale,
  pageVariants,
} from '../motion/variants';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Show redirect errors coming from OAuth callback route.
  useEffect(() => {
    const qpError = searchParams.get('error');
    if (qpError) setError(qpError);
  }, [searchParams]);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await apiLogin(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleSocial = async (provider) => {
    const returnTo = encodeURIComponent(window.location.origin);
    window.location.href = `${API_BASE}/api/auth/${provider}?from=login&returnTo=${returnTo}`;
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AmbientBackground />

      <motion.div
        className="w-full max-w-md"
        variants={staggerContainer(0.08, 0.15)}
        initial="hidden"
        animate="show"
      >
        {/* Logo */}
        <motion.div className="text-center mb-10" variants={fadeUp}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.h1 className="text-4xl font-black text-vault-cyan">
              ScrollVault
            </motion.h1>
            <motion.span
              className="text-3xl"
              variants={lockRotate}
              initial="hidden"
              animate="show"
            >
              🔒
            </motion.span>
          </div>
          <motion.p
            className="text-vault-text-secondary text-base"
            variants={fadeIn}
          >
            Your doom scrolling pays off.
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.div variants={fadeUp}>
          <AnimatedInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AnimatedInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Login button */}
          <motion.button
            onClick={handleLogin}
            disabled={loading}
            whileHover={
              loading
                ? {}
                : { scale: 1.02, y: -1, boxShadow: '0 0 25px -4px rgba(56,189,248,0.35)' }
            }
            whileTap={loading ? {} : tapScale}
            className="relative w-full py-4 rounded-xl bg-vault-cyan text-vault-bg font-extrabold text-lg overflow-hidden cursor-pointer disabled:cursor-wait transition-colors"
          >
            {/* Loading fill animation */}
            {loading && (
              <motion.div
                className="absolute inset-0 bg-sky-400"
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative z-10">
              {loading ? 'Unlocking Vault...' : 'Log In'}
            </span>
          </motion.button>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-vault-red text-sm text-center mt-3"
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* Divider */}
        <motion.div
          className="flex items-center gap-4 my-6"
          variants={fadeUp}
        >
          <motion.div
            className="flex-1 h-px bg-vault-border-light origin-left"
            variants={expandFromCenter}
          />
          <span className="text-vault-text-dim text-sm">or continue with</span>
          <motion.div
            className="flex-1 h-px bg-vault-border-light origin-right"
            variants={expandFromCenter}
          />
        </motion.div>

        {/* Social buttons */}
        <motion.div className="flex gap-3 mb-8" variants={fadeUp}>
          {[
            { name: 'Google', icon: 'G', cls: 'border-vault-border-light hover:border-vault-cyan/30' },
            { name: 'Facebook', icon: 'f', cls: 'bg-vault-facebook hover:brightness-110' },
            { name: 'Twitter', icon: '𝕏', cls: 'border-vault-border-light hover:border-vault-cyan/30' },
            { name: 'TikTok', icon: '♪', cls: 'border-vault-border-light hover:border-vault-cyan/30' },
          ].map((s) => (
            <motion.button
              key={s.name}
              onClick={() => handleSocial(s.name.toLowerCase())}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              whileTap={tapScale}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold text-vault-text transition-all cursor-pointer ${s.cls}`}
            >
              <span className="font-black text-base">{s.icon}</span>
              {s.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Switch to signup */}
        <motion.p className="text-center text-sm" variants={fadeIn}>
          <span className="text-vault-text-dim">Don't have an account? </span>
          <button
            onClick={() => navigate('/signup')}
            className="text-vault-cyan font-bold hover:underline cursor-pointer"
          >
            Sign Up
          </button>
        </motion.p>

        {/* Footer links */}
        <motion.div className="mt-8 text-center text-xs text-vault-text-dim" variants={fadeIn}>
          <button onClick={() => navigate('/privacy')} className="hover:text-vault-cyan transition-colors cursor-pointer">
            Privacy Policy
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}