module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isPremium: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        totalExpense: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
    });

    User.associate = (models) => {
        User.hasMany(models.Expense, { foreignKey: 'userId' });
    };

    return User;
};