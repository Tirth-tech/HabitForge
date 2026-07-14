/**
 * HabitForge Gamification Engine
 * ================================
 * Centralized module for XP, Level, Streak, and Badge calculations.
 */

// ─── XP CONFIG ────────────────────────────────────────────────────────────────
const XP_CONFIG = {
  BASE_COMPLETION: 10,        // XP per habit completion
  STREAK_BONUS_PER_DAY: 2,    // Extra XP per streak day
  MAX_STREAK_BONUS: 50,       // Cap on streak bonus
  PERFECT_DAY_BONUS: 25,      // All habits done in a day
  WEEKLY_HABIT_XP: 15,        // Weekly habit completion XP
};

// ─── LEVEL CONFIG ─────────────────────────────────────────────────────────────
// Level = floor(sqrt(XP / 50)) + 1
// XP needed for level N = (N-1)^2 * 50
const LEVEL_CONSTANT = 50;

/**
 * Calculate user level from total XP.
 * Formula: Level = floor(sqrt(XP / LEVEL_CONSTANT)) + 1
 */
const calculateLevel = (totalXP) => {
  if (totalXP < 0) return 1;
  return Math.floor(Math.sqrt(totalXP / LEVEL_CONSTANT)) + 1;
};

/**
 * Calculate XP required to reach a specific level.
 */
const xpForLevel = (level) => {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * LEVEL_CONSTANT;
};

/**
 * Get XP progress info for a user.
 * Returns: { level, currentLevelXP, nextLevelXP, progressPercent, totalXP }
 */
const getLevelInfo = (totalXP) => {
  const level = calculateLevel(totalXP);
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const xpIntoLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min(100, Math.floor((xpIntoLevel / xpNeeded) * 100));

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    xpIntoLevel,
    xpNeeded,
    progressPercent,
    totalXP,
  };
};

/**
 * Calculate XP earned for a single habit completion.
 * Factors in streak bonus.
 */
const calculateCompletionXP = (habit, currentStreak) => {
  const baseXP = habit.frequency === 'weekly'
    ? XP_CONFIG.WEEKLY_HABIT_XP
    : XP_CONFIG.BASE_COMPLETION;

  const streakBonus = Math.min(
    currentStreak * XP_CONFIG.STREAK_BONUS_PER_DAY,
    XP_CONFIG.MAX_STREAK_BONUS
  );

  return baseXP + streakBonus;
};

// ─── STREAK LOGIC ─────────────────────────────────────────────────────────────
/**
 * Calculate streak for a habit based on its completion log.
 *
 * Algorithm:
 * 1. Get today's date (UTC, normalized to midnight).
 * 2. Sort logs descending by date.
 * 3. Walk back from today — if yesterday is in logs, streak++, else break.
 * 4. If today is in logs, streak includes today.
 *
 * Timezone note: All dates are stored as UTC midnight. The client sends
 * the local date as a string (YYYY-MM-DD) which we parse as UTC. This
 * prevents timezone-based miscounting.
 *
 * @param {Array<Date>} completionDates - Array of UTC Date objects
 * @param {string} frequency - 'daily' | 'weekly'
 * @returns {{ currentStreak: number, longestStreak: number }}
 */
const calculateStreak = (completionDates, frequency = 'daily') => {
  if (!completionDates || completionDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  if (frequency === 'weekly') {
    return calculateWeeklyStreak(completionDates);
  }

  // Normalize all dates to UTC midnight strings for comparison
  const dateStrings = completionDates.map((d) => {
    const date = new Date(d);
    return date.toISOString().split('T')[0];
  });

  const uniqueDates = [...new Set(dateStrings)].sort((a, b) => (a > b ? -1 : 1)); // descending

  if (uniqueDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // If last completion is not today or yesterday, streak is broken
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return { currentStreak: 0, longestStreak: calculateLongestStreak(uniqueDates) };
  }

  // Walk back to count current streak
  let currentStreak = 0;
  let checkDate = new Date(uniqueDates[0]);

  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedStr = checkDate.toISOString().split('T')[0];
    if (uniqueDates[i] === expectedStr) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 86400000); // go back 1 day
    } else {
      break;
    }
  }

  const longestStreak = calculateLongestStreak(uniqueDates);

  return { currentStreak, longestStreak };
};

/**
 * Calculate the longest streak from an array of date strings (descending).
 */
const calculateLongestStreak = (sortedDatesDesc) => {
  if (!sortedDatesDesc.length) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < sortedDatesDesc.length; i++) {
    const prev = new Date(sortedDatesDesc[i - 1]);
    const curr = new Date(sortedDatesDesc[i]);
    const diffDays = Math.round((prev - curr) / 86400000);

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
};

/**
 * Calculate weekly streak (weeks where habit was done at least once).
 */
const calculateWeeklyStreak = (completionDates) => {
  const getWeekKey = (date) => {
    const d = new Date(date);
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${week}`;
  };

  const weeks = [...new Set(completionDates.map((d) => getWeekKey(d)))].sort().reverse();

  if (weeks.length === 0) return { currentStreak: 0, longestStreak: 0 };

  return { currentStreak: weeks.length, longestStreak: weeks.length };
};

// ─── BADGE SYSTEM ─────────────────────────────────────────────────────────────
const BADGE_DEFINITIONS = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first habit',
    icon: '👶',
    rarity: 'common',
    condition: (stats) => stats.totalCompletions >= 1,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚔️',
    rarity: 'uncommon',
    condition: (stats) => stats.longestStreak >= 7,
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    rarity: 'rare',
    condition: (stats) => stats.longestStreak >= 30,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: '100 total habit completions',
    icon: '🏛️',
    rarity: 'rare',
    condition: (stats) => stats.totalCompletions >= 100,
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Reach Level 10',
    icon: '🌟',
    rarity: 'legendary',
    condition: (stats) => stats.level >= 10,
  },
  {
    id: 'habit_master',
    name: 'Habit Master',
    description: 'Have 5+ active habits',
    icon: '🎯',
    rarity: 'uncommon',
    condition: (stats) => stats.habitCount >= 5,
  },
  {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Complete 500 habits total',
    icon: '🔱',
    rarity: 'legendary',
    condition: (stats) => stats.totalCompletions >= 500,
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    description: '14-day streak',
    icon: '🔥',
    rarity: 'uncommon',
    condition: (stats) => stats.longestStreak >= 14,
  },
];

/**
 * Evaluate which badges a user should earn given their stats.
 * @param {Object} stats - { totalCompletions, longestStreak, level, habitCount }
 * @param {Array} currentBadges - IDs of already-earned badges
 * @returns {Array} - Newly earned badge objects
 */
const evaluateBadges = (stats, currentBadges = []) => {
  const earnedIds = new Set(currentBadges.map((b) => b.id || b));
  const newBadges = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (!earnedIds.has(badge.id) && badge.condition(stats)) {
      newBadges.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        earnedAt: new Date(),
      });
    }
  }

  return newBadges;
};

/**
 * Get all badge definitions (for display purposes).
 */
const getAllBadges = () => BADGE_DEFINITIONS;

module.exports = {
  calculateLevel,
  xpForLevel,
  getLevelInfo,
  calculateCompletionXP,
  calculateStreak,
  calculateLongestStreak,
  evaluateBadges,
  getAllBadges,
  XP_CONFIG,
  BADGE_DEFINITIONS,
};
