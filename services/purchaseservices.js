const Razorpay = require('razorpay');
const { models } = require('../util/database');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (userId, amount) => {
    const options = {
        amount: amount * 100, // Convert amount to paisa (₹500 = 50000 paisa)
        currency: 'INR',
        receipt: `receipt#${Date.now()}`,
        notes: { userId }
    };

    try {
        const order = await razorpay.orders.create(options);
        await models.Order.create({ userId, orderId: order.id, status: 'PENDING' });
        return { orderId: order.id, amount: options.amount };
    } catch (error) {
        throw new Error('Error creating Razorpay order: ' + error.message);
    }
};

const handlePaymentSuccess = async (orderId, paymentId) => {
    try {
        const order = await models.Order.findOne({ where: { orderId } });
        if (!order) throw new Error('Order not found.');

        order.status = 'SUCCESSFUL';
        await order.save();

        await models.User.update({ isPremium: true }, { where: { id: order.userId } });
    } catch (error) {
        throw new Error('Error handling payment success: ' + error.message);
    }
};

module.exports = { createOrder, handlePaymentSuccess };
