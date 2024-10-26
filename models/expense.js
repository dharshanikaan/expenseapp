// models/expense.js
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Expense = sequelize.define('Expense', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
});

Expense.associate = (models) => {
    Expense.belongsTo(models.User, { foreignKey: 'userId' });
};

module.exports = Expense;
