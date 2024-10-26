const express = require('express');
const { getLeaderboard, getSortedExpenses } = require('../controller/premiumFeaturescontroller');
const authenticateToken = require('../middleware/authenticatetoken');
const checkPremium = require('../middleware/checkpremium');

const router = express.Router();

router.get('/leaderboard', authenticateToken, getLeaderboard);
router.get('/sort', authenticateToken, checkPremium, getSortedExpenses);

module.exports = router;
