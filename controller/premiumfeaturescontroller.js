// Import necessary models
const { models } = require('../util/database'); 
const User = require('../models/user');
const { Op } = require('sequelize'); // Keep this if you're using Op elsewhere

// Function to get the leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'totalExpense'], // Ensure these fields exist in your model
            order: [['totalExpense', 'DESC']] // Sort by totalExpense in descending order
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        res.status(500).json({ message: 'Error fetching leaderboard.' });
    }
};

// Exporting both functions
module.exports = { getLeaderboard };
