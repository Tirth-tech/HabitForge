require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const autoSeed = require('./utils/autoSeed');

const startServer = async () => {
  await connectDB();
  await autoSeed();
};
startServer();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Serve Frontend Static Files in Production ────────────────────────────────
const path = require('path');
const fs = require('fs');
const distPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn(`⚠️ Warning: Static frontend build folder not found at: ${distPath}`);
}

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 HabitForge API running on http://localhost:${PORT}`);
});
