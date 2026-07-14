const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: 'warrior', // warrior, mage, rogue, paladin
    },
    // ── Gamification ──────────────────────────────────────────
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    weeklyXP: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    badges: [
      {
        id: String,
        name: String,
        description: String,
        icon: String,
        rarity: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    // ── Premium ────────────────────────────────────────────────
    isPremium: { type: Boolean, default: false },
    premiumSince: { type: Date },
    // ── Social ─────────────────────────────────────────────────
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // ── Meta ───────────────────────────────────────────────────
    lastActiveAt: { type: Date, default: Date.now },
    weeklyXPResetAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
