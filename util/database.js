const Sequelize = require('sequelize');
const sequelize = new Sequelize('user', 'root', 'root', {
    host: "localhost",
    dialect: "mysql",
    port: 3305,
});

const User = require('../models/user')(sequelize, Sequelize.DataTypes);
const Expense = require('../models/expense')(sequelize, Sequelize.DataTypes);
const Order = require('../models/order')(sequelize, Sequelize.DataTypes);
const ForgotPasswordRequest = require('../models/forgotpassword')(sequelize, Sequelize.DataTypes);

const models = {
    User,
    Expense,
    Order,
    ForgotPasswordRequest,
};

Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = { sequelize, models };
