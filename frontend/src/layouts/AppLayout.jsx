import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitsContext';
import {
  RiHomeLine, RiHomeSmileFill,
  RiCheckboxLine, RiCheckboxFill,
  RiBarChartLine, RiBarChart2Fill,
  RiTrophyLine, RiTrophyFill,
  RiSettings4Line, RiVipCrownFill,
  RiLogoutBoxLine,
  RiFireFill,
  RiStarFill,
  RiMenuLine,
} from 'react-icons/ri';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icon: RiHomeLine, ActiveIcon: RiHomeSmileFill },
  { to: '/habits', label: 'My Habits', Icon: RiCheckboxLine, ActiveIcon: RiCheckboxFill },
  { to: '/analytics', label: 'Analytics', Icon: RiBarChartLine, ActiveIcon: RiBarChart2Fill },
  { to: '/leaderboard', label: 'Leaderboard', Icon: RiTrophyLine, ActiveIcon: RiTrophyFill },
  { to: '/profile', label: 'Profile', Icon: RiSettings4Line, ActiveIcon: RiSettings4Line },
];

const AVATAR_EMOJIS = {
  warrior: '⚔️',
  mage: '🧙',
  rogue: '🗡️',
  paladin: '🛡️',
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { todayStats } = useHabits();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const level = user?.levelInfo?.level || user?.level || 1;
  const progress = user?.levelInfo?.progressPercent || 0;
  const xp = user?.xp || 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── Sidebar (Desktop) ─────────────────────────────────────── */}
      <aside style={{
        width: 260,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'auto',
        flexShrink: 0,
      }}
        className="sidebar-desktop"
      >
        {/* Logo */}
        <div style={{ marginBottom: 32, padding: '0 8px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 900,
            background: 'var(--brand-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ⚔️ HabitForge
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, paddingLeft: 2 }}>
            Level Up Your Life
          </p>
        </div>

        {/* User Card */}
        {user && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 16,
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44,
                background: 'var(--brand-gradient)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
                boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
              }}>
                {AVATAR_EMOJIS[user.avatar] || '⚔️'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {user.username}
                  {user.isPremium && <RiVipCrownFill color="#f59e0b" size={14} />}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Level {level}
                </div>
              </div>
            </div>
            {/* XP Bar */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {xp.toLocaleString()} XP
                </span>
                <span style={{ fontSize: 11, color: 'var(--purple-light)', fontWeight: 600 }}>
                  {progress}%
                </span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
            {/* Today streak */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <div className="streak-display" style={{ fontSize: 13 }}>
                <RiFireFill />
                {user.longestStreak || 0} best
              </div>
              <div className="xp-orb" style={{ fontSize: 11 }}>
                <RiStarFill />
                {todayStats.done}/{todayStats.total} today
              </div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map(({ to, label, Icon, ActiveIcon }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <motion.div
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive ? <ActiveIcon size={18} /> : <Icon size={18} />}
                  {label}
                  {to === '/analytics' && !user?.isPremium && (
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 10,
                      padding: '2px 6px',
                      background: 'rgba(245,158,11,0.15)',
                      color: '#f59e0b',
                      borderRadius: 99,
                      fontWeight: 700,
                    }}>PRO</span>
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Upgrade Banner */}
        {!user?.isPremium && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/upgrade')}
            style={{
              background: 'var(--brand-gradient)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              cursor: 'pointer',
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
              🌟 Upgrade to Pro
            </div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>
              Unlock heatmaps, exports & more
            </div>
          </motion.div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="sidebar-nav-item"
          style={{ color: 'var(--red)', marginTop: 4 }}
        >
          <RiLogoutBoxLine size={18} />
          Log Out
        </button>
      </aside>

      {/* ── Mobile Top Bar ──────────────────────────────────────────── */}
      <div className="mobile-topbar" style={{
        display: 'none',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 60,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        zIndex: 100,
        padding: '0 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 900,
          background: 'var(--brand-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>⚔️ HabitForge</h1>
        <button className="btn btn-secondary btn-sm" onClick={() => setMobileOpen(!mobileOpen)}>
          <RiMenuLine />
        </button>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-topbar { display: flex !important; }
          main { padding-top: 60px; }
        }
      `}</style>
    </div>
  );
}
