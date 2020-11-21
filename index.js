// Load dependencies
const express = require('express');
const session = require('cookie-session');
const fs = require('fs');
const path = require('path');
const favicon=require('serve-favicon');
const cookieParser = require('cookie-parser');

// Server port to listen on
const PORT = process.env.PORT || 5000;
app = express();
// ------------ init middlewares ------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({extended: true}));
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  unset: 'destroy',
  cookie: {
    sameSite: 'Lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: false,
  },
}));
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ------------ Load views ------------
app.get('/', (req, res) => {
  res.end('hello world');
});
app.get('/ejds', (req, res) => {
  res.render('pages/index.ejs');
});


// --------------- Start Server ----------------
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
