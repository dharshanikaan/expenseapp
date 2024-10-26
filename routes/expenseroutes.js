const express = require('express');
const { addExpense, getExpenses, deleteExpense } = require('../controller/expensecontroller');
const authenticateToken = require('../middleware/authenticatetoken');

const router = express.Router();

router.post('/', authenticateToken, addExpense);
router.get('/', authenticateToken, getExpenses);
router.delete('/', authenticateToken, deleteExpense);

module.exports = router;