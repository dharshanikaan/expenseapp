const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { models } = require('../util/database');

const registerUser = async ({ name, email, password }) => {
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) throw new Error('User already exists.');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await models.User.create({ name, email, password: hashedPassword });
    return user;
};

const authenticateUser = async ({ email, password }) => {
    const user = await models.User.findOne({ where: { email } });
    if (!user) throw new Error('User not found.');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password.');

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { token };
};

const getUserStatus = async (userId) => {
    const user = await models.User.findByPk(userId);
    if (!user) throw new Error('User not found.');
    return { isPremium: user.isPremium };
};

module.exports = { registerUser, authenticateUser, getUserStatus };
