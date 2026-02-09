const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const config = require('./config/config');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Management Access API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      roles: '/api/roles'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`Server running on port: ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`http://localhost:${PORT}`);
  console.log('=================================');
});

module.exports = app;
