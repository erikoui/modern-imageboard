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
/**
 * Returns a hello world json
 */
app.get('/test', (req, res) => {
  res.json({
    err: false,
    message: 'hello world',
  });
});

/**
 * Returns all posts. Defaults to ordered by date, unless
 * the order is explicitly set as a GET query.
 *
 * order=[name,date,views,likes,replies]
 *
 * @example GET /allposts?order=views
 *
 * @returns {
 *  [
 *    {
 *      "id":17,
 *      "name":"anonymous",
 *      "content":"posting 2 diles",
 *      "date":"2020-11-24T17:34:31.373Z",
 *      "views":0,
 *      "tags":[],
 *      "filenames":["./uploads/1606235445457.jpg"],
 *      "replyto":null,
 *      "likes":0,
 *      "replies":"0"
 *    },
 *    ...
 *  ]
 * }
 */
app.get('/allposts', (req, res) => {
  db.posts.all(req.query.order).then((data) => {
    res.json(data);
  }).catch((e)=>{
    res.status(500).json({
      message: e.message,
    });
  });
});

/**
 * Returns all posts whose replyto field is null.
 * This means these are all the posts that do not reply to anything.
 * Defaults to ordered by date, unless the order is explicitly set
 * as a GET query.
 *
 * @param {string} order = [name,date,views,likes,replies]
 *
 * @example GET /rootposts?order=likes
 *
 * @returns {
 *  [
 *    {
 *      "id":17,
 *      "name":"anonymous",
 *      "content":"posting 2 diles",
 *      "date":"2020-11-24T17:34:31.373Z",
 *      "views":0,
 *      "tags":[],
 *      "filenames":["./uploads/1606235445457.jpg"],
 *      "replyto":null,
 *      "likes":0,
 *      "replies":"0"
 *    },
 *    ...
 *  ]
 * }
 */
app.get('/rootposts', (req, res) =>{
  db.posts.rootPosts(req.query.order).then((data)=>{
    res.json(data);
  }).catch((e)=>{
    res.status(500).json({
      message: e.message,
    });
  });
});

/**
 * Returns the replies to a post specified by id
 *
 * @param {int} postid - The post id
 *
 * @example GET /replies?postid=334
 *
 * @returns {
 *  [
  *    {
  *      "id":17,
  *      "name":"anonymous",
  *      "content":"posting 2 diles",
  *      "date":"2020-11-24T17:34:31.373Z",
  *      "views":0,
  *      "tags":[],
  *      "filenames":["./uploads/1606235445457.jpg"],
  *      "replyto":11,
  *      "likes":0,
  *      "replies":"0"
  *    },
  *    ...
  *  ]
  * }
 */
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

/**
 * Adds a new post to the database, and saves the files to the server
 *
 * @param {array<file>} files - array of files from formdata
 * @param {string} content - Text of the post content
 * @param {string} name - OP name
 * @param {int} replyto - post number replying to (null if not replying)
 *
 * @example POST /newpost {
 *     files:[file1,file2],
 *     content: 'hello world',
 *     name:'Anonymous',
 *     replyto: null
 * }
 *
 * @returns {
 *    message: 'post successful'
 * }
 */
app.post('/newpost', async (req, res, next) => {
  // TODO: check file extensions
  const filepaths = [];
  const allFileUploadPromises=[];
  const tags=strfncs.getHashTags(req.body.content);
  try {
    if (req.files) {
      if (req.files.images.length>4) {
        throw new Error('More than 4 files selected');
      }
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
        const allowedMimes=[
          'image/jpeg',
          'image/apng',
          'image/bmp',
          'image/gif',
          'image/png',
          'video/webm',
          'image/webp',
        ];
          // If this file has mime type not in the list
        if (allowedMimes.indexOf(img.mimetype)==-1) {
          throw new Error('Bad file mime type: '+img.mimetype);
        }
      }
      for (let i=0; i<files.length; i++) {
        const img = files[i];
        // move img to uploads directory, store the callback into a promise
        img.mv('./uploads/' + img.name, function(err) {
          const fileUploadPromise = new Promise(function(resolve, reject) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
          allFileUploadPromises.push(fileUploadPromise);
        });

        // push file details
        filepaths.push('./uploads/' + img.name);
      }
      // when all the files have been uploaded update db and return ok
      Promise.all(allFileUploadPromises).then(()=>{
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
          throw e;
        });
      }).catch((e)=>{
        throw e;
      });
    } else {// no file to upload
      db.posts.add(
          req.body.name,
          req.body.content,
          [],
          tags,
          req.body.replyto,
      ).then(()=>{
        res.json({
          message: 'Post successful',
        });
      }).catch((e)=>{
        throw e;
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/**
 * Adds a like to a post, and returns the new number of likes.
 *
 * @param {int} postid - post id
 *
 * @example PUT /like?postid=54
 *
 * @returns {
 *    id: 54
 *    likes: 199
 * }
 */
app.put('/like', (req, res)=>{
  // TODO: limit to one like per cookie session
  db.posts.like(req.query.postid).then((data)=>{
    res.json(data);
  }).catch((e)=>{
    res.status(500).json({
      message: e.message,
    });
  });
});


// --------------- Start Server ----------------
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
