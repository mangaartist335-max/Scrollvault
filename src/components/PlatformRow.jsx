import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, tapScale, badgePop } from '../motion/variants';

const platformIcons = {
  Instagram: '📷',
  TikTok: '🎵',
  'YouTube Shorts': '▶️',
  'Twitter / X': '𝕏',
  Facebook: '👤',
};

const platformKeys = {
  Instagram: 'instagram',
  TikTok: 'tiktok',
  'YouTube Shorts': 'youtube',
  'Twitter / X': 'twitter',
  Facebook: 'facebook',
};

export default function PlatformRow({
  name,
  isBonus,
  connected,
  profileName,
  onConnect,
  onDisconnect,
  connecting,
}) {
  const key = platformKeys[name];
  const isConnected = !!connected;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -2,
        backgroundColor: 'rgba(56, 189, 248, 0.04)',
        borderColor: 'rgba(56, 189, 248, 0.15)',
        transition: { duration: 0.2 },
      }}
      className="flex items-center justify-between px-5 py-4 rounded-xl bg-vault-card border border-transparent transition-colors"
    >
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="relative flex items-center justify-center w-5 h-5">
          {isConnected && (
            <>
              <span className="absolute w-2.5 h-2.5 rounded-full bg-vault-green" />
              <span className="absolute w-2.5 h-2.5 rounded-full bg-vault-green animate-ping opacity-40" />
            </>
          )}
          {!isConnected && <span className="w-2 h-2 rounded-full bg-vault-text-dim/40" />}
        </div>

        <span className="text-lg">{platformIcons[name]}</span>
        <div className="flex flex-col">
          <span className="text-vault-text font-semibold text-[15px]">{name}</span>
          <AnimatePresence>
            {isConnected && profileName && (
              <motion.span
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-vault-text-dim text-xs"
              >
                @{profileName}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isBonus && (
          <motion.span
            variants={badgePop}
            initial="hidden"
            animate="show"
            className="text-[10px] font-bold text-white bg-amber-500 px-2.5 py-1 rounded-md tracking-wide"
          >
            BONUS!
          </motion.span>
        )}

        {isConnected ? (
          <motion.button
            onClick={() => onDisconnect?.(key)}
            whileHover={{ scale: 1.05, borderColor: 'rgba(239,68,68,0.5)' }}
            whileTap={tapScale}
            className="text-xs text-vault-text-dim border border-vault-border-light px-3 py-1.5 rounded-lg hover:text-vault-red hover:border-vault-red/30 transition-colors cursor-pointer"
          >
            Disconnect
          </motion.button>
        ) : (
          <motion.button
            onClick={() => onConnect?.(key)}
            disabled={connecting === key}
            whileHover={{ scale: 1.05, boxShadow: '0 0 12px -3px rgba(56,189,248,0.3)' }}
            whileTap={tapScale}
            className="text-xs text-vault-cyan border border-vault-cyan/30 px-3 py-1.5 rounded-lg hover:bg-vault-cyan/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
          >
            {connecting === key ? 'Connecting...' : 'Connect'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}