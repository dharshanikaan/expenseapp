const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Order = sequelize.define('Order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type:Sequelize.INTEGER,
        allowNull: false,
    },
    orderId: {
        type:Sequelize.STRING,
        allowNull: false,
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

module.exports = Order;