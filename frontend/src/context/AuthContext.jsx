import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('hf_token');
    const savedUser = localStorage.getItem('hf_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Refresh from server
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      localStorage.setItem('hf_user', JSON.stringify(data));
    } catch {
      localStorage.removeItem('hf_token');
      localStorage.removeItem('hf_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('hf_token', data.token);
    localStorage.setItem('hf_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password, avatar) => {
    const { data } = await api.post('/auth/register', { username, email, password, avatar });
    localStorage.setItem('hf_token', data.token);
    localStorage.setItem('hf_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hf_token');
    localStorage.removeItem('hf_user');
    setUser(null);
    toast.success('Logged out. See you tomorrow! 👋');
  };

  const upgradePremium = async () => {
    await api.post('/auth/upgrade');
    await refreshUser();
    toast.success('🌟 Welcome to Premium!');
  };

  const updateXP = (xpEarned, newLevelInfo) => {
    setUser((prev) => ({
      ...prev,
      xp: (prev.xp || 0) + xpEarned,
      levelInfo: newLevelInfo,
      level: newLevelInfo?.level || prev.level,
    }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, upgradePremium, updateXP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
