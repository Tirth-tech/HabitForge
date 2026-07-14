import { motion } from 'framer-motion';
import { useHabits } from '../context/HabitsContext';
import { RiFireFill, RiCheckLine, RiLoader4Line } from 'react-icons/ri';

export default function HabitCard({ habit, index = 0, done = false }) {
  const { checkIn, undoCheckIn, checkingIn } = useHabits();
  const isLoading = checkingIn === habit._id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: done ? 0.65 : 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 18px',
        background: 'var(--bg-card)',
        border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        transition: 'var(--transition)',
        cursor: 'default',
      }}
    >
      {/* Check button */}
      <motion.button
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.82 }}
        onClick={() => done ? undoCheckIn(habit._id) : checkIn(habit._id)}
        disabled={isLoading}
        style={{
          width: 40, height: 40,
          borderRadius: '50%',
          border: `2px solid ${done ? '#10b981' : habit.color || '#6366f1'}`,
          background: done
            ? 'rgba(16,185,129,0.15)'
            : `${habit.color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {isLoading
          ? <RiLoader4Line size={18} color={habit.color} style={{ animation: 'spin 0.8s linear infinite' }} />
          : done
            ? <RiCheckLine size={18} color="#10b981" />
            : <span style={{ fontSize: 18 }}>{habit.icon}</span>
        }
      </motion.button>

      {/* Name + streak */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: 14,
          fontWeight: 600,
          textDecoration: done ? 'line-through' : 'none',
          color: done ? 'var(--text-secondary)' : 'var(--text-primary)',
        }}>
          {habit.name}
        </span>
        {habit.currentStreak > 0 && (
          <span style={{
            marginLeft: 8,
            fontSize: 11,
            color: '#f97316',
            fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 2,
          }}>
            <RiFireFill size={11} />
            {habit.currentStreak}
          </span>
        )}
      </div>

      {/* Color indicator */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: habit.color || '#6366f1',
        flexShrink: 0,
      }} />
    </motion.div>
  );
}
