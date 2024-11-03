const express = require('express');
const { downloadExpense,addExpense, getExpenses, deleteExpense } = require('../controller/expensecontroller');
const authenticateToken = require('../middleware/authenticatetoken');

const router = express.Router();

router.post('/', authenticateToken, addExpense);
router.get('/', authenticateToken, getExpenses);
router.delete('/', authenticateToken, deleteExpense);
router.get('/download', authenticateToken, downloadExpense); 

module.exports = router;