const Razorpay = require('razorpay');
const { models } = require('../util/database'); // Import models only once
require('dotenv').config();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
    const options = {
        amount: 50000, // Amount in paisa (₹500)
        currency: 'INR',
        receipt: `receipt#${Date.now()}`,
        notes: { userId: req.userId }
    };

    try {
        const order = await razorpay.orders.create(options);
        await models.Order.create({ userId: req.userId, orderId: order.id, status: 'PENDING' });
        res.status(201).json({ orderId: order.id, amount: options.amount });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order.', error: error.message });
    }
};

const handlePaymentSuccess = async (req, res) => {
    const { orderId, paymentId } = req.body;

    try {
        const order = await models.Order.findOne({ where: { orderId } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        order.status = 'SUCCESSFUL';
        await order.save();

        await models.User.update({ isPremium: true }, { where: { id: order.userId } });
        res.status(200).json({ message: 'Payment successful.' });
    } catch (error) {
        console.error('Error handling payment:', error);
        res.status(500).json({ message: 'Error handling payment.' });
    }
};

module.exports = { createOrder, handlePaymentSuccess };