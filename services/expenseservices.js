const { models, sequelize } = require('../util/database');
const AWS = require('aws-sdk');
const { parse } = require('json2csv'); // For converting expenses to CSV format

// Initialize AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2',
});

// Get all expenses for a user
const getExpenses = async (userId) => {
    try {
        const expenses = await models.Expense.findAll({ where: { userId } });
        return expenses;
    } catch (error) {
        console.error('Error fetching expenses:', error);
        throw new Error('Error fetching expenses');
    }
};

// Add a new expense
const addExpense = async ({ amount, description, category, userId }) => {
    // Validate amount and description in service as well
    if (amount <= 0 || amount > 1000000) {
        throw new Error('Invalid amount. Amount must be positive and within a reasonable range.');
    }
    if (!category || !description) {
        throw new Error('Category and description are required.');
    }

    const transaction = await sequelize.transaction();

    try {
        // Create new expense
        const newExpense = await models.Expense.create({ amount, description, category, userId }, { transaction });

        // Update user's total expenses
        const user = await models.User.findByPk(userId, { transaction });
        if (user) {
            user.totalExpense += amount;
            await user.save({ transaction });
        }

        await transaction.commit();
        return newExpense;
    } catch (error) {
        await transaction.rollback();
        console.error('Error adding expense:', error);
        throw new Error('Error adding expense');
    }
};

// Delete an expense
const deleteExpense = async (expenseId, userId) => {
    const transaction = await sequelize.transaction();

    try {
        // Find the expense
        const expense = await models.Expense.findOne({ where: { id: expenseId, userId }, transaction });
        if (!expense) {
            throw new Error('Expense not found or user not authorized.');
        }

        // Update user's total expenses
        const user = await models.User.findByPk(userId, { transaction });
        if (user) {
            user.totalExpense -= expense.amount;
            await user.save({ transaction });
        }

        // Delete the expense
        await models.Expense.destroy({ where: { id: expenseId }, transaction });
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting expense:', error);
        throw new Error('Error deleting expense');
    }
};

// Upload expenses to S3 and return the file URL
const downloadExpensesToFile = async (userId) => {
    const user = await models.User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const expenses = await user.getExpenses();
    if (!expenses || expenses.length === 0) throw new Error('No expenses found.');

    const csvData = parse(expenses);  // Convert to CSV
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10);  // Format date as YYYY-MM-DD
    const filename = `Expenses-${userId}-${formattedDate}.csv`;

    return uploadToS3(csvData, filename);
};

// Upload file to S3
const uploadToS3 = async (data, filename) => {
    const BUCKET_NAME = "expensetracker"; // Replace with your actual S3 bucket name

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'private', // Restrict access to the file
    };

    try {
        const s3Response = await s3.putObject(params).promise();

        // Generate signed URL with an expiration time (e.g., 5 minutes)
        const signedUrlParams = {
            Bucket: BUCKET_NAME,
            Key: filename,
            Expires: 60 * 5,  // URL valid for 5 minutes
        };

        const signedUrl = s3.getSignedUrl('getObject', signedUrlParams);
        return signedUrl;
    } catch (err) {
        console.error("Error uploading to S3", err);
        throw new Error('Failed to upload to S3');
    }
};

module.exports = { addExpense, getExpenses, deleteExpense, downloadExpensesToFile };
