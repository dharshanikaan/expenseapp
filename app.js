// Load environment variables
require('dotenv').config({ path: '../expenseapppassword/.env' });

// Import required modules
const express = require('express');
const { sequelize } = require('./util/database');  // Assuming your Sequelize instance is exported here
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Import routes
const userRoutes = require('./routes/userroutes');
const expenseRoutes = require('./routes/expenseroutes');
const purchaseRoutes = require('./routes/purchaseroutes');
const premiumFeaturesRoutes = require('./routes/premiumfeaturesroutes');
const passwordRoutes = require('./routes/password');

// Initialize the Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views')));
app.use(helmet());
app.use(compression());

// Logging
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flag: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// Serve HTML files
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/expenses', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'expenses.html'));
});
app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'premiumfeatures.html'));
});

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/premium/purchase', purchaseRoutes);
app.use('/api/premium/features', premiumFeaturesRoutes);
app.use('/password', passwordRoutes);

// Check if the DB connection is successful before starting the server
sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');

        // Now sync the database and start the server
        sequelize.sync()
            .then(() => {
                app.listen(3000, () => {
                    console.log('Server running on http://localhost:3000');
                });
            })
            .catch(err => {
                console.error('Unable to sync the database:', err);
            });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
