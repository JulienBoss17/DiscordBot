// routes/auth.js
const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const router = express.Router();

passport.serializeUser((user, done) => {
  user.avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  done(null, user);
});

passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.REDIRECT_URI,
  scope: ['identify']
}, (accessToken, refreshToken, profile, done) => {
  process.nextTick(() => done(null, profile));
}));

router.get('/discord', passport.authenticate('discord'));
router.get('/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => res.redirect('/dashboard')
);

router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

module.exports = router;
