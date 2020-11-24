// Load dependencies (npm)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');

// Local modules
const {db} = require('./db');
const StringFunctions = require('./helpers/strfncs');
const strfncs=new StringFunctions();

// Server port to listen on
const PORT = process.env.PORT || 5000;

// Cross origin policy options
const corsOptions = {
  origin: '*', // TODO: CHANGE THIS AFTER TESTING
  optionsSuccessStatus: 200,
};

app = express();
// ------------ init middlewares ------------
// Cross origin policy
app.use(cors(corsOptions));
// Accepting json bodies (🔥hot🔥)
app.use(bodyParser.json({type: 'application/json'}));
// Also accepting file upload forms
app.use(bodyParser.urlencoded({extended: true}));
// file upload settings
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2MB max file(s) size
  },
}));
// Request logger
app.use(morgan('combined'));

// ------------ API--------------
app.get('/test', (req, res) => {
  res.json({
    err: false,
    message: 'hello world',
  });
});

// Returns all the posts
// Defaults to ordered by date, unless the order is
// explicitly set as a GET query
app.get('/allposts', (req, res) => {
  db.posts.all(req.query.order).then((data) => {
    res.json(data);
  }).catch((e)=>{
    res.status(500).json({
      message: e.message,
    });
  });
});

// Returns all posts whose replyto field is null.
// This means these are all the posts that do not reply to anything
app.get('/rootposts', (req, res) =>{
  db.posts.rootPosts().then((data)=>{
    res.json(data);
  }).catch((e)=>{
    res.status(500).json({
      message: e.message,
    });
  });
});

// Returns the replies to a post specified by id
app.get('/replies', (req, res) => {
  const postId = req.query.postid;
  if (postId) {
    db.posts.getReplies(postId).then((data) => {
      res.json({
        err: false,
        ...data,
      });
    }).catch((e) => {
      res.status(500).json({
        message: e.message,
      });
    });
  } else {
    res.status(500).json({
      message: 'No post id specified (try: /replies?postid=2)',
    });
  }
});

// TODO: check file extensions
app.post('/newpost', async (req, res) => {
  try {
    if (!req.files.images) {
      res.status(500).json({
        message: 'No file uploaded (make sure files[] is populated)',
      });
    } else if (req.files.images.length>4) {
      res.status(500).json({
        message: 'More than 4 files selected',
      });
    } else {
      const filepaths = [];
      const promises=[];
      // Apparently uploading one file turns the files[] array into a
      // single object instead of an array with 1 object so we fix that
      let files;
      if (req.files.images.length>1) {
        files=req.files.images;
      } else {
        files=[req.files.images];
      }
      // loop all files
      for (let i=0; i<files.length; i++) {
        const img = files[i];
        console.log(img);
        // move img to uploads directory, store the callback into a promise
        img.mv('./uploads/' + img.name, function(err) {
          const promise = new Promise(function(resolve, reject) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
          promises.push(promise);
        });

        // push file details
        filepaths.push('./uploads/' + img.name);
      }
      // when all the files have been uploaded update db and return ok
      Promise.all(promises).then(()=>{
        tags=strfncs.getHashTags(req.body.content);
        db.posts.add(
            req.body.name,
            req.body.content,
            filepaths,
            tags,
            req.body.replyto,
        ).then(()=>{
          res.json({
            message: 'Post successful',
          });
        }).catch((e)=>{
          res.status(500).json({
            message: e.message,
          });
        });
      }).catch((e)=>{
        res.status(500).json({
          message: e.message,
        });
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});


// --------------- Start Server ----------------
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
