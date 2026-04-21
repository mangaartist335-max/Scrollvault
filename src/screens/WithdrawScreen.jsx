import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedInput from '../components/AnimatedInput';
import AmbientBackground from '../components/AmbientBackground';
import { apiGetBalance, apiWithdraw } from '../lib/api';
import {
  staggerContainer,
  fadeUp,
  fadeIn,
  tapScale,
  pageVariants,
} from '../motion/variants';

const PAYOUT_METHODS = [
  'PayPal',
  'TD Bank',
  'BMO',
  'PNC Bank',
  'Chase Bank',
  'Capital One 360',
  'Bank of America',
  'Republic Bank'
];

export default function WithdrawScreen() {
  const [balance, setBalance] = useState(0);
  const [method, setMethod] = useState('PayPal');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiGetBalance()
      .then((data) => {
        setBalance(data.balance);
        setAmount(data.balance.toString()); // default to max amount
      })
      .catch(() => {});
  }, []);

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (numAmount < 10) {
      setError('Minimum withdrawal is $10.00.');
      return;
    }
    if (numAmount > balance) {
      setError('Insufficient balance.');
      return;
    }
    if (!details.trim()) {
      setError('Please enter your account details/email.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await apiWithdraw(numAmount, method, details);
      setSuccess(true);
      setBalance(b => b - numAmount);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 3000);
    } catch (err) {
      setError(err.message || 'Withdrawal failed. Try again.');
      setLoading(false);
    }
  };

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
          <motion.div className="flex items-center justify-between mb-4" variants={fadeUp}>
            <div>
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="text-vault-text-secondary text-sm font-semibold hover:text-vault-cyan transition-colors mb-2 block cursor-pointer"
              >
                ← Back to Dashboard
              </motion.button>
              <h1 className="text-3xl font-extrabold text-vault-text">
                Withdraw Funds
              </h1>
              <p className="text-vault-text-secondary">
                Current Balance: <span className="text-vault-green font-bold">${balance.toFixed(2)}</span>
              </p>
            </div>
          </motion.div>

          {success ? (
             <motion.div variants={fadeUp} className="bg-vault-green/10 border border-vault-green/40 rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">💸</div>
                <h2 className="text-2xl font-bold text-vault-green mb-2">Withdrawal Initiated!</h2>
                <p className="text-vault-text-secondary">
                  Your funds are on the way to your {method} account. You will be redirected shortly...
                </p>
             </motion.div>
          ) : (
            <>
              {/* Form */}
              <motion.div variants={fadeUp} className="bg-vault-card rounded-2xl p-5 border border-vault-border/50 shadow-xl flex flex-col gap-4" style={{ background: '#111827' }}>
                
                {/* Method Select */}
                <div>
                  <label className="block text-sm font-bold text-vault-text-secondary mb-2 ml-1">
                    Payout Method
                  </label>
                  <select 
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-vault-border-light rounded-xl px-4 py-3 text-vault-text focus:outline-none focus:border-vault-cyan focus:ring-1 focus:ring-vault-cyan/50 appearance-none font-medium"
                  >
                    {PAYOUT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Amount Input */}
                <AnimatedInput
                  label="Withdrawal Amount ($)"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                {/* Details Input */}
                <AnimatedInput
                  label={method === 'PayPal' ? 'PayPal Email' : 'Account/Routing Number or Details'}
                  type="text"
                  placeholder={method === 'PayPal' ? 'you@example.com' : 'Account info...'}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />

                {/* Error Message */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-vault-red text-sm mt-1"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Withdraw Button */}
                <motion.button
                  onClick={handleWithdraw}
                  disabled={loading || balance <= 0}
                  whileHover={
                    (loading || balance <= 0)
                      ? {}
                      : { scale: 1.02, y: -1, boxShadow: '0 0 25px -4px rgba(16,185,129,0.35)' }
                  }
                  whileTap={(loading || balance <= 0) ? {} : tapScale}
                  className="relative w-full py-4 mt-2 rounded-xl bg-vault-green text-white font-extrabold text-lg overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                    {loading ? 'Processing...' : 'Confirm Withdrawal'}
                  </span>
                </motion.button>
              </motion.div>
            </>
          )}

        </motion.div>
      </div>
    </motion.div>
  );
}