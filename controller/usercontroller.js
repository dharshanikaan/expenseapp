const userService = require('../services/userservices');
const { validationResult } = require('express-validator');

const signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
        const user = await userService.registerUser({ name, email, password });
        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { token } = await userService.authenticateUser({ email, password });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserStatus = async (req, res) => {
    const userId = req.userId;
    try {
        const status = await userService.getUserStatus(userId);
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { signup, login, getUserStatus };
