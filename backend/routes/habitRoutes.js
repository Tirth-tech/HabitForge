const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  checkIn,
  undoCheckIn,
  getHabitHistory,
} = require('../controllers/habitController');

router.use(protect);

router.route('/').get(getHabits).post(createHabit);
router.route('/:id').put(updateHabit).delete(deleteHabit);
router.route('/:id/checkin').post(checkIn).delete(undoCheckIn);
router.get('/:id/history', getHabitHistory);

module.exports = router;
