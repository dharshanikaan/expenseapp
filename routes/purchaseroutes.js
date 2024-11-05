const express = require('express');
const { createOrder, handlePaymentSuccess } = require('../controller/purchasecontroller'); // Ensure this path is correct
const authenticateToken = require('../middleware/authenticatetoken');

const router = express.Router();

router.post('/order', authenticateToken, createOrder);
router.post('/success', authenticateToken, handlePaymentSuccess);

module.exports = router;