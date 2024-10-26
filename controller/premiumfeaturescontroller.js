// Import necessary models
const User = require('../models/user');
const Expense = require('../models/expense'); // Adjust the path as needed

// Function to get the leaderboard
const getLeaderboard = async (req, res) => {
    try {
        // Logic for fetching the leaderboard data
        // This might include aggregating user expenses, etc.
        const leaderboardData = await /* Your logic here */
        res.status(200).json(leaderboardData);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Function to get sorted expenses
const getSortedExpenses = async (req, res) => {
    const { by } = req.query;
    const userId = req.userId;

    try {
        const expenses = await Expense.findAll({
            where: { userId },
            order: by === 'income' ? [['amount', 'DESC']] : [['createdAt', 'DESC']],
        });

        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching sorted expenses:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Exporting both functions
module.exports = { getLeaderboard, getSortedExpenses };
