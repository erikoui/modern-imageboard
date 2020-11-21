
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
   * @param {string} rtype - report type (from declutter.reportTypes)
   * @param {string} details - details if entered
   * @param {int} picid - picture id
   * @param {int} reportedbyid - user id
   * @param {string} reportedbyuname - user name
   * @param {string} suggestedfix - suggestion if entered
   */
  async add(
      rtype,
      details,
      picid,
      reportedbyid,
      reportedbyuname,
      suggestedfix,
  ) {
    return this.db.any(
        'INSERT INTO reports(${this:name}) VALUES(${this:csv})',
        {
          rtype: rtype,
          details: details,
          picid: picid,
          reportedbyid: reportedbyid,
          reportedbyuname: reportedbyuname,
          suggestedfix: suggestedfix,
        },
    );
  }

  /**
   * Returns all report records
   */
  async all() {
    return this.db.any('SELECT * FROM reports');
  }

  /**
   * deletes reports
   * @param {int} picid - picture id
   */
  async deleteByPicId(picid) {
    return this.db.any('DELETE FROM reports WHERE picid=${id};', {
      id: picid,
    });
  }

  /**
   * returns all reports of a picture
   * @param {int} picid - picture id
   */
  async getByPicId(picid) {
    return this.db.any('SELECT * FROM reports WHERE picid=${id};', {
      id: picid,
    });
  }
}


module.exports = Posts;
