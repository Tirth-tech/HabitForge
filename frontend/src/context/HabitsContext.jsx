import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const HabitsContext = createContext(null);

export const HabitsProvider = ({ children }) => {
  const { user, updateXP, refreshUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(null);

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get('/habits');
      setHabits(data);
    } catch (err) {
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const createHabit = async (habitData) => {
    const { data } = await api.post('/habits', habitData);
    setHabits((prev) => [...prev, data]);
    toast.success(`✨ "${data.name}" habit created!`);
    return data;
  };

  const updateHabit = async (id, updates) => {
    const { data } = await api.put(`/habits/${id}`, updates);
    setHabits((prev) => prev.map((h) => (h._id === id ? data : h)));
    toast.success('Habit updated!');
    return data;
  };

  const deleteHabit = async (id) => {
    await api.delete(`/habits/${id}`);
    setHabits((prev) => prev.filter((h) => h._id !== id));
    toast.success('Habit removed');
  };

  const checkIn = async (habitId) => {
    setCheckingIn(habitId);
    try {
      const { data } = await api.post(`/habits/${habitId}/checkin`);

      // Update habit in list
      setHabits((prev) =>
        prev.map((h) => (h._id === habitId ? { ...data.habit, doneToday: true } : h))
      );

      // Update user XP
      updateXP(data.xpEarned, data.levelInfo);

      // Toast with XP
      toast.success(`+${data.xpEarned} XP! 🔥 ${data.currentStreak} day streak!`, {
        duration: 3000,
        icon: '⚡',
      });

      // New badges?
      if (data.newBadges?.length > 0) {
        data.newBadges.forEach((badge) => {
          setTimeout(() => {
            toast(`🏆 New Badge: ${badge.name} ${badge.icon}`, {
              duration: 5000,
              style: { background: '#1a1a26', border: '1px solid #7c3aed', color: '#f0f0ff' },
            });
          }, 500);
        });
        await refreshUser();
      }

      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in failed';
      toast.error(msg);
      throw err;
    } finally {
      setCheckingIn(null);
    }
  };

  const undoCheckIn = async (habitId) => {
    try {
      const { data } = await api.delete(`/habits/${habitId}/checkin`);
      setHabits((prev) =>
        prev.map((h) => (h._id === habitId ? { ...data.habit, doneToday: false } : h))
      );
      updateXP(-data.xpRemoved, data.levelInfo);
      toast('Check-in undone', { icon: '↩️' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to undo');
    }
  };

  const todayStats = {
    total: habits.length,
    done: habits.filter((h) => h.doneToday).length,
    rate: habits.length > 0
      ? Math.round((habits.filter((h) => h.doneToday).length / habits.length) * 100)
      : 0,
  };

  return (
    <HabitsContext.Provider value={{
      habits, loading, checkingIn, todayStats,
      fetchHabits, createHabit, updateHabit, deleteHabit, checkIn, undoCheckIn,
    }}>
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
};
