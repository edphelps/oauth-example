require('dotenv').config();

const express = require('express');

const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

const cookieSession = require('cookie-session');

const app = express();
const port = process.env.PORT || 3030;

console.log("*** Starting a spin through server.js");

/* ***********************************
  Setup a cookie session that OAuth uses to pass its token back and forth
  that is uses to get back the user object it cached.
  What is the secret doing?
************************************ */
app.use(cookieSession({
  secret: process.env.COOKIE_SECRET
}));

/* ***********************************
  initialize passport middleware
************************************ */
app.use(passport.initialize());

/* ***********************************
  passport.use(strategy)

  Initialize passport to use GitHub strategy
************************************ */
passport.use(new GitHubStrategy(
  {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK,
    userAgent: process.env.DOMAIN
  },
  function onSuccess(token, refreshToken, profile, done) {
    console.log("*** onSuccess, token: ", token);
    console.log("*** onSuccess, profile.displayName: ", profile.displayName);
    // serialize token and profile
    done(null, { token, profile })
  }
));

/* ***********************************
  passport.session() call to return middleware

  This has to do with passport creating peristent login sessions
************************************ */
app.use(passport.session());

/* ***********************************
  passport.serializeUser

  Initialize passport with a function to serializeUser
  This is called when passport is saving an authenticated user.
************************************ */
passport.serializeUser((object, done) => {
  console.log("*** passport.serializeUser callback, object.profile.displayName: ", object.profile.displayName);
  done(null, { displayName: object.profile.displayName })
  // done(null, { token: object })
  // done(null, { token: object.token })
});

/* ***********************************
  passport.deserializeUser

  Initialize passport with a function to deserializeUser
  This is called when passport is retrieving an authenticated user.
************************************ */
passport.deserializeUser((object, done) => {
  console.log("*** passport.deserializeUser, object: ", object);
  done(null, object)
})

/* ***********************************
  GET /auth/github

  This does ??????

  http GET /auth/github
************************************ */
// app.get('/auth/github', passport.authenticate('github'))

/* ***********************************
  GET /auth/github/callback

  This is our callback from github after user login attempt.
  Redirects user to "/" or "/login".

  The GET handler is passport.authenticate()?

  But how does it work??

  http GET localhost:3000?user=Charlie
************************************ */
app.get('/auth/github/callback',
  passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
)

/* ***********************************
  GET

  Success landing page after github login attempt

  http GET localhost:3000
************************************ */
app.get('/', (req, res, next) => {
    // req.user is filled in by the passport middleware
    console.log("*** GET / req.user: ", req.user);
    res.status(200).send('HOME: req.user: '+ JSON.stringify(req.user) + "<br>login at http://127.0.0.1:3030/auth/github/callback");
})

/* ***********************************
  GET /login

  Failure landing page after github login

  http GET 3030host:3000
************************************ */
app.get('/login', (req, res, next) => {
  console.log("*** GET /login req.user: ", req.user);
  res.status(200).send('LOG IN: req.user: '+ JSON.stringify(req.user));
})

app.listen(port, () => console.log(`Listening on ${port}`))
