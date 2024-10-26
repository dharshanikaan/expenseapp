const express = require('express');
const { getLeaderboard } = require('../controller/premiumfeaturescontroller'); // Make sure the path is correct
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Route to get leaderboard
router.get('/leaderboard', authenticateToken, getLeaderboard); // Ensure this matches your API endpoint

module.exports = router;
