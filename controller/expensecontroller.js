const { validationResult } = require('express-validator');
const expenseService = require('../services/expenseservices');

// Get all expenses for a user
const getExpenses = async (req, res) => {
    const userId = req.userId;

    try {
        const expenses = await expenseService.getExpenses(userId);
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Error fetching expenses.' });
    }
};

// Download expenses as a file (upload to S3)
const downloadExpense = async (req, res) => {
    const userId = req.userId;

    try {
        const fileURL = await expenseService.downloadExpensesToFile(userId);
        res.status(200).json({ fileURL, success: true });
    } catch (error) {
        console.error('Failed to upload file:', error);
        res.status(500).json({ success: false, message: 'Failed to upload expenses.' });
    }
};

// Add a new expense
const addExpense = [
    // Express validator middleware for validating inputs
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { amount, description, category } = req.body;
        const userId = req.userId;

        // Validate expense amount
        if (amount <= 0 || amount > 1000000) {
            return res.status(400).json({ message: 'Invalid amount. Must be positive and within a reasonable range.' });
        }

        // Validate category and description
        if (!category || !description) {
            return res.status(400).json({ message: 'Category and description are required.' });
        }

        try {
            const newExpense = await expenseService.addExpense({ amount, description, category, userId });
            res.status(201).json(newExpense);
        } catch (error) {
            console.error('Error adding expense:', error);
            res.status(500).json({ message: 'Error adding expense.', error: error.message });
        }
    }
];

// Delete an expense
const deleteExpense = async (req, res) => {
    const { expenseId } = req.body;
    const userId = req.userId;

    try {
        await expenseService.deleteExpense(expenseId, userId);
        res.status(200).json({ message: 'Expense deleted successfully.' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Error deleting expense.', error: error.message });
    }
};

module.exports = { addExpense, getExpenses, deleteExpense, downloadExpense };
