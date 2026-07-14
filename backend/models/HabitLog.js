const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema(
  {
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Stored as UTC midnight of the completion date
    completedAt: {
      type: Date,
      required: true,
    },
    // ISO date string YYYY-MM-DD for fast querying
    dateStr: {
      type: String,
      required: true,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    streakAtCompletion: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

// Compound index: one log per habit per day
habitLogSchema.index({ habit: 1, dateStr: 1 }, { unique: true });
habitLogSchema.index({ user: 1, dateStr: 1 });

module.exports = mongoose.model('HabitLog', habitLogSchema);
