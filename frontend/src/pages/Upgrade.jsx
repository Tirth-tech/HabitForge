import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RiVipCrownFill, RiCheckLine, RiFlashlightFill } from 'react-icons/ri';
import toast from 'react-hot-toast';

const FREE_FEATURES = [
  '5 Active Habits',
  'Daily & Weekly Tracking',
  'XP & Level System',
  'Achievement Badges',
  '30-Day Charts',
  'Basic Leaderboard',
];

const PRO_FEATURES = [
  'Unlimited Habits',
  'GitHub-style Activity Heatmap',
  'CSV Data Export',
  'Advanced Analytics',
  'Priority Support',
  'Exclusive Pro Badge',
];

export default function Upgrade() {
  const { user, upgradePremium } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (user?.isPremium) {
      toast('You are already on Premium! 🌟', { icon: '👑' });
      return;
    }
    try {
      await upgradePremium();
      navigate('/analytics');
    } catch {
      toast.error('Upgrade failed. Please try again.');
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: 64, marginBottom: 20 }}
        >
          ⭐
        </motion.div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 40,
          fontWeight: 900,
          marginBottom: 16,
        }}>
          Unlock Your <span className="gradient-text">Full Potential</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
          Upgrade to Pro and get access to advanced analytics, unlimited habits, and powerful export tools.
        </p>
      </motion.div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>
        {/* Free */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
          style={{ padding: 32 }}
        >
          <div style={{ marginBottom: 24 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
              color: 'var(--text-muted)',
            }}>Current Plan</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginTop: 6 }}>
              Free
            </h2>
            <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8, color: 'var(--text-secondary)' }}>
              $0<span style={{ fontSize: 16, fontWeight: 400 }}>/mo</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {FREE_FEATURES.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                <RiCheckLine color="#10b981" size={16} />
                {f}
              </div>
            ))}
          </div>

          <button className="btn btn-secondary w-full" disabled>
            Current Plan
          </button>
        </motion.div>

        {/* Pro */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            padding: 32,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.1) 100%)',
            border: '1px solid rgba(124,58,237,0.4)',
            borderRadius: 'var(--radius-xl)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow */}
          <div style={{
            position: 'absolute', top: -50, right: -50,
            width: 200, height: 200,
            background: 'rgba(124,58,237,0.2)',
            borderRadius: '50%',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }} />

          {/* Popular badge */}
          <div style={{
            position: 'absolute', top: 16, right: 16,
            background: 'var(--brand-gradient)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: 11, fontWeight: 700,
          }}>
            MOST POPULAR
          </div>

          <div style={{ marginBottom: 24 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
              color: 'var(--purple-light)',
            }}>Recommended</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginTop: 6 }}>
              Pro
              <RiVipCrownFill color="#f59e0b" size={22} style={{ marginLeft: 10, display: 'inline' }} />
            </h2>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 800 }}>$9.99</span>
              <span style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 400 }}>/mo</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {PRO_FEATURES.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <RiFlashlightFill color="#f59e0b" size={16} />
                {f}
              </div>
            ))}
          </div>

          <motion.button
            className="btn btn-primary w-full btn-lg"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleUpgrade}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {user?.isPremium ? '✅ Already Pro' : '🌟 Upgrade Now — It\'s Free for Demo!'}
          </motion.button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
            (Demo mode — no payment required)
          </p>
        </motion.div>
      </div>

      {/* Testimonials */}
      <div className="grid-3" style={{ marginBottom: 48 }}>
        {[
          { quote: "The heatmap alone is worth it. I can see exactly when I'm consistent!", name: 'Alex K.', level: 12 },
          { quote: "Unlimited habits let me track everything from coding to meditation.", name: 'Sarah M.', level: 8 },
          { quote: "CSV export helped me analyze my habits in Excel. Game changer!", name: 'David R.', level: 15 },
        ].map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.3 }}
            className="card"
            style={{ padding: 24 }}
          >
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6, fontStyle: 'italic' }}>
              "{t.quote}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36,
                background: 'var(--brand-gradient)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>⚔️</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Level {t.level}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
