const paymentService = require('../services/purchaseservices');

const createOrder = async (req, res) => {
    const amount = 500; // Example static amount for the order
    const userId = req.userId;
    try {
        const order = await paymentService.createOrder(userId, amount);
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const handlePaymentSuccess = async (req, res) => {
    const { orderId, paymentId } = req.body;
    try {
        await paymentService.handlePaymentSuccess(orderId, paymentId);
        res.status(200).json({ message: 'Payment successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, handlePaymentSuccess };
