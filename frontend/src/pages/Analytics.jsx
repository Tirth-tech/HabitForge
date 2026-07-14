import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, BarElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import api from '../services/api';
import { format, subDays } from 'date-fns';
import Heatmap from '../components/Heatmap';
import { RiLockLine, RiDownloadLine, RiVipCrownFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9090b0', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9090b0', font: { size: 11 } } },
  },
};

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await api.get('/analytics/dashboard');
        setDashboard(data);
        if (user?.isPremium) {
          const { data: hm } = await api.get('/analytics/heatmap');
          setHeatmap(hm.heatmapData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const handleExport = async () => {
    try {
      const res = await api.get('/analytics/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'habitforge-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      navigate('/upgrade');
    }
  };

  const completionData = dashboard?.completionRateData || [];
  const xpData = dashboard?.xpByDay || [];

  const lineData = {
    labels: completionData.map((d) => format(new Date(d.date), 'MMM d')),
    datasets: [{
      label: 'Completion Rate %',
      data: completionData.map((d) => d.rate),
      fill: true,
      borderColor: '#a855f7',
      backgroundColor: 'rgba(168,85,247,0.1)',
      tension: 0.4,
      pointBackgroundColor: '#a855f7',
      pointRadius: 3,
      pointHoverRadius: 6,
    }],
  };

  const barData = {
    labels: xpData.map((d) => format(new Date(d.date), 'EEE')),
    datasets: [{
      label: 'XP Earned',
      data: xpData.map((d) => d.xp),
      backgroundColor: 'rgba(236,72,153,0.6)',
      borderColor: '#ec4899',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const countData = {
    labels: completionData.slice(-14).map((d) => format(new Date(d.date), 'MMM d')),
    datasets: [{
      label: 'Completions',
      data: completionData.slice(-14).map((d) => d.count),
      fill: true,
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6,182,212,0.1)',
      tension: 0.3,
      pointRadius: 3,
    }],
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Insights into your habit journey
          </p>
        </div>
        <button
          className={`btn ${user?.isPremium ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleExport}
          style={!user?.isPremium ? { opacity: 0.7 } : {}}
        >
          {!user?.isPremium && <RiLockLine size={14} />}
          <RiDownloadLine size={16} />
          Export CSV
          {!user?.isPremium && <span className="badge badge-premium" style={{ fontSize: 10, padding: '1px 6px' }}>PRO</span>}
        </button>
      </div>

      {/* Today stats */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {[
          { label: "Today's Done", value: `${dashboard?.todayStats?.done || 0}/${dashboard?.todayStats?.total || 0}`, color: '#10b981' },
          { label: 'Completion Rate', value: `${dashboard?.todayStats?.rate || 0}%`, color: '#a855f7' },
          { label: '30-Day Logs', value: (dashboard?.totalLogs || 0).toLocaleString(), color: '#06b6d4' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <span className="stat-label">{s.label}</span>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Completion Rate Line */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            📈 30-Day Completion Rate
          </h3>
          <div style={{ height: 200 }}>
            <Line data={lineData} options={{
              ...chartDefaults,
              scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 0, max: 100, ticks: { ...chartDefaults.scales.y.ticks, callback: (v) => `${v}%` } } },
            }} />
          </div>
        </div>

        {/* XP Bar */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            ⚡ XP Earned (Last 7 Days)
          </h3>
          <div style={{ height: 200 }}>
            <Bar data={barData} options={chartDefaults} />
          </div>
        </div>
      </div>

      {/* Completions count */}
      <div className="card" style={{ padding: 20, marginBottom: 28 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
          🎯 Daily Completions (Last 14 Days)
        </h3>
        <div style={{ height: 180 }}>
          <Line data={countData} options={chartDefaults} />
        </div>
      </div>

      {/* HEATMAP (Premium) */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>
            🗓️ Activity Heatmap
            {!user?.isPremium && (
              <span className="badge badge-premium" style={{ marginLeft: 10, fontSize: 10 }}>
                <RiVipCrownFill /> PRO
              </span>
            )}
          </h3>
        </div>

        {user?.isPremium ? (
          <div className="card" style={{ padding: 24 }}>
            <Heatmap data={heatmap || {}} />
          </div>
        ) : (
          <div className="card premium-lock" style={{ padding: 24, minHeight: 160 }}>
            <div style={{ filter: 'blur(6px)', pointerEvents: 'none' }}>
              <Heatmap data={{}} blurred />
            </div>
            <div className="premium-lock-overlay">
              <RiLockLine size={32} color="#f59e0b" />
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Premium Feature</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 280 }}>
                Upgrade to Pro to unlock the GitHub-style activity heatmap
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/upgrade')}
              >
                <RiVipCrownFill />
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
