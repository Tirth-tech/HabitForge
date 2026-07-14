const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getLevelInfo, evaluateBadges } = require('../utils/gamification');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc  Register user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or email already taken' });
    }

    const user = await User.create({ username, email, password, avatar: avatar || 'warrior' });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        badges: user.badges,
        isPremium: user.isPremium,
        weeklyXP: user.weeklyXP,
        levelInfo: getLevelInfo(user.xp),
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last active
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        badges: user.badges,
        isPremium: user.isPremium,
        weeklyXP: user.weeklyXP,
        totalCompletions: user.totalCompletions,
        longestStreak: user.longestStreak,
        levelInfo: getLevelInfo(user.xp),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username avatar level xp weeklyXP')
      .populate('friendRequests', 'username avatar level');

    res.json({
      ...user.toObject(),
      levelInfo: getLevelInfo(user.xp),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update profile (avatar, username)
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (username) user.username = username;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      ...user.toObject(),
      levelInfo: getLevelInfo(user.xp),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Upgrade to premium (mock)
// @route POST /api/auth/upgrade
const upgradePremium = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isPremium = true;
    user.premiumSince = new Date();
    await user.save();

    res.json({ message: 'Upgraded to Premium!', isPremium: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, upgradePremium };
