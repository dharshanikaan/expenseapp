const Expense = require('../models/expense');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const sequelize = require('../util/database');

const getExpenses = async (req, res) => {
    const userId = req.userId;

    try {
        const expenses = await Expense.findAll({ where: { userId } });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Error fetching expenses.' });
    }
};
const addExpense = [
    body('amount').isNumeric().withMessage('Amount is required and must be a number.'),
    body('description').notEmpty().withMessage('Description is required.'),
    body('category').notEmpty().withMessage('Category is required.'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { amount, description, category } = req.body;
        const userId = req.userId;

        // Convert amount to a number
        amount = Number(amount);
        console.log('Converted amount:', amount); // Log the converted amount

        const transaction = await sequelize.transaction();
        try {
            const newExpense = await Expense.create({ amount, description, category, userId }, { transaction });

            const user = await User.findByPk(userId, { transaction });
            if (user) {
                console.log('Current totalexpense:', user.totalexpense);
                console.log('Amount to add:', amount);
                
                // Check if the amount is a valid number
                if (!isNaN(amount) && amount >= 0) {
                    user.totalexpense += amount; // Update total expense
                    await user.save({ transaction });
                } else {
                    throw new Error('Invalid amount for expense.');
                }
            }

            await transaction.commit();
            res.status(201).json(newExpense);
        } catch (error) {
            await transaction.rollback();
            console.error('Error adding expense:', error); // Log full error
            res.status(500).json({ message: 'Error adding expense.', error: error.message });
        }
    }
];

const deleteExpense = async (req, res) => {
    const { expenseId } = req.body;
    const userId = req.userId;

    try {
        const expense = await Expense.findOne({ where: { id: expenseId, userId } });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found or user not authorized.' });
        }

        await Expense.destroy({ where: { id: expenseId } });
        res.status(200).json({ message: 'Expense deleted successfully.' });
    } catch (error) {
        console.error('Error deleting expense:', error.message);
        res.status(500).json({ message: 'Error deleting expense.', error: error.message });
    }
};

module.exports = { addExpense, getExpenses, deleteExpense };