const express = require('express');
const router = express.Router();
const { protect, premiumOnly } = require('../middleware/auth');
const {
  getDashboard,
  getHeatmap,
  getLeaderboard,
  exportCSV,
  addFriend,
} = require('../controllers/analyticsController');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/heatmap', premiumOnly, getHeatmap);
router.get('/leaderboard', getLeaderboard);
router.get('/export', premiumOnly, exportCSV);
router.post('/friends/:username', addFriend);

module.exports = router;
