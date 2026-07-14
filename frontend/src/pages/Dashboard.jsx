import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitsContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import api from '../services/api';
import {
  RiFireFill, RiStarFill, RiTrophyFill,
  RiCheckboxCircleFill, RiArrowUpLine, RiFlashlightFill,
} from 'react-icons/ri';
import HabitCard from '../components/HabitCard';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AVATAR_EMOJIS = { warrior: '⚔️', mage: '🧙', rogue: '🗡️', paladin: '🛡️' };

export default function Dashboard() {
  const { user } = useAuth();
  const { habits, todayStats, loading } = useHabits();
  const [analytics, setAnalytics] = useState(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    api.get('/analytics/dashboard').then(({ data }) => setAnalytics(data)).catch(() => {});
  }, [habits]);

  const level = user?.levelInfo?.level || user?.level || 1;
  const progress = user?.levelInfo?.progressPercent || 0;

  // Chart data: completion rate over 30 days
  const chartData = analytics?.completionRateData?.slice(-14) || [];
  const lineData = {
    labels: chartData.map((d) => format(new Date(d.date), 'MMM d')),
    datasets: [{
      label: 'Completion Rate %',
      data: chartData.map((d) => d.rate),
      fill: true,
      borderColor: '#a855f7',
      backgroundColor: 'rgba(168,85,247,0.12)',
      tension: 0.4,
      pointBackgroundColor: '#a855f7',
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#9090b0', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#9090b0', font: { size: 11 }, callback: (v) => `${v}%` },
        min: 0, max: 100,
      },
    },
  };

  const pendingHabits = habits.filter((h) => !h.doneToday);
  const doneHabits = habits.filter((h) => h.doneToday);

  return (
    <div className="page-content">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
          <div style={{
            width: 56, height: 56,
            background: 'var(--brand-gradient)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
            boxShadow: 'var(--shadow-glow)',
          }}>
            {AVATAR_EMOJIS[user?.avatar] || '⚔️'}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>
              {greeting}, <span className="gradient-text">{user?.username}</span>! 
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {todayStats.done === 0
                ? "Ready to forge your destiny? Start your first habit!"
                : todayStats.done === todayStats.total
                  ? "🔥 Perfect day! All habits complete!"
                  : `${todayStats.total - todayStats.done} habit${todayStats.total - todayStats.done !== 1 ? 's' : ''} remaining today`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Row ─────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 28,
      }}>
        {[
          {
            label: 'Current Level',
            value: level,
            icon: <RiArrowUpLine color="#a855f7" size={22} />,
            color: '#a855f7',
            suffix: `(${progress}%)`,
          },
          {
            label: 'Total XP',
            value: (user?.xp || 0).toLocaleString(),
            icon: <RiStarFill color="#f59e0b" size={22} />,
            color: '#f59e0b',
          },
          {
            label: 'Best Streak',
            value: `${user?.longestStreak || 0}🔥`,
            icon: <RiFireFill color="#f97316" size={22} />,
            color: '#f97316',
          },
          {
            label: "Today's Progress",
            value: `${todayStats.done}/${todayStats.total}`,
            icon: <RiCheckboxCircleFill color="#10b981" size={22} />,
            color: '#10b981',
            suffix: `${todayStats.rate}%`,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-label">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="stat-value" style={{ color: stat.color, fontSize: 26 }}>
              {stat.value}
            </div>
            {stat.suffix && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.suffix}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ─── Progress Bar (XP) ────────────────────────────────────── */}
      <motion.div
        className="card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: 28, padding: '20px 24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RiFlashlightFill color="#a855f7" size={20} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Level {level} Progress</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {user?.levelInfo?.xpIntoLevel || 0} / {user?.levelInfo?.xpNeeded || 100} XP to next level
          </span>
        </div>
        <div className="progress-bar" style={{ height: 12 }}>
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lv {level}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lv {level + 1}</span>
        </div>
      </motion.div>

      {/* ─── Main Grid ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left: Today's Habits */}
        <div>
          <div className="section-header">
            <h2 className="section-title">Today's Quests</h2>
            <span className="xp-orb">
              <RiStarFill />
              {todayStats.done} done
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" />
            </div>
          ) : habits.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon">⚔️</div>
              <div className="empty-title">No Habits Yet</div>
              <div className="empty-desc">Create your first habit and begin forging your destiny!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Pending */}
              {pendingHabits.map((habit, i) => (
                <HabitCard key={habit._id} habit={habit} index={i} />
              ))}
              {/* Done */}
              {doneHabits.length > 0 && (
                <>
                  {pendingHabits.length > 0 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0',
                    }}>
                      <div className="divider" style={{ flex: 1, margin: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        Completed ✓
                      </span>
                      <div className="divider" style={{ flex: 1, margin: 0 }} />
                    </div>
                  )}
                  {doneHabits.map((habit, i) => (
                    <HabitCard key={habit._id} habit={habit} index={i} done />
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Chart + Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Completion Chart */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📈 14-Day Completion</h3>
            <div style={{ height: 160 }}>
              {chartData.length > 0
                ? <Line data={lineData} options={lineOptions} />
                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 13 }}>
                    No data yet – complete habits to see your chart!
                  </div>
              }
            </div>
          </div>

          {/* Recent Badges */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
              <RiTrophyFill color="#f59e0b" style={{ marginRight: 6, display: 'inline' }} />
              Recent Badges
            </h3>
            {user?.badges?.length === 0 || !user?.badges ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>
                Complete habits to earn your first badge!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {user.badges.slice(-4).reverse().map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{badge.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{badge.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{badge.description}</div>
                    </div>
                    <span className={`badge badge-${badge.rarity}`}>{badge.rarity}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridTemplateColumns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          div[style*="gridTemplateColumns: repeat(2"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
