import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../context/HabitsContext';
import { RiCloseLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const ICON_OPTIONS = ['✨', '💧', '📚', '🏋️', '🧘', '🎯', '🌿', '💊', '🎸', '✍️', '🏃', '🚴', '🍎', '😴', '📝', '🧹', '💻', '🎨', '🙏', '🐕'];
const COLOR_OPTIONS = [
  '#6366f1', '#7c3aed', '#a855f7', '#ec4899',
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#84cc16',
];

export default function HabitFormModal({ habit, onClose }) {
  const { createHabit, updateHabit } = useHabits();
  const isEdit = !!habit;

  const [form, setForm] = useState({
    name: habit?.name || '',
    description: habit?.description || '',
    icon: habit?.icon || '✨',
    color: habit?.color || '#6366f1',
    frequency: habit?.frequency || 'daily',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Habit name is required');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await updateHabit(habit._id, form);
      } else {
        await createHabit(form);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
      if (err.response?.data?.requiresPremium) {
        setTimeout(() => window.location.href = '/upgrade', 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? '✏️ Edit Habit' : '✨ New Habit'}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <RiCloseLine size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Icon + Color row */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            {/* Selected Icon + Color preview */}
            <div style={{
              width: 72, height: 72,
              background: form.color + '22',
              border: `2px solid ${form.color}`,
              borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32,
              flexShrink: 0,
            }}>
              {form.icon}
            </div>

            <div style={{ flex: 1 }}>
              <label className="input-label">Name *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Read 30 minutes"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={60}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="input-label">Description (optional)</label>
            <input
              type="text"
              className="input"
              placeholder="Why does this habit matter?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={200}
            />
          </div>

          {/* Icon picker */}
          <div className="form-group">
            <label className="input-label">Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  style={{
                    width: 40, height: 40,
                    fontSize: 20,
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${form.icon === icon ? form.color : 'var(--border)'}`,
                    background: form.icon === icon ? form.color + '22' : 'transparent',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="form-group">
            <label className="input-label">Color</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  style={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    background: color,
                    border: `3px solid ${form.color === color ? 'white' : 'transparent'}`,
                    cursor: 'pointer',
                    transform: form.color === color ? 'scale(1.2)' : 'scale(1)',
                    transition: 'var(--transition)',
                    outline: form.color === color ? `2px solid ${color}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="form-group">
            <label className="input-label">Frequency</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['daily', 'weekly'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForm({ ...form, frequency: f })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${form.frequency === f ? form.color : 'var(--border)'}`,
                    background: form.frequency === f ? form.color + '22' : 'transparent',
                    color: form.frequency === f ? form.color : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'var(--transition)',
                  }}
                >
                  {f === 'daily' ? '📅 Daily' : '📆 Weekly'}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary w-full" onClick={onClose}>
              Cancel
            </button>
            <motion.button
              type="submit"
              className="btn btn-primary w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading
                ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                : isEdit ? '✅ Save Changes' : '✨ Create Habit'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
