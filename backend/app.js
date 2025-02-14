require('dotenv').config();
const express = require('express');
const passport = require('./config/passport'); // We'll still use Passport for OAuth strategy
const connectDB = require('./config/db');
const redisClient = require('./config/redis'); // if you use it elsewhere
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');

const app = express();

// Swagger documentation setup
const file = fs.readFileSync(path.join(__dirname, './docs/swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(file);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: 'https://alteroffice-frontend.vercel.app',  // Replace with your actual frontend URL
  credentials: true,
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport (only for OAuth, no session management)
app.use(passport.initialize());

// API Routes (we'll update these to use JWT-based auth)
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/urlRoutes'));

// Redirection route for shortened URLs
app.get('/:alias', (req, res, next) => {
  const urlController = require('./controllers/urlController');
  return urlController.redirectUrl(req, res, next);
});

// Serve static files (if applicable)
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Only start the server if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
