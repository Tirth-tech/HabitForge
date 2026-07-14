const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');
const User = require('../models/User');
const { subDays, format, startOfDay, parseISO, eachDayOfInterval } = require('date-fns');

// ─── DASHBOARD ANALYTICS ─────────────────────────────────────────────────────
// @route GET /api/analytics/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 29);

    // All habit logs in last 30 days
    const logs = await HabitLog.find({
      user: userId,
      completedAt: { $gte: thirtyDaysAgo },
    }).lean();

    // Aggregate completions by date (last 30 days)
    const dateMap = {};
    const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
    dateRange.forEach((d) => {
      dateMap[format(d, 'yyyy-MM-dd')] = 0;
    });

    logs.forEach((log) => {
      const key = log.dateStr;
      if (dateMap[key] !== undefined) dateMap[key]++;
    });

    const completionData = Object.entries(dateMap).map(([date, count]) => ({
      date,
      count,
    }));

    // Total habits for completion rate
    const totalHabits = await Habit.countDocuments({ user: userId, isActive: true });

    const completionRateData = completionData.map((d) => ({
      date: d.date,
      rate: totalHabits > 0 ? Math.min(100, Math.round((d.count / totalHabits) * 100)) : 0,
      count: d.count,
    }));

    // Today's stats
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayLogs = logs.filter((l) => l.dateStr === todayStr);
    const todayHabits = await Habit.find({ user: userId, isActive: true }).lean();
    const doneTodayCount = todayHabits.filter((h) => h.lastCompletedDate === todayStr).length;

    // XP earned last 7 days by day
    const xpByDay = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dStr = format(d, 'yyyy-MM-dd');
      const dayLogs = await HabitLog.find({ user: userId, dateStr: dStr }).lean();
      const dayXP = dayLogs.reduce((sum, l) => sum + (l.xpEarned || 0), 0);
      xpByDay.push({ date: dStr, xp: dayXP });
    }

    res.json({
      completionRateData,
      xpByDay,
      todayStats: {
        done: doneTodayCount,
        total: totalHabits,
        rate: totalHabits > 0 ? Math.round((doneTodayCount / totalHabits) * 100) : 0,
      },
      totalLogs: logs.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── HEATMAP (Premium) ───────────────────────────────────────────────────────
// @route GET /api/analytics/heatmap
const getHeatmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const oneYearAgo = subDays(new Date(), 364);

    const logs = await HabitLog.find({
      user: userId,
      completedAt: { $gte: oneYearAgo },
    })
      .select('dateStr xpEarned')
      .lean();

    // Aggregate by date
    const heatmapData = {};
    logs.forEach((log) => {
      if (!heatmapData[log.dateStr]) {
        heatmapData[log.dateStr] = { count: 0, xp: 0 };
      }
      heatmapData[log.dateStr].count++;
      heatmapData[log.dateStr].xp += log.xpEarned || 0;
    });

    res.json({ heatmapData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
// @route GET /api/analytics/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', '_id');
    const friendIds = user.friends.map((f) => f._id);
    friendIds.push(req.user._id);

    const leaderboard = await User.find({ _id: { $in: friendIds } })
      .select('username avatar level xp weeklyXP longestStreak')
      .sort({ weeklyXP: -1 })
      .limit(20);

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── EXPORT CSV (Premium) ────────────────────────────────────────────────────
// @route GET /api/analytics/export
const exportCSV = async (req, res) => {
  try {
    const userId = req.user._id;
    const logs = await HabitLog.find({ user: userId })
      .populate('habit', 'name frequency icon color')
      .sort({ completedAt: -1 })
      .lean();

    const header = 'Date,Habit,Frequency,XP Earned,Streak At Completion\n';
    const rows = logs.map((l) =>
      `${l.dateStr},${l.habit?.name || 'Unknown'},${l.habit?.frequency || ''},${l.xpEarned},${l.streakAtCompletion}`
    );

    const csv = header + rows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=habitforge-export.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SOCIAL: ADD FRIEND ──────────────────────────────────────────────────────
// @route POST /api/analytics/friends/:username
const addFriend = async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Can't add yourself" });
    }

    const user = await User.findById(req.user._id);
    if (user.friends.includes(target._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    user.friends.push(target._id);
    await user.save();

    res.json({ message: `You are now following ${target.username}!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard, getHeatmap, getLeaderboard, exportCSV, addFriend };
