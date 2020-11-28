
/**
 * @module db
 */

/**
  * Manages the pictures table
  * All the functions in the class are promises (from async) so you
  * can call them with db.pictures.function(args).then(()=>{}).catch(()=>{}),
  * or you can await them in async functions. It does not use tempalte strings
  * for queries for security.
  * @class
  */
class Posts {
  /**
     * @constructor
     * @param {*} db - the database object
     * @param {*} pgp - probably unnescessary, check it out
     */
  constructor(db, pgp) {
    this.db = db;
    this.pgp = pgp;
  }

  /**
   * Adds a report to the reports table
   * @param {string} name - poster name
   * @param {string} content - the post
   * @param {array<string>} filenames - filenames
   * @param {array<string>} tags - hashtags
   * @param {int} replyto - post id replying to
   */
  async add(
      name,
      content,
      filenames,
      tags,
      replyto,
  ) {
    return this.db.any(
        'INSERT INTO posts(${this:name}) VALUES(${this:csv})',
        {
          name: name,
          content: content,
          filenames: filenames,
          tags: tags,
          views: 0,
          replyto: replyto,
          likes: 0,
        },
    );
  }

  /**
   * Returns all post records
   *
   * @param {string} order - Order by (name,date,views,likes,replies)
   */
  async all(order) {
    // eslint-disable-next-line max-len
    let sql = 'SELECT *, (SELECT count(id) FROM (SELECT * FROM posts where replyto=p.id) AS r) AS  replies FROM posts p';

    if (order) {
      sql += ' ORDER BY ';
      sql += this.pgp.as.name(order) +' DESC';
    } else {
      sql+=' ORDER BY date DESC';
    }
    return this.db.any(sql);
  }

  /**
   * Returns all posts that do not reply to some parent post
   *
   * @param {string} order - Order by (name,date,views,likes,replies)
   */
  async rootPosts(order) {
    // eslint-disable-next-line max-len
    let sql = 'SELECT *, (SELECT count(id) FROM (SELECT * FROM posts where replyto=p.id) AS r) AS  replies FROM posts p WHERE replyto IS NULL';

    if (order) {
      sql += ' ORDER BY ';
      sql += this.pgp.as.name(order) +' DESC';
    } else {
      sql+=' ORDER BY date DESC';
    }
    return this.db.any(sql);
  }

  /**
   * deletes posts
   * @param {int} id - post id
   */
  async deleteById(id) {
    return this.db.any('DELETE FROM posts WHERE id=${id};', {
      id: id,
    });
  }

  /**
   * returns all replies of a post
   * @param {int} id - post id
   */
  async getReplies(id) {
    // eslint-disable-next-line max-len
    return this.db.any('SELECT *, (SELECT count(id) FROM (SELECT * FROM posts where replyto=p.id) AS r) AS  replies FROM posts p WHERE replyto=${id};', {
      id: id,
    });
  }

  /**
   * Likes a post by incrementing the like column and returns the new likes
   * @param {int} id - post id to like
   */
  async like(id) {
    // eslint-disable-next-line max-len
    return this.db.one('UPDATE posts SET likes=likes+1 WHERE id=${id} RETURNING id,likes;', {
      id: id,
    });
  }
}


module.exports = Posts;
