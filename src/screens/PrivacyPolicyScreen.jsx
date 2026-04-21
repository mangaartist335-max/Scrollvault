import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '../components/AmbientBackground';
import { pageVariants, fadeUp, staggerContainer } from '../motion/variants';

export default function PrivacyPolicyScreen() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen relative text-vault-text p-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AmbientBackground />
      <div className="max-w-2xl mx-auto relative z-10 bg-vault-card p-8 rounded-2xl border border-vault-border shadow-2xl">
        <motion.button
          onClick={() => navigate(-1)}
          className="text-vault-cyan text-sm font-semibold hover:text-vault-green transition-colors mb-6 cursor-pointer"
        >
          &larr; Back
        </motion.button>

        <motion.div variants={staggerContainer(0.08, 0.05)} initial="hidden" animate="show" className="flex flex-col gap-6">
          <motion.h1 variants={fadeUp} className="text-3xl font-extrabold text-vault-text">Privacy Policy</motion.h1>
          <motion.div variants={fadeUp} className="text-vault-text-secondary leading-relaxed space-y-4">
            <p>
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <h2 className="text-xl font-bold text-vault-text mt-6">1. Information We Collect</h2>
            <p>
              We collect information to provide better services to our users. When you use ScrollVault, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Information you provide (email, name)</li>
              <li>Scrolling activity and duration on supported social platforms (via our extension)</li>
              <li>Device and usage information</li>
            </ul>

            <h2 className="text-xl font-bold text-vault-text mt-6">2. How We Use Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Calculate and issue your scrolling rewards</li>
              <li>Process withdrawals to your designated accounts</li>
              <li>Show you relevant advertisements that help fund your rewards</li>
            </ul>

            <h2 className="text-xl font-bold text-vault-text mt-6">3. Third-Party Advertising</h2>
            <p>
              We use third-party advertising companies, including Google AdSense, to serve ads when you visit our website. These companies may use cookies and similar technologies to collect information about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
            </p>
            
            <h2 className="text-xl font-bold text-vault-text mt-6">4. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}