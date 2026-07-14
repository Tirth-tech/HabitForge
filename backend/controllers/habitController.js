const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const User = require('../models/User');
const {
  calculateStreak,
  calculateCompletionXP,
  calculateLevel,
  getLevelInfo,
  evaluateBadges,
} = require('../utils/gamification');

// ─── GET ALL HABITS ──────────────────────────────────────────────────────────
// @route GET /api/habits
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isActive: true }).sort('order');
    const todayStr = new Date().toISOString().split('T')[0];

    // Attach doneToday flag
    const habitsWithStatus = habits.map((h) => ({
      ...h.toObject(),
      doneToday: h.lastCompletedDate === todayStr,
    }));

    res.json(habitsWithStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CREATE HABIT ────────────────────────────────────────────────────────────
// @route POST /api/habits
const createHabit = async (req, res) => {
  try {
    const { name, description, icon, color, frequency, targetDays } = req.body;

    // Free users limited to 5 habits
    if (!req.user.isPremium) {
      const count = await Habit.countDocuments({ user: req.user._id, isActive: true });
      if (count >= 5) {
        return res.status(403).json({
          message: 'Free plan limited to 5 habits. Upgrade to Premium for unlimited habits.',
          requiresPremium: true,
        });
      }
    }

    const habit = await Habit.create({
      user: req.user._id,
      name,
      description,
      icon: icon || '✨',
      color: color || '#6366f1',
      frequency: frequency || 'daily',
      targetDays: targetDays || [],
    });

    res.status(201).json({ ...habit.toObject(), doneToday: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── UPDATE HABIT ────────────────────────────────────────────────────────────
// @route PUT /api/habits/:id
const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const fields = ['name', 'description', 'icon', 'color', 'frequency', 'targetDays', 'order'];
    fields.forEach((f) => { if (req.body[f] !== undefined) habit[f] = req.body[f]; });

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE HABIT ────────────────────────────────────────────────────────────
// @route DELETE /api/habits/:id
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    habit.isActive = false;
    await habit.save();
    res.json({ message: 'Habit removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CHECK-IN (COMPLETE HABIT TODAY) ─────────────────────────────────────────
// @route POST /api/habits/:id/checkin
const checkIn = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const todayStr = new Date().toISOString().split('T')[0];

    // Prevent double check-in
    if (habit.lastCompletedDate === todayStr) {
      return res.status(400).json({ message: 'Already checked in today!', alreadyDone: true });
    }

    // Create log entry
    await HabitLog.create({
      habit: habit._id,
      user: req.user._id,
      completedAt: new Date(),
      dateStr: todayStr,
      streakAtCompletion: habit.currentStreak + 1,
    });

    // Get all completion dates for this habit to recalculate streak
    const logs = await HabitLog.find({ habit: habit._id }).select('completedAt').lean();
    const dates = logs.map((l) => l.completedAt);

    const { currentStreak, longestStreak } = calculateStreak(dates, habit.frequency);

    // Calculate XP
    const xpEarned = calculateCompletionXP(habit, currentStreak);

    // Update habit
    habit.currentStreak = currentStreak;
    habit.longestStreak = Math.max(longestStreak, habit.longestStreak, currentStreak);
    habit.lastCompletedDate = todayStr;
    habit.totalCompletions += 1;
    habit.totalXPEarned += xpEarned;
    await habit.save();

    // Update log with XP
    await HabitLog.findOneAndUpdate(
      { habit: habit._id, dateStr: todayStr },
      { xpEarned, streakAtCompletion: currentStreak }
    );

    // Update user XP, level, streak
    const user = await User.findById(req.user._id);
    user.xp += xpEarned;
    user.weeklyXP += xpEarned;
    user.totalCompletions += 1;
    user.level = calculateLevel(user.xp);
    user.longestStreak = Math.max(user.longestStreak, currentStreak);
    user.lastActiveAt = new Date();

    // Evaluate new badges
    const stats = {
      totalCompletions: user.totalCompletions,
      longestStreak: user.longestStreak,
      level: user.level,
      habitCount: await Habit.countDocuments({ user: user._id, isActive: true }),
    };
    const newBadges = evaluateBadges(stats, user.badges);
    user.badges.push(...newBadges);

    await user.save();

    res.json({
      message: '🎉 Habit completed!',
      xpEarned,
      currentStreak,
      longestStreak: habit.longestStreak,
      newBadges,
      levelInfo: getLevelInfo(user.xp),
      habit: { ...habit.toObject(), doneToday: true },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Already checked in today!', alreadyDone: true });
    }
    res.status(500).json({ message: err.message });
  }
};

// ─── UNDO CHECK-IN ───────────────────────────────────────────────────────────
// @route DELETE /api/habits/:id/checkin
const undoCheckIn = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const todayStr = new Date().toISOString().split('T')[0];
    const log = await HabitLog.findOne({ habit: habit._id, dateStr: todayStr });
    if (!log) return res.status(400).json({ message: 'No check-in found for today' });

    const xpToRemove = log.xpEarned;

    await log.deleteOne();

    // Recalculate streak
    const logs = await HabitLog.find({ habit: habit._id }).select('completedAt').lean();
    const dates = logs.map((l) => l.completedAt);
    const { currentStreak } = calculateStreak(dates, habit.frequency);

    habit.currentStreak = currentStreak;
    habit.lastCompletedDate = logs.length > 0
      ? logs.sort((a, b) => b.completedAt - a.completedAt)[0].completedAt.toISOString().split('T')[0]
      : null;
    habit.totalCompletions = Math.max(0, habit.totalCompletions - 1);
    habit.totalXPEarned = Math.max(0, habit.totalXPEarned - xpToRemove);
    await habit.save();

    // Update user XP
    const user = await User.findById(req.user._id);
    user.xp = Math.max(0, user.xp - xpToRemove);
    user.weeklyXP = Math.max(0, user.weeklyXP - xpToRemove);
    user.totalCompletions = Math.max(0, user.totalCompletions - 1);
    user.level = calculateLevel(user.xp);
    await user.save();

    res.json({
      message: 'Check-in undone',
      xpRemoved: xpToRemove,
      levelInfo: getLevelInfo(user.xp),
      habit: { ...habit.toObject(), doneToday: false },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET HABIT HISTORY (for heatmap) ─────────────────────────────────────────
// @route GET /api/habits/:id/history
const getHabitHistory = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const logs = await HabitLog.find({ habit: habit._id })
      .select('dateStr completedAt xpEarned streakAtCompletion')
      .sort({ completedAt: 1 });

    res.json({ habit, logs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getHabits, createHabit, updateHabit, deleteHabit, checkIn, undoCheckIn, getHabitHistory };
