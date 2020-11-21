
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
        },
    );
  }

  /**
   * Returns all post records
   */
  async all() {
    return this.db.any('SELECT * FROM posts');
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
    return this.db.any('SELECT * FROM posts WHERE replyto=${id};', {
      id: id,
    });
  }
}


module.exports = Posts;
