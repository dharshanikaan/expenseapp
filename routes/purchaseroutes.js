const express = require('express');
const { createOrder, handlePaymentSuccess } = require('../controller/purchasecontroller');
const authenticateToken = require('../middleware/authenticatetoken');

const router = express.Router();

router.post('/order', authenticateToken, createOrder);
router.post('/success', authenticateToken, handlePaymentSuccess);

module.exports = router;