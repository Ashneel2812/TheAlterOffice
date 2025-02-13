const express = require('express');
const router = express.Router();
const passport = require('passport');

// Initiate Google OAuth authentication
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // After a successful login, redirect back to the React app
      res.redirect('https://alteroffice-frontend.vercel.app/?loggedIn=true');
      // res.redirect('http://localhost:3000');
    }
  );

// Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
