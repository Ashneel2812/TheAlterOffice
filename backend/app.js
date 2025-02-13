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
const {RedisStore} = require("connect-redis")

const app = express();

const file = fs.readFileSync(path.join(__dirname, './docs/swagger.yaml'), 'utf8');
const swaggerDocument = YAML.parse(file);

// Serve Swagger docs at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connect to MongoDB
connectDB();

// Attach the Redis client to app.locals so it can be accessed via req.app.locals
app.locals.redisClient = redisClient;

const corsOptions = {
  origin: 'https://alteroffice-frontend.vercel.app',
  // origin: ' http://localhost:3000',
  credentials: true,  // Allow cookies to be sent with cross-origin requests
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));


// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set to true if served over HTTPS
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax',
    maxAge: 1000 * 60 * 60 * 24,  // 1 day
    // Use only the domain name without protocol or trailing slash:
    domain: process.env.NODE_ENV === 'production' ? 'alteroffice-frontend.vercel.app' : undefined,
  },
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



// if (require.main === module) {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// }

module.exports = app;
