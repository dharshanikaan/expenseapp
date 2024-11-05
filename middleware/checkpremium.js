// middleware/checkpremium.js
const { models } = require('../util/database');

const checkPremium = async (req, res, next) => {
    const userId = req.userId;

    try {
        const user = await models.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (!user.isPremium) { // Assuming 'isPremium' is a field in your User model
            return res.status(403).json({ message: 'Access denied. Premium membership required.' });
        }
        next();
    } catch (error) {
        console.error('Error checking premium membership:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = checkPremium;