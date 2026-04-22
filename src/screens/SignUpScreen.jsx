import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedInput from '../components/AnimatedInput';
import AmbientBackground from '../components/AmbientBackground';
import { apiSignUp, API_BASE } from '../lib/api';
import {
  staggerContainer,
  fadeUp,
  fadeIn,
  lockRotate,
  expandFromCenter,
  tapScale,
  pageVariants,
} from '../motion/variants';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!name || !email || !password) return;
    setLoading(true);
    setError('');
    try {
      await apiSignUp(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Sign up failed');
      setLoading(false);
    }
  };

  const handleSocial = async (provider) => {
    const returnTo = encodeURIComponent(window.location.origin);
    window.location.href = `${API_BASE}/api/auth/${provider}?from=signup&returnTo=${returnTo}`;
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
        variants={staggerContainer(0.07, 0.1)}
        initial="hidden"
        animate="show"
      >
        {/* Logo */}
        <motion.div className="text-center mb-8" variants={fadeUp}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-4xl font-black text-vault-cyan">ScrollVault</h1>
            <motion.span className="text-3xl" variants={lockRotate} initial="hidden" animate="show">
              🔒
            </motion.span>
          </div>
          <motion.p className="text-vault-text-secondary text-base" variants={fadeIn}>
            Create your vault in seconds.
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.div variants={fadeUp}>
          <AnimatedInput
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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

          <motion.button
            onClick={handleSignUp}
            disabled={loading}
            whileHover={
              loading
                ? {}
                : { scale: 1.02, y: -1, boxShadow: '0 0 25px -4px rgba(16,185,129,0.35)' }
            }
            whileTap={loading ? {} : tapScale}
            className="relative w-full py-4 rounded-xl bg-vault-green text-white font-extrabold text-lg overflow-hidden cursor-pointer disabled:cursor-wait transition-colors"
          >
            {loading && (
              <motion.div
                className="absolute inset-0 bg-emerald-400"
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative z-10">
              {loading ? 'Creating Vault...' : 'Create Account'}
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
        <motion.div className="flex items-center gap-4 my-6" variants={fadeUp}>
          <motion.div className="flex-1 h-px bg-vault-border-light origin-left" variants={expandFromCenter} />
          <span className="text-vault-text-dim text-sm">or sign up with</span>
          <motion.div className="flex-1 h-px bg-vault-border-light origin-right" variants={expandFromCenter} />
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

        <motion.p className="text-center text-sm" variants={fadeIn}>
          <span className="text-vault-text-dim">Already have an account? </span>
          <button
            onClick={() => navigate('/login')}
            className="text-vault-cyan font-bold hover:underline cursor-pointer"
          >
            Log In
          </button>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}