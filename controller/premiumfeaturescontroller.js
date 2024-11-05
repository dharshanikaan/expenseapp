// controller/premiumfeaturescontroller.js
const { models } = require('../util/database');

const getLeaderboard = async (req, res) => {
    try {
        const users = await models.User.findAll({
            attributes: ['id', 'name', 'totalExpense'],
            order: [['totalExpense', 'DESC']],
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        res.status(500).json({ message: 'Error fetching leaderboard.' });
    }
};

module.exports = { getLeaderboard };