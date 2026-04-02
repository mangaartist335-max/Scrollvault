import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AmbientBackground from '../components/AmbientBackground';
import VaultCard from '../components/VaultCard';
import ProgressBar from '../components/ProgressBar';
import PlatformRow from '../components/PlatformRow';
import ConfirmModal from '../components/ConfirmModal';
import {
  apiGetBalance,
  apiResetBalance,
  apiGetOAuthStatus,
  apiConnectPlatform,
  apiDisconnectPlatform,
  clearToken,
} from '../lib/api';
import {
  staggerContainer,
  fadeUp,
  fadeIn,
  tapScale,
  pageVariants,
} from '../motion/variants';

const PLATFORMS = [
  { name: 'Instagram', isBonus: false },
  { name: 'TikTok', isBonus: true },
  { name: 'YouTube Shorts', isBonus: false },
  { name: 'Twitter / X', isBonus: false },
  { name: 'Facebook', isBonus: false },
];

const platformKeyMap = {
  Instagram: 'instagram',
  TikTok: 'tiktok',
  'YouTube Shorts': 'youtube',
  'Twitter / X': 'twitter',
  Facebook: 'facebook',
};

const MAX_BALANCE = 20;

export default function DashboardScreen() {
  const [balance, setBalance] = useState(0);
  const [floatingEarnings, setFloatingEarnings] = useState([]);
  const [showReset, setShowReset] = useState(false);
  const [user, setUser] = useState(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState({});
  const [connecting, setConnecting] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load user from localStorage (set during login/signup API call)
  useEffect(() => {
    const data = localStorage.getItem('sv_user');
    if (data) {
      setUser(JSON.parse(data));
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Fetch balance from backend
  const fetchBalance = useCallback(async () => {
    try {
      const data = await apiGetBalance();
      setBalance(data.balance);
    } catch {
      // Token expired or server down — fall back silently
    }
  }, []);

  // Fetch connected platforms
  const fetchOAuthStatus = useCallback(async () => {
    try {
      const data = await apiGetOAuthStatus();
      setConnectedPlatforms(data.connected || {});
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchOAuthStatus();
  }, [fetchBalance, fetchOAuthStatus]);

  // Poll balance every 5 seconds to pick up extension-reported earnings
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await apiGetBalance();
        if (data.balance !== balance) {
          const earned = data.balance - balance;
          if (earned > 0) {
            const id = Date.now();
            setFloatingEarnings((f) => [...f, { id, amount: earned }]);
            setTimeout(() => {
              setFloatingEarnings((f) => f.filter((e) => e.id !== id));
            }, 1500);
          }
          setBalance(data.balance);
        }
      } catch {
        // Silently fail
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [balance]);

  // Handle OAuth redirect success/error
  useEffect(() => {
    const success = searchParams.get('oauth_success');
    const error = searchParams.get('oauth_error');
    if (success || error) {
      // Clean up URL params
      setSearchParams({}, { replace: true });
      if (success) fetchOAuthStatus();
    }
  }, [searchParams, setSearchParams, fetchOAuthStatus]);

  const handleConnect = useCallback(async (platform) => {
    setConnecting(platform);
    try {
      const url = await apiConnectPlatform(platform);
      // Open OAuth in a popup window
      const popup = window.open(url, `Connect ${platform}`, 'width=600,height=700,left=200,top=100');

      // Poll for popup close, then refresh status
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setConnecting(null);
          fetchOAuthStatus();
          fetchBalance();
        }
      }, 500);
    } catch {
      setConnecting(null);
    }
  }, [fetchOAuthStatus, fetchBalance]);

  const handleDisconnect = useCallback(async (platform) => {
    try {
      await apiDisconnectPlatform(platform);
      setConnectedPlatforms((prev) => {
        const next = { ...prev };
        delete next[platform];
        return next;
      });
    } catch {
      // Silently fail
    }
  }, []);

  const handleReset = useCallback(async () => {
    try {
      await apiResetBalance();
      setBalance(0);
    } catch {
      // Silently fail
    }
    setShowReset(false);
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    navigate('/login', { replace: true });
  }, [navigate]);

  const displayName = user?.name || user?.email?.split('@')[0] || 'Scroller';

  return (
    <motion.div
      className="min-h-screen relative"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AmbientBackground />

      <div className="max-w-lg mx-auto px-5 py-8">
        <motion.div
          variants={staggerContainer(0.08, 0.05)}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          {/* Header */}
          <motion.div
            className="flex items-center justify-between"
            variants={fadeUp}
          >
            <div>
              <motion.p
                className="text-vault-text-secondary text-sm"
                variants={fadeIn}
              >
                Welcome back,
              </motion.p>
              <motion.h1
                className="text-2xl font-extrabold text-vault-text"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {displayName}
              </motion.h1>
            </div>
            <motion.button
              onClick={handleLogout}
              whileHover={{
                borderColor: 'rgba(148, 163, 184, 0.6)',
                boxShadow: '0 0 12px -4px rgba(148, 163, 184, 0.2)',
                y: -1,
              }}
              whileTap={tapScale}
              className="py-2 px-4 rounded-lg border border-vault-border-light text-vault-text-secondary text-sm font-semibold cursor-pointer transition-colors"
            >
              Log Out
            </motion.button>
          </motion.div>

          {/* Vault Card */}
          <motion.div variants={fadeUp}>
            <VaultCard
              balance={balance}
              maxBalance={MAX_BALANCE}
              floatingEarnings={floatingEarnings}
            />
          </motion.div>

          {/* Progress Bar */}
          <motion.div variants={fadeUp}>
            <ProgressBar value={balance} max={MAX_BALANCE} />
          </motion.div>

          {/* Platform List */}
          <motion.div variants={fadeUp}>
            <motion.h3
              className="text-xs font-bold text-vault-text-secondary tracking-widest uppercase mb-3 ml-1"
              variants={fadeIn}
            >
              Supported Platforms:
            </motion.h3>
            <motion.div
              className="flex flex-col gap-2"
              variants={staggerContainer(0.06, 0)}
              initial="hidden"
              animate="show"
            >
              {PLATFORMS.map((p) => {
                const key = platformKeyMap[p.name];
                const conn = connectedPlatforms[key];
                return (
                  <PlatformRow
                    key={p.name}
                    name={p.name}
                    isBonus={p.isBonus}
                    connected={!!conn}
                    profileName={conn?.profileName}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    connecting={connecting}
                  />
                );
              })}
            </motion.div>
          </motion.div>

          {/* Reset Button */}
          <motion.div variants={fadeUp}>
            <motion.button
              onClick={() => setShowReset(true)}
              whileHover={{
                y: -1,
                borderColor: 'rgba(239, 68, 68, 0.6)',
                boxShadow: '0 0 20px -4px rgba(239, 68, 68, 0.25)',
              }}
              whileTap={tapScale}
              className="w-full py-4 rounded-xl border-2 border-vault-red/40 text-vault-red font-bold text-base cursor-pointer transition-colors hover:bg-vault-red/5"
            >
              Reset Vault
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <ConfirmModal
        isOpen={showReset}
        onConfirm={handleReset}
        onCancel={() => setShowReset(false)}
      />
    </motion.div>
  );
}