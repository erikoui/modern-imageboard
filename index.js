// Load dependencies
const express = require('express');
const {db}=require('./db');

// Server port to listen on
const PORT = process.env.PORT || 5000;
app = express();
// ------------ init middlewares ------------
// Request logger
app.use(require('morgan')('combined'));
app.use(require('body-parser').json({type: 'application/json'}));

// ------------ API--------------
app.get('/test', (req, res) => {
  res.json({
    err: false,
    message: 'hello world',
  });
});

// --------------- Start Server ----------------
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
