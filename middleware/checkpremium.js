const User = require('../models/user');

const checkPremium = async (req, res, next) => {
    const userId = req.userId; // Set by authenticateToken

    try {
        const user = await User.findByPk(userId);
        if (!user || !user.isPremium) {
            return res.status(403).json({ message: 'Access denied. Premium membership required.' });
        }
        next();
    } catch (error) {
        console.error('Error checking premium membership:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = checkPremium;
