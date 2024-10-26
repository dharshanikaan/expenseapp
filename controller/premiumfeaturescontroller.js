// Import necessary models
const User = require('../models/user');
const Expense = require('../models/expense'); // Adjust the path as needed
const { Op } = require('sequelize');
const sequelize = require('sequelize');
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

// Function to get sorted expenses (unchanged)
const getExpensesReport = async (req, res) => {
    try {
        // Fetch expenses from the database (replace with your actual query)
        const expenses = await Expenses.find(); // Example query
        const totalIncome = expenses.reduce((sum, entry) => sum + (entry.income || 0), 0);
        const totalExpenses = expenses.reduce((sum, entry) => sum + (entry.expenses || 0), 0);
        const totalSavings = totalIncome - totalExpenses;

        res.set('Cache-Control', 'no-store'); // Disable caching
        console.log('Fetched expenses:', expenses); // Log fetched expenses
        res.status(200).json({ expenses, totalIncome, totalExpenses, totalSavings });
    } catch (error) {
        console.error('Error fetching expenses report:', error.message);
        res.status(500).json({ message: 'Error fetching expenses report.' });
    }
};


// Exporting both functions
module.exports = { getLeaderboard, getExpensesReport};
