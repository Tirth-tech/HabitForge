/**
 * Frontend gamification utilities (mirrors backend for display purposes).
 */

export const calculateLevel = (totalXP) => {
  if (totalXP < 0) return 1;
  return Math.floor(Math.sqrt(totalXP / 50)) + 1;
};

export const getLevelInfo = (totalXP) => {
  const level = calculateLevel(totalXP);
  const currentLevelXP = Math.pow(level - 1, 2) * 50;
  const nextLevelXP = Math.pow(level, 2) * 50;
  const xpIntoLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min(100, Math.floor((xpIntoLevel / xpNeeded) * 100));
  return { level, currentLevelXP, nextLevelXP, xpIntoLevel, xpNeeded, progressPercent, totalXP };
};

export const getAllBadges = () => [
  { id: 'first_step', name: 'First Step', description: 'Complete your first habit', icon: '👶', rarity: 'common' },
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day streak', icon: '⚔️', rarity: 'uncommon' },
  { id: 'consistency_king', name: 'Consistency King', description: '30-day streak', icon: '👑', rarity: 'rare' },
  { id: 'centurion', name: 'Centurion', description: '100 completions', icon: '🏛️', rarity: 'rare' },
  { id: 'legend', name: 'Legend', description: 'Reach Level 10', icon: '🌟', rarity: 'legendary' },
  { id: 'habit_master', name: 'Habit Master', description: '5+ active habits', icon: '🎯', rarity: 'uncommon' },
  { id: 'iron_will', name: 'Iron Will', description: '500 completions', icon: '🔱', rarity: 'legendary' },
  { id: 'on_fire', name: 'On Fire', description: '14-day streak', icon: '🔥', rarity: 'uncommon' },
];
