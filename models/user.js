const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    isPremium: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    totalExpense: { // Correctly defined field
        type: Sequelize.INTEGER,
        defaultValue: 0,
    }
});

// Add association
User.associate = (models) => {
    User.hasMany(models.Expense, { foreignKey: 'userId' });
};

module.exports = User;
