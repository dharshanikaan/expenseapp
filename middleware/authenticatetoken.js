const jwt = require('jsonwebtoken');
require('dotenv').config();  // Ensure this loads the .env file correctly

const authenticateToken = (req, res, next) => {
    // Extract token from the Authorization header
    const token = req.headers['authorization']?.split(' ')[1];  // Bearer <token>
    if (!token) return res.sendStatus(401); // No token provided

    // Verify the token using JWT_SECRET
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token is invalid
        req.userId = user.userId; // Attach userId to the request
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateToken;
