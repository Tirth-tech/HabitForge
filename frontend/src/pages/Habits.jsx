import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../context/HabitsContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
  RiAddLine, RiEditLine, RiDeleteBinLine,
  RiCheckLine, RiFireFill, RiLoader4Line,
  RiCloseLine, RiArrowGoBackLine,
} from 'react-icons/ri';
import HabitFormModal from '../components/HabitFormModal';
import toast from 'react-hot-toast';

export default function Habits() {
  const { habits, loading, checkIn, undoCheckIn, deleteHabit, checkingIn } = useHabits();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const pending = habits.filter((h) => !h.doneToday);
  const done = habits.filter((h) => h.doneToday);

  const handleDelete = async (id) => {
    await deleteHabit(id);
    setConfirmDelete(null);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            My Habits
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {habits.length} active {habits.length === 1 ? 'habit' : 'habits'} •{' '}
            {done.length} completed today
          </p>
        </div>
        <motion.button
          className="btn btn-primary"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { setEditingHabit(null); setShowForm(true); }}
        >
          <RiAddLine size={18} />
          New Habit
        </motion.button>
      </div>

      {/* Habit Limit Banner */}
      {!user?.isPremium && habits.length >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 14, color: '#f59e0b' }}>
            🔒 You've reached the free limit of 5 habits
          </span>
          <a href="/upgrade" className="btn btn-sm" style={{ background: 'var(--brand-gradient)', color: 'white', fontSize: 12 }}>
            Upgrade →
          </a>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : habits.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">🎯</div>
          <div className="empty-title">No habits yet</div>
          <div className="empty-desc">Create your first habit to start earning XP and building streaks!</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <RiAddLine /> Create First Habit
          </button>
        </div>
      ) : (
        <>
          {/* Pending habits */}
          {pending.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 }}>
                Today's Quests ({pending.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AnimatePresence>
                  {pending.map((habit) => (
                    <HabitRow
                      key={habit._id}
                      habit={habit}
                      checkingIn={checkingIn === habit._id}
                      onCheckIn={() => checkIn(habit._id)}
                      onEdit={() => { setEditingHabit(habit); setShowForm(true); }}
                      onDelete={() => setConfirmDelete(habit._id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Done habits */}
          {done.length > 0 && (
            <div>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
                Completed ✓ ({done.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {done.map((habit) => (
                  <HabitRow
                    key={habit._id}
                    habit={habit}
                    done
                    onUndo={() => undoCheckIn(habit._id)}
                    onEdit={() => { setEditingHabit(habit); setShowForm(true); }}
                    onDelete={() => setConfirmDelete(habit._id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <HabitFormModal
            habit={editingHabit}
            onClose={() => { setShowForm(false); setEditingHabit(null); }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 380 }}
            >
              <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  Delete Habit?
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  This will permanently remove the habit and all its history.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary w-full" onClick={() => setConfirmDelete(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger w-full" onClick={() => handleDelete(confirmDelete)}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HabitRow({ habit, done, checkingIn, onCheckIn, onUndo, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: done ? 0.65 : 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: done ? 'var(--bg-card)' : 'var(--bg-card)',
        border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        transition: 'var(--transition)',
      }}
      whileHover={{ borderColor: done ? 'rgba(16,185,129,0.3)' : 'var(--border-hover)' }}
    >
      {/* Check Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        onClick={done ? onUndo : onCheckIn}
        disabled={checkingIn}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: `2px solid ${done ? '#10b981' : habit.color || '#6366f1'}`,
          background: done ? 'rgba(16,185,129,0.15)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'var(--transition)',
        }}
      >
        {checkingIn ? (
          <RiLoader4Line size={20} color={habit.color} style={{ animation: 'spin 0.8s linear infinite' }} />
        ) : done ? (
          <RiCheckLine size={22} color="#10b981" />
        ) : (
          <span style={{ fontSize: 20 }}>{habit.icon}</span>
        )}
      </motion.button>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 15,
            fontWeight: 600,
            textDecoration: done ? 'line-through' : 'none',
            color: done ? 'var(--text-secondary)' : 'var(--text-primary)',
          }}>
            {habit.name}
          </span>
          {habit.currentStreak > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#f97316', fontWeight: 700 }}>
              <RiFireFill size={12} />
              {habit.currentStreak}
            </span>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {habit.frequency}
          </span>
        </div>
        {habit.description && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {habit.description}
          </div>
        )}
      </div>

      {/* Color dot */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: habit.color || '#6366f1',
        flexShrink: 0,
      }} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={onEdit}
          title="Edit"
        >
          <RiEditLine size={15} />
        </button>
        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={onDelete}
          title="Delete"
          style={{ color: 'var(--red)' }}
        >
          <RiDeleteBinLine size={15} />
        </button>
      </div>
    </motion.div>
  );
}
