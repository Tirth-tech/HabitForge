import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { RiEyeLine, RiEyeOffLine, RiFireFill } from 'react-icons/ri';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
      toast.success('Welcome back, hero! ⚔️');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = () => {
    setForm({ email: 'demo@habitforge.com', password: 'demo1234' });
    toast('Demo credentials filled! Hit Login 👇', { icon: '💡' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>
      {/* Left: Hero Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #fee2e2 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: 48,
      }} className="auth-hero">
        {/* Background orbs */}
        {[
          { w: 400, h: 400, top: -100, left: -100, color: 'rgba(220,38,38,0.1)' },
          { w: 300, h: 300, bottom: -80, right: -80, color: 'rgba(244,63,94,0.1)' },
          { w: 200, h: 200, top: '40%', left: '60%', color: 'rgba(239,68,68,0.08)' },
        ].map((orb, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: orb.w, height: orb.h,
            borderRadius: '50%',
            background: orb.color,
            filter: 'blur(80px)',
            top: orb.top, left: orb.left,
            bottom: orb.bottom, right: orb.right,
          }} />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ fontSize: 80, marginBottom: 24 }}
          >
            ⚔️
          </motion.div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 48,
            fontWeight: 900,
            background: 'var(--brand-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 16,
          }}>HabitForge</h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 380, lineHeight: 1.6 }}>
            Turn your daily habits into an <strong style={{ color: 'var(--purple-light)' }}>epic RPG adventure</strong>.
            Earn XP, unlock badges, and level up your life.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 32 }}>
            {['⚡ Earn XP', '🔥 Build Streaks', '🏆 Win Badges', '📊 Track Progress'].map((f) => (
              <span key={f} style={{
                padding: '8px 16px',
                background: 'rgba(220, 38, 38, 0.08)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}>{f}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right: Login Form */}
      <div style={{
        width: 440,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
      }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 8,
          }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>
            Continue your hero's journey
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="hero@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Your secret spell"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 44 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary w-full btn-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              style={{ marginBottom: 12 }}
            >
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : '⚡ Login & Forge On'}
            </motion.button>
          </form>

          <div className="divider" />

          <button
            onClick={demoLogin}
            className="btn btn-secondary w-full"
            style={{ marginBottom: 24, fontSize: 13 }}
          >
            <RiFireFill color="#f59e0b" />
            Try Demo Account
          </button>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
            New hero?{' '}
            <Link to="/register" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-hero { display: none !important; }
          div[style*="width: 440"] { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
