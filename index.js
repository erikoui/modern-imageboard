// Load dependencies
const express = require('express');
const {db}=require('./db');

// Server port to listen on
const PORT = process.env.PORT || 5000;
app = express();
// ------------ init middlewares ------------
// Request logger
app.use(require('morgan')('combined'));
// Accepting json bodies (🔥hot🔥)
app.use(require('body-parser').json({type: 'application/json'}));

// ------------ API--------------
app.get('/test', (req, res) => {
  res.json({
    err: false,
    message: 'hello world',
  });
});
app.get('/allposts', (req, res)=>{
  db.posts.all().then((data)=>{
    res.json(data);
  });
});
app.get('/replies', (req, res)=>{
  const postId=req.query.postid;
  if (postId) {
    db.posts.getReplies(postId).then((data)=>{
      res.json({
        err: false,
        ...data,
      });
    }).catch((e)=>{
      res.json({
        err: true,
        message: e.message,
        trace: e,
      });
    });
  } else {
    res.json({
      err: true,
      message: 'No post id specified',
    });
  }
});
app.post('/newpost', (req, res)=>{
  res.end('asd');
});


// --------------- Start Server ----------------
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
