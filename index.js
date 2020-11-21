// Load dependencies
const express = require('express');
const {db} = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const _ = require('lodash');

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

        // move photo to uploads directory
        img.mv('./uploads/' + img.name);

        // push file details
        data.push({
          name: photo.name,
          mimetype: photo.mimetype,
          size: photo.size,
        });
      });

      // return response
      res.json({
        err: false,
        message: 'Files are uploaded',
        data: data,
      });
    }
  } catch (err) {
    res.end(err.message);
  }
});


// --------------- Start Server ----------------
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
