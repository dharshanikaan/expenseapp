const { models } = require('../util/database');

const checkPremium = async (req, res, next) => {
    const userId = req.userId;  // userId should be attached by authenticateToken

    try {
        // Fetch the user from the database using the userId
        const user = await models.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user is a premium member
        if (!user.isPremium) {  // Assuming 'isPremium' is a boolean field in the User model
            return res.status(403).json({ message: 'Access denied. Premium membership required.' });
        }

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error checking premium membership:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = checkPremium;
