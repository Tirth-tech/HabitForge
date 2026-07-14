const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: 60,
    },
    description: {
      type: String,
      maxlength: 200,
      default: '',
    },
    icon: {
      type: String,
      default: '✨',
    },
    color: {
      type: String,
      default: '#6366f1', // indigo
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    targetDays: {
      // For weekly habits: which days of week (0=Sun, 6=Sat)
      type: [Number],
      default: [],
    },
    // ── Streak ─────────────────────────────────────────────────
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastCompletedDate: { type: String, default: null }, // YYYY-MM-DD
    // ── Stats ──────────────────────────────────────────────────
    totalCompletions: { type: Number, default: 0 },
    totalXPEarned: { type: Number, default: 0 },
    // ── Status ─────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isPremiumFeature: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: is this habit done today?
habitSchema.virtual('doneToday').get(function () {
  const todayStr = new Date().toISOString().split('T')[0];
  return this.lastCompletedDate === todayStr;
});

habitSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Habit', habitSchema);
