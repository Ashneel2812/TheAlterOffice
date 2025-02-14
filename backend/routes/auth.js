const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Initiate Google OAuth authentication with session disabled
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

// Google OAuth callback with session disabled
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate a JWT token for the authenticated user
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    // Redirect back to your frontend with the token as a query parameter
    res.redirect(`https://alteroffice-frontend.vercel.app/?token=${token}`);
  }
);

// Logout route (for JWT, logout is handled client-side)
router.get('/logout', (req, res) => {
  res.redirect('/');
});

module.exports = router;
