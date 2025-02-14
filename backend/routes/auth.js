const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Use an environment variable for your JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Initiate Google OAuth authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate a JWT token for the authenticated user
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, name: req.user.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    // Redirect back to your frontend with the token as a query parameter
    res.redirect(`https://alteroffice-frontend.vercel.app/?token=${token}`);
  }
);

// Logout route (optional with JWT; you may simply remove token client-side)
router.get('/logout', (req, res) => {
  // With JWT, logging out is usually handled client-side by discarding the token.
  res.redirect('/');
});

module.exports = router;
