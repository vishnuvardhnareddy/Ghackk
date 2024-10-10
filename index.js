require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
});
app.use(limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Import routes
const webtoonRoutes = require('./routes/webtoonRoutes');
const authRoutes = require('./routes/authRoutes');

// Use routes
app.use('/api', authRoutes);
app.use('/api/webtoons', webtoonRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
