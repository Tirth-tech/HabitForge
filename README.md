# ⚔️ HabitForge — Gamified Habit Tracking Application

> Turn your daily habits into an RPG adventure. Earn XP, build streaks, unlock badges, and level up your life.

![HabitForge Banner](https://img.shields.io/badge/HabitForge-⚔️%20Level%20Up%20Your%20Life-7c3aed?style=for-the-badge)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/habitforge
JWT_SECRET=your_secret_key
PORT=5000
```

### 3. Seed Demo Data

```bash
cd backend && npm run seed
```

This creates a **Demo User** with 90 days of history:
- **Email**: `demo@habitforge.com`  
- **Password**: `demo1234`

### 4. Start Servers

```bash
# Terminal 1 – Backend
cd backend && npm run dev

# Terminal 2 – Frontend
cd frontend && npm run dev
```

App runs at: **http://localhost:5173**

---

## 🏗️ Architecture

```
HabitForge/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Auth endpoints
│   │   ├── habitController.js    # Habit CRUD + check-in
│   │   └── analyticsController.js # Charts + heatmap + export
│   ├── middleware/auth.js        # JWT + Premium guards
│   ├── models/
│   │   ├── User.js               # User + gamification fields
│   │   ├── Habit.js              # Habit with streak tracking
│   │   └── HabitLog.js           # Time-series completion logs
│   ├── routes/                   # Express routes
│   ├── utils/gamification.js     # ⭐ Core XP, Level, Streak, Badge logic
│   ├── seed/seeder.js            # Demo data seeder
│   └── server.js                 # Express entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── HabitCard.jsx     # Reusable habit card with check-in
    │   │   ├── HabitFormModal.jsx # Create/edit habit modal
    │   │   └── Heatmap.jsx       # GitHub-style activity heatmap
    │   ├── context/
    │   │   ├── AuthContext.jsx   # User auth state
    │   │   └── HabitsContext.jsx # Habits state + XP updates
    │   ├── layouts/AppLayout.jsx # Sidebar navigation
    │   ├── pages/
    │   │   ├── Login.jsx / Register.jsx
    │   │   ├── Dashboard.jsx     # Main dashboard + stats
    │   │   ├── Habits.jsx        # Habit management
    │   │   ├── Analytics.jsx     # Charts + heatmap
    │   │   ├── Leaderboard.jsx   # Friends + weekly XP ranking
    │   │   ├── Profile.jsx       # Badge collection + stats
    │   │   └── Upgrade.jsx       # Premium upgrade page
    │   ├── services/api.js       # Axios with auth interceptors
    │   └── utils/gamification.js # Frontend XP/Level display
```

---

## 🧮 Streak Calculation Algorithm

### The Core Problem
Streaks must be calculated from historical logs, not stored state, to handle edge cases like undo, retroactive edits, and timezone shifts.

### Implementation

```javascript
// backend/utils/gamification.js
const calculateStreak = (completionDates, frequency = 'daily') => {
  // 1. Normalize all dates to UTC midnight strings (YYYY-MM-DD)
  //    This prevents timezone-based off-by-one errors.
  const dateStrings = completionDates.map((d) =>
    new Date(d).toISOString().split('T')[0]
  );
  
  // 2. Deduplicate (one entry per day) and sort descending
  const uniqueDates = [...new Set(dateStrings)].sort((a, b) => (a > b ? -1 : 1));
  
  // 3. Check if streak is still active:
  //    Last completion must be TODAY or YESTERDAY.
  //    If it's 2+ days ago, current streak = 0.
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return { currentStreak: 0, longestStreak: calculateLongestStreak(uniqueDates) };
  }
  
  // 4. Walk backwards from most recent date,
  //    counting consecutive days
  let streak = 0;
  let checkDate = new Date(uniqueDates[0]);
  
  for (const dateStr of uniqueDates) {
    const expected = checkDate.toISOString().split('T')[0];
    if (dateStr === expected) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000); // go back 1 day
    } else {
      break; // gap found, streak ends
    }
  }
  
  return { currentStreak: streak, longestStreak: calculateLongestStreak(uniqueDates) };
};
```

### Timezone Handling
- All dates are stored as **UTC midnight** in MongoDB
- The client sends the local date as a string (`YYYY-MM-DD`)
- Server parses it as UTC midnight → no timezone drift
- "Yesterday" is always computed as `now - 86400000ms` in UTC

### Missed Days
- A missed day simply breaks the consecutive sequence in step 4
- The streak resets to 0 on the next check-in
- Longest streak is preserved separately via `calculateLongestStreak()`

### Weekly Habits
- Weekly habits track which calendar weeks had at least one completion
- Uses ISO week numbering (`year-Wweek`)
- Missing a week resets the weekly streak

---

## 🎮 Gamification System

### XP Formula
```
Base XP (daily) = 10
Streak Bonus    = min(streak × 2, 50)  
Weekly Habit XP = 15

Total XP per check-in = Base + Streak Bonus
```

### Level Formula
```
Level = floor(sqrt(XP / 50)) + 1
XP for Level N = (N-1)² × 50
```

Example milestones:
| Level | XP Required |
|-------|-------------|
| 1     | 0 XP        |
| 2     | 50 XP       |
| 5     | 800 XP      |
| 10    | 4,050 XP    |
| 20    | 18,050 XP   |

### Badges
| Badge | Trigger |
|-------|---------|
| 👶 First Step | 1st completion |
| ⚔️ Week Warrior | 7-day streak |
| 🔥 On Fire | 14-day streak |
| 👑 Consistency King | 30-day streak |
| 🏛️ Centurion | 100 completions |
| 🌟 Legend | Level 10 |
| 🎯 Habit Master | 5+ active habits |
| 🔱 Iron Will | 500 completions |

---

## 💎 Freemium Model

| Feature | Free | Pro |
|---------|------|-----|
| Active Habits | 5 | Unlimited |
| Daily/Weekly Tracking | ✅ | ✅ |
| XP & Levels | ✅ | ✅ |
| Badges | ✅ | ✅ |
| 30-Day Charts | ✅ | ✅ |
| **Activity Heatmap** | 🔒 | ✅ |
| **CSV Export** | 🔒 | ✅ |
| **Advanced Analytics** | 🔒 | ✅ |

Premium is gated at the API level via `isPremium: Boolean` on the User model and the `premiumOnly` middleware.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router 6 |
| Animations | Framer Motion |
| Charts | Chart.js + react-chartjs-2 |
| Styling | Vanilla CSS (custom design system) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (30-day expiry) |
| Date Utils | date-fns |

---

## 📡 API Reference

### Auth
```
POST /api/auth/register   — Create account
POST /api/auth/login      — Login
GET  /api/auth/me         — Get current user (protected)
PUT  /api/auth/profile    — Update username/avatar
POST /api/auth/upgrade    — Upgrade to premium
```

### Habits
```
GET    /api/habits              — List all habits
POST   /api/habits              — Create habit
PUT    /api/habits/:id          — Update habit
DELETE /api/habits/:id          — Soft delete habit
POST   /api/habits/:id/checkin  — Check in (complete today)
DELETE /api/habits/:id/checkin  — Undo today's check-in
GET    /api/habits/:id/history  — Completion history
```

### Analytics
```
GET  /api/analytics/dashboard           — 30-day stats + charts
GET  /api/analytics/heatmap             — 1-year heatmap (Premium)
GET  /api/analytics/leaderboard         — Friends weekly XP
GET  /api/analytics/export              — CSV download (Premium)
POST /api/analytics/friends/:username   — Follow a player
```

---

## 📄 License
MIT © HabitForge 2024
