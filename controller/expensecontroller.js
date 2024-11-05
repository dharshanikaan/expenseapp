const { body, validationResult } = require('express-validator');
const AWS = require('aws-sdk');
const { models, sequelize } = require('../util/database'); // Ensure sequelize and models are imported correctly

// Initialize AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2', // Adjust as needed
});

// Get all expenses for a user
const getExpenses = async (req, res) => {
    const userId = req.userId;

    try {
        const expenses = await models.Expense.findAll({ where: { userId } });
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
        // Call the service to handle file download and get the file URL
        const fileURL = await downloadExpensesToFile(userId);
        res.status(200).json({ fileURL, success: true });
    } catch (error) {
        console.error('Failed to upload file:', error);
        res.status(500).json({ success: false, message: 'Failed to upload expenses.' });
    }
};

// Add a new expense
const addExpense = [
    body('amount').isNumeric().withMessage('Amount is required and must be a number.'),
    body('description').notEmpty().withMessage('Description is required.'),
    body('category').notEmpty().withMessage('Category is required.'),
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

        const transaction = await sequelize.transaction();

        try {
            // Create new expense record
            const newExpense = await models.Expense.create({ amount, description, category, userId }, { transaction });

            // Update user's total expenses
            const user = await models.User.findByPk(userId, { transaction });
            if (user) {
                user.totalExpense += amount;
                await user.save({ transaction });
            }

            await transaction.commit();
            res.status(201).json(newExpense);
        } catch (error) {
            await transaction.rollback();
            console.error('Error adding expense:', error);
            res.status(500).json({ message: 'Error adding expense.', error: error.message });
        }
    }
];

// Delete an expense
const deleteExpense = async (req, res) => {
    const { expenseId } = req.body;
    const userId = req.userId;

    const transaction = await sequelize.transaction();
    try {
        const expense = await models.Expense.findOne({ where: { id: expenseId, userId }, transaction });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found or user not authorized.' });
        }

        const user = await models.User.findByPk(userId, { transaction });
        if (user) {
            user.totalExpense -= expense.amount;
            await user.save({ transaction });
        }

        await models.Expense.destroy({ where: { id: expenseId }, transaction });
        await transaction.commit();
        res.status(200).json({ message: 'Expense deleted successfully.' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting expense:', error.message);
        res.status(500).json({ message: 'Error deleting expense.', error: error.message });
    }
};

// Service Function to Download Expenses as a File
const downloadExpensesToFile = async (userId) => {
    const user = await models.User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const expenses = await user.getExpenses();
    if (!expenses || expenses.length === 0) throw new Error('No expenses found.');

    // Create a JSON string from the expenses
    const expensesData = JSON.stringify(expenses, null, 2); // Indented for better readability

    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10);  // Format date as YYYY-MM-DD
    const filename = `Expenses-${userId}-${formattedDate}.txt`; // .txt file to store expenses as JSON

    return uploadToS3(expensesData, filename);
};

// Upload file to S3 with public-read ACL
const uploadToS3 = async (data, filename) => {
    const BUCKET_NAME = "expensetracker"; // Replace with your actual S3 bucket name

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read', // File will be publicly accessible
    };

    try {
        const s3Response = await s3.putObject(params).promise();
        console.log("Upload successful", s3Response);

        // Generate a public URL to access the file
        const fileURL = `https://${BUCKET_NAME}.s3.amazonaws.com/${filename}`;
        return fileURL;
    } catch (err) {
        console.error("Error uploading to S3", err);
        throw new Error('Failed to upload to S3');
    }
};

module.exports = { addExpense, getExpenses, deleteExpense, downloadExpense };
