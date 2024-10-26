const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ForgotPasswordRequest = sequelize.define('ForgotPasswordRequest', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4, // Automatically generate a UUID
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
});

// Establish association with User model
ForgotPasswordRequest.associate = (models) => {
    ForgotPasswordRequest.belongsTo(models.User, { foreignKey: 'userId' });
};

module.exports = ForgotPasswordRequest;
