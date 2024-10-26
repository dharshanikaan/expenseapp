// Import necessary models
const User = require('../models/user');
const Expense = require('../models/expense'); // Adjust the path as needed
const { Op } = require('sequelize');
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
        const userId = req.userId; // Get user ID from request

        // Fetch expenses for the user
        const expenses = await Expense.findAll({
            where: { userId },
            attributes: [
                ['createdAt', 'date'],
                'description',
                [sequelize.fn('SUM', sequelize.col('amount')), 'salary'], // Assuming income is also stored as an expense
                [sequelize.fn('SUM', sequelize.col('otherExpenses')), 'otherExpenses'],
            ],
            group: ['date', 'description'],
            order: [['createdAt', 'DESC']]
        });

        // Calculate total income and savings
        let totalIncome = 0;
        let totalExpenses = 0;
        
        const reportData = expenses.map(exp => {
            const isIncome = exp.description.toLowerCase().includes('salary'); // Example check
            if (isIncome) totalIncome += exp.salary;
            else totalExpenses += exp.otherExpenses;

            return {
                date: exp.date,
                description: exp.description,
                salary: isIncome ? exp.salary : 0,
                otherExpenses: !isIncome ? exp.otherExpenses : 0,
                savings: totalIncome - totalExpenses
            };
        });

        res.status(200).json(reportData);
    } catch (error) {
        console.error('Error fetching expenses report:', error.message);
        res.status(500).json({ message: 'Error fetching expenses report.' });
    }
};
// Exporting both functions
module.exports = { getLeaderboard, getExpensesReport};
