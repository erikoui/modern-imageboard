// Load dependencies
const express = require('express');
const {db} = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const _ = require('lodash');

/**
 * asdasd
 * @param {ashdjhask} inputText asdhklasd
 * @return {asd} benis
 */
function getHashTags(inputText) {
  const regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
  const matches = [];
  let match;

  while ((match = regex.exec(inputText))) {
    matches.push(match[1]);
  }

  return matches;
}


// Server port to listen on
const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: '*', // TODO: CHANGE THIS AFTER TESTING
  optionsSuccessStatus: 200,
};

app = express();
// ------------ init middlewares ------------
app.use(cors(corsOptions));
// Accepting json bodies (🔥hot🔥)
app.use(bodyParser.json({type: 'application/json'}));
// Also accepting file uploads
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2MB max file(s) size
  },
}));
// Request logger
app.use(require('morgan')('combined'));

// ------------ API--------------
app.get('/test', (req, res) => {
  res.json({
    err: false,
    message: 'hello world',
  });
});
app.get('/allposts', (req, res) => {
  db.posts.all().then((data) => {
    res.json(data);
  });
});
app.get('/replies', (req, res) => {
  const postId = req.query.postid;
  if (postId) {
    db.posts.getReplies(postId).then((data) => {
      res.json({
        err: false,
        ...data,
      });
    }).catch((e) => {
      res.status(500).send(e);
    });
  } else {
    res.status(500).send(new Error('No post id specified'));
  }
});
app.post('/newpost', async (req, res) => {
  try {
    if (!req.files) {
      res.json({
        err: true,
        message: 'No file uploaded',
      });
    } else {
      const data = [];

      // loop all files
      _.forEach(_.keysIn(req.files.images), (key) => {
        const img = req.files.images[key];

        // move img to uploads directory
        img.mv('./uploads/' + img.name);

        // push file details
        data.push(img.name);
      });

      tags=getHashTags(req.body.content);
      db.posts.add(
          req.body.name,
          req.body.content,
          data,
          tags,
          req.body.replyto,
      ).then(()=>{
        res.json({
          err: false,
          message: 'Post successful',
        });
      }).catch((e)=>{
        res.json({
          err: true,
          message: 'Database error: '+e.message,
        });
      });
    }
  } catch (err) {
    res.end(err.message);
  }
});


// --------------- Start Server ----------------
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
