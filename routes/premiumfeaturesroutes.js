// routes/premiumfeaturesroutes.js
const express = require('express');
const { getLeaderboard } = require('../controller/premiumfeaturescontroller');
const authenticateToken = require('../middleware/authenticatetoken');
const checkPremium = require('../middleware/checkpremium');

const router = express.Router();

router.get('/leaderboard', authenticateToken, checkPremium, getLeaderboard);

module.exports = router;
