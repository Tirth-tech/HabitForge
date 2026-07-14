const User = require('../models/User');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { subDays, format } = require('date-fns');
const { calculateStreak, calculateLevel, evaluateBadges } = require('./gamification');

const DEMO_HABITS = [
  { name: 'Drink 8 Glasses of Water', icon: '💧', color: '#06b6d4', frequency: 'daily' },
  { name: 'Read 30 Minutes', icon: '📚', color: '#8b5cf6', frequency: 'daily' },
  { name: 'Morning Exercise', icon: '🏋️', color: '#f59e0b', frequency: 'daily' },
  { name: 'Meditate 10 mins', icon: '🧘', color: '#10b981', frequency: 'daily' },
  { name: 'Weekly Review', icon: '📝', color: '#ef4444', frequency: 'weekly' },
];

const autoSeed = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📊 Database already populated, skipping auto-seed.');
      return;
    }

    console.log('🌱 Database is empty. Running auto-seeder...');

    // Create demo user
    const demoUser = await User.create({
      username: 'DemoWarrior',
      email: 'demo@habitforge.com',
      password: 'demo1234',
      avatar: 'warrior',
      isPremium: true,
    });

    console.log(`👤 Created demo user: ${demoUser.username}`);

    // Create habits
    const habits = await Habit.insertMany(
      DEMO_HABITS.map((h, i) => ({ ...h, user: demoUser._id, order: i }))
    );

    console.log(`✅ Created ${habits.length} demo habits`);

    // Generate 90 days of history
    const today = new Date();
    let totalXP = 0;
    let totalCompletions = 0;

    for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
      const date = subDays(today, dayOffset);
      const dateStr = format(date, 'yyyy-MM-dd');

      for (const habit of habits) {
        const shouldComplete = habit.frequency === 'weekly'
          ? date.getDay() === 1 && Math.random() > 0.2  // Mondays
          : Math.random() > 0.25;

        if (!shouldComplete) continue;

        try {
          const xpEarned = 10 + Math.floor(Math.random() * 15);
          await HabitLog.create({
            habit: habit._id,
            user: demoUser._id,
            completedAt: new Date(dateStr + 'T08:00:00Z'),
            dateStr,
            xpEarned,
            streakAtCompletion: Math.floor(dayOffset / 3),
          });
          totalXP += xpEarned;
          totalCompletions++;
        } catch (e) {
          // Skip duplicates
        }
      }
    }

    console.log(`📊 Generated ${totalCompletions} log entries`);

    // Update each habit's streak from logs
    for (const habit of habits) {
      const logs = await HabitLog.find({ habit: habit._id }).select('completedAt').lean();
      const dates = logs.map((l) => l.completedAt);
      const { currentStreak, longestStreak } = calculateStreak(dates, habit.frequency);

      const lastLog = logs.sort((a, b) => b.completedAt - a.completedAt)[0];
      const lastCompletedDate = lastLog ? format(new Date(lastLog.completedAt), 'yyyy-MM-dd') : null;

      await Habit.findByIdAndUpdate(habit._id, {
        currentStreak,
        longestStreak,
        lastCompletedDate,
        totalCompletions: logs.length,
        totalXPEarned: totalXP / habits.length,
      });
    }

    // Update user stats
    demoUser.xp = totalXP;
    demoUser.weeklyXP = Math.floor(totalXP * 0.08);
    demoUser.totalCompletions = totalCompletions;
    demoUser.level = calculateLevel(totalXP);
    demoUser.longestStreak = 23;

    const stats = {
      totalCompletions,
      longestStreak: 23,
      level: demoUser.level,
      habitCount: habits.length,
    };
    const badges = evaluateBadges(stats, []);
    demoUser.badges = badges;

    await demoUser.save();

    console.log(`🎮 Demo User Auto-Seeded:`);
    console.log(`   Email: demo@habitforge.com`);
    console.log(`   Password: demo1234`);
    console.log('✅ Auto-seeding complete!\n');
  } catch (error) {
    console.error('❌ Auto-seeder failed:', error);
  }
};

module.exports = autoSeed;
