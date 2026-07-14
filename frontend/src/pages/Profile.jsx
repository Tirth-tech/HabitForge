import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { RiVipCrownFill, RiTrophyFill, RiFireFill, RiStarFill, RiEditLine, RiCheckLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { getAllBadges } from '../utils/gamification';

const AVATAR_EMOJIS = { warrior: '⚔️', mage: '🧙', rogue: '🗡️', paladin: '🛡️' };
const AVATARS = [
  { id: 'warrior', emoji: '⚔️', label: 'Warrior' },
  { id: 'mage', emoji: '🧙', label: 'Mage' },
  { id: 'rogue', emoji: '🗡️', label: 'Rogue' },
  { id: 'paladin', emoji: '🛡️', label: 'Paladin' },
];

// Badge definitions for display (mirrors backend)
const ALL_BADGES = [
  { id: 'first_step', name: 'First Step', description: 'Complete your first habit', icon: '👶', rarity: 'common' },
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day streak', icon: '⚔️', rarity: 'uncommon' },
  { id: 'consistency_king', name: 'Consistency King', description: '30-day streak', icon: '👑', rarity: 'rare' },
  { id: 'centurion', name: 'Centurion', description: '100 completions', icon: '🏛️', rarity: 'rare' },
  { id: 'legend', name: 'Legend', description: 'Reach Level 10', icon: '🌟', rarity: 'legendary' },
  { id: 'habit_master', name: 'Habit Master', description: '5+ active habits', icon: '🎯', rarity: 'uncommon' },
  { id: 'iron_will', name: 'Iron Will', description: '500 completions', icon: '🔱', rarity: 'legendary' },
  { id: 'on_fire', name: 'On Fire', description: '14-day streak', icon: '🔥', rarity: 'uncommon' },
];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || 'warrior');
  const [saving, setSaving] = useState(false);

  const level = user?.levelInfo?.level || user?.level || 1;
  const progress = user?.levelInfo?.progressPercent || 0;
  const earnedBadgeIds = new Set(user?.badges?.map((b) => b.id) || []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', { username, avatar });
      await refreshUser();
      setEditing(false);
      toast.success('Profile updated! ✨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 28 }}>
        Profile
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
        {/* Left: Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card */}
          <div className="card" style={{ textAlign: 'center', padding: 32, position: 'relative' }}>
            {/* Avatar */}
            <motion.div
              className="animate-float"
              style={{
                width: 96, height: 96,
                background: 'var(--brand-gradient)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 48,
                margin: '0 auto 16px',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              {AVATAR_EMOJIS[editing ? avatar : user?.avatar] || '⚔️'}
            </motion.div>

            {editing ? (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                  {AVATARS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAvatar(a.id)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: 'var(--radius-sm)',
                        border: `2px solid ${avatar === a.id ? 'var(--purple)' : 'var(--border)'}`,
                        background: avatar === a.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: 20,
                      }}
                    >
                      {a.emoji}
                    </button>
                  ))}
                </div>
                <input
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ textAlign: 'center', marginBottom: 12 }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary w-full btn-sm" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary w-full btn-sm" onClick={saveProfile} disabled={saving}>
                    {saving ? '...' : <><RiCheckLine /> Save</>}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                  {user?.username}
                  {user?.isPremium && <RiVipCrownFill color="#f59e0b" size={18} style={{ marginLeft: 8, display: 'inline' }} />}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{user?.email}</p>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditing(true)}
                  style={{ margin: '0 auto' }}
                >
                  <RiEditLine /> Edit Profile
                </button>
              </>
            )}

            {/* Level */}
            <div style={{
              marginTop: 24,
              padding: 16,
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Level {level}</span>
                <span style={{ fontSize: 13, color: 'var(--purple-light)', fontWeight: 600 }}>{progress}%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Stats</h3>
            {[
              { icon: <RiStarFill color="#f59e0b" />, label: 'Total XP', value: (user?.xp || 0).toLocaleString() },
              { icon: <RiFireFill color="#f97316" />, label: 'Best Streak', value: `${user?.longestStreak || 0} days` },
              { icon: <RiTrophyFill color="#a855f7" />, label: 'Badges Earned', value: user?.badges?.length || 0 },
              { icon: '✅', label: 'Total Completions', value: (user?.totalCompletions || 0).toLocaleString() },
            ].map((s) => (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>{s.icon}</span>
                  {s.label}
                </div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{s.value}</span>
              </div>
            ))}
          </div>

          {!user?.isPremium && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/upgrade')}
              style={{
                background: 'var(--brand-gradient)',
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>🌟</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Upgrade to Pro</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Unlock all features</div>
            </motion.div>
          )}
        </div>

        {/* Right: Badges */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
            <RiTrophyFill color="#f59e0b" style={{ marginRight: 8, display: 'inline' }} />
            Badge Collection
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {ALL_BADGES.map((badge) => {
              const earned = earnedBadgeIds.has(badge.id);
              const earnedData = user?.badges?.find((b) => b.id === badge.id);
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -2 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px',
                    background: earned ? 'var(--bg-card)' : 'var(--bg-secondary)',
                    border: `1px solid ${earned ? 'rgba(124,58,237,0.25)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    opacity: earned ? 1 : 0.45,
                    filter: earned ? 'none' : 'grayscale(80%)',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ fontSize: 36, filter: earned ? 'none' : 'grayscale(100%)' }}>
                    {badge.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {badge.name}
                      {earned && <RiCheckLine color="#10b981" size={14} />}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                      {badge.description}
                    </div>
                    <span className={`badge badge-${badge.rarity}`}>{badge.rarity}</span>
                    {earned && earnedData?.earnedAt && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                        Earned {new Date(earnedData.earnedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: 340px 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridTemplateColumns: repeat(2, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
