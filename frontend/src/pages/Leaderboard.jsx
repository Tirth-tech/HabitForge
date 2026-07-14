import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { RiTrophyFill, RiFireFill, RiStarFill, RiAddLine, RiLoader4Line } from 'react-icons/ri';
import toast from 'react-hot-toast';

const AVATAR_EMOJIS = { warrior: '⚔️', mage: '🧙', rogue: '🗡️', paladin: '🛡️' };

export default function Leaderboard() {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendInput, setFriendInput] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get('/analytics/leaderboard')
      .then(({ data }) => setBoard(data.leaderboard))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addFriend = async () => {
    if (!friendInput.trim()) return;
    setAdding(true);
    try {
      const { data } = await api.post(`/analytics/friends/${friendInput.trim()}`);
      toast.success(data.message);
      setFriendInput('');
      const { data: lb } = await api.get('/analytics/leaderboard');
      setBoard(lb.leaderboard);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add friend');
    } finally {
      setAdding(false);
    }
  };

  const rankColors = ['#f59e0b', '#9ca3af', '#cd7c36'];
  const rankEmojis = ['🥇', '🥈', '🥉'];

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            Leaderboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Compete with friends — Weekly XP rankings
          </p>
        </div>
      </div>

      {/* Add Friend */}
      <div className="card" style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <input
            className="input"
            placeholder="Enter username to follow..."
            value={friendInput}
            onChange={(e) => setFriendInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFriend()}
          />
        </div>
        <motion.button
          className="btn btn-primary"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={addFriend}
          disabled={adding}
          style={{ flexShrink: 0 }}
        >
          {adding ? <RiLoader4Line style={{ animation: 'spin 0.8s linear infinite' }} /> : <RiAddLine />}
          Follow Player
        </motion.button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : board.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">🏆</div>
          <div className="empty-title">No players yet</div>
          <div className="empty-desc">Add friends by username to start competing!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {board.map((player, index) => {
            const isMe = player._id === user?._id;
            return (
              <motion.div
                key={player._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  background: isMe ? 'rgba(124,58,237,0.1)' : 'var(--bg-card)',
                  border: `1px solid ${isMe ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                }}
              >
                {/* Rank */}
                <div style={{
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: index < 3 ? 24 : 16,
                  color: rankColors[index] || 'var(--text-muted)',
                  flexShrink: 0,
                }}>
                  {index < 3 ? rankEmojis[index] : `#${index + 1}`}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 44, height: 44,
                  background: 'var(--brand-gradient)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                  boxShadow: isMe ? 'var(--shadow-glow)' : 'none',
                }}>
                  {AVATAR_EMOJIS[player.avatar] || '⚔️'}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{player.username}</span>
                    {isMe && (
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        padding: '2px 6px', borderRadius: 99,
                        background: 'rgba(124,58,237,0.2)', color: 'var(--purple-light)',
                      }}>YOU</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Level {player.level}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <RiFireFill color="#f97316" size={12} />
                      {player.longestStreak || 0} streak
                    </span>
                  </div>
                </div>

                {/* Weekly XP */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20, fontWeight: 800,
                    color: '#f59e0b',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <RiStarFill size={16} />
                    {(player.weeklyXP || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>weekly XP</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
