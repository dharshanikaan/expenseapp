const AWS = require('aws-sdk');
const { models, sequelize } = require('../util/database'); // Ensure both are imported correctly
const User = require('../models/user');
const Expense = require('../models/expense')
const { body, validationResult } = require('express-validator');


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2', // Adjust as needed
});

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

const downloadExpense = async (req, res) => {
    try {
        const userId = req.userId; // Ensure this is set by authenticateToken
        const user = await models.User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const expenses = await user.getExpenses(); // Ensure `getExpenses` is defined
        if (!expenses) {
            return res.status(404).json({ message: 'No expenses found.' });
        }

        const stringifiedExpenses = JSON.stringify(expenses);
        const filename = 'Expense.txt';

        const fileURL = await uploadToS3(stringifiedExpenses, filename);
        res.status(200).json({ fileURL, success: true });
    } catch (error) {
        console.error("Failed to upload file:", error);
        res.status(500).json({ success: false, message: "Failed to upload expenses." });
    }
};

async function uploadToS3(data, filename) {
    const BUCKET_NAME = "expensetractor";

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read',
    };

    try {
        const s3Response = await s3.putObject(params).promise();
        console.log("Upload successful", s3Response);
        return `https://${BUCKET_NAME}.s3.amazonaws.com/${filename}`;
    } catch (err) {
        console.error("Error uploading to S3", err);
        throw err;
    }
}

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

        amount = Number(amount);
        const transaction = await sequelize.transaction();

        try {
            const newExpense = await models.Expense.create({ amount, description, category, userId }, { transaction });
            console.log('New Expense Created:', newExpense);

            const user = await models.User.findByPk(userId, { transaction });
            if (user) {
                console.log('Current totalExpense before update:', user.totalExpense);
                user.totalExpense += amount;
                await user.save({ transaction });
                console.log('New totalExpense after update:', user.totalExpense);
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

module.exports = { addExpense, getExpenses, deleteExpense, downloadExpense };
