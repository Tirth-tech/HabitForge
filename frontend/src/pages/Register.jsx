import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AVATARS = [
  { id: 'warrior', emoji: '⚔️', label: 'Warrior' },
  { id: 'mage', emoji: '🧙', label: 'Mage' },
  { id: 'rogue', emoji: '🗡️', label: 'Rogue' },
  { id: 'paladin', emoji: '🛡️', label: 'Paladin' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', avatar: 'warrior' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.avatar);
      navigate('/dashboard');
      toast.success('🎉 Your legend begins now!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 24,
    }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'rgba(220,38,38,0.08)', filter: 'blur(100px)',
          top: -200, left: -200,
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(244,63,94,0.06)', filter: 'blur(100px)',
          bottom: -100, right: -100,
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 40,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚔️</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            Create Your Character
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Begin your habit-forging journey
          </p>
        </div>

        {/* Avatar Selection */}
        <div style={{ marginBottom: 24 }}>
          <label className="input-label" style={{ marginBottom: 12, display: 'block' }}>
            Choose Your Avatar
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {AVATARS.map((a) => (
              <motion.button
                key={a.id}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setForm({ ...form, avatar: a.id })}
                style={{
                  background: form.avatar === a.id
                    ? 'rgba(124,58,237,0.2)'
                    : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${form.avatar === a.id ? 'var(--purple)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'var(--transition)',
                }}
              >
                <span style={{ fontSize: 28 }}>{a.emoji}</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {a.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Username</label>
            <input
              type="text"
              className="input"
              placeholder="HeroicWarrior99"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              minLength={3}
              maxLength={20}
              required
            />
          </div>

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
            <input
              type="password"
              className="input"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={6}
              required
            />
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{ marginTop: 8, marginBottom: 20 }}
          >
            {loading
              ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              : '🚀 Begin My Journey'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Already a hero?{' '}
          <Link to="/login" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
