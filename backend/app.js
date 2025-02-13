require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/db');
const redisClient = require('./config/redis'); // Ensure you require it here
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');


const app = express();

const file = fs.readFileSync(path.join(__dirname, './docs/swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(file);

// Serve Swagger docs at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connect to MongoDB
connectDB();

// Attach the Redis client to app.locals so it can be accessed via req.app.locals
app.locals.redisClient = redisClient;

app.use(cors({
  origin: 'https://alteroffice-frontend.vercel.app',
  credentials: true,
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/urlRoutes'));

// Handle redirection for shortened URLs (make sure this comes before any catch-all)
app.get('/:alias', (req, res, next) => {
  const urlController = require('./controllers/urlController');
  return urlController.redirectUrl(req, res, next);
});

// Serve static files from the frontend build folder
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
