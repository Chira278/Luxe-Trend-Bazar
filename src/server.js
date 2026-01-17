const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// ===== ENVIRONMENT VARIABLES =====
const NODE_ENV = process.env.NODE_ENV || 'development';

// Warn about missing environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingEnvVars.join(', '));
  console.warn('Server will start but some features may not work.');
}

// ===== EXPRESS APP =====
const app = express();

// ===== MIDDLEWARE =====
app.use(helmet()); // Security headers
app.use(cors()); // Cross-origin requests
app.use(compression()); // Gzip compression
app.use(express.json()); // JSON parser
app.use(express.urlencoded({ extended: true })); // URL-encoded parser
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev')); // Logging

// ===== STATIC FILES =====
app.use('/api/invoices', express.static(path.join(__dirname, 'invoices')));

// ===== HEALTH CHECK =====
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'LUXE API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// ===== API ROUTES =====
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/checkout', require('./routes/checkout'));

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    message,
    ...(NODE_ENV === 'development' && { error: err.stack })
  });
});

// ===== SERVER START =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
