const express = require('express');
const { getLeaderboard, getExpensesReport } = require('../controller/premiumfeaturescontroller');
const authenticateToken = require('../middleware/authenticatetoken');
const checkPremium = require('../middleware/checkpremium');

const router = express.Router();

router.get('/leaderboard', authenticateToken, checkPremium, getLeaderboard);
router.get('/report', authenticateToken, checkPremium, getExpensesReport);

module.exports = router;
