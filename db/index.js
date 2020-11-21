const promise = require('bluebird'); // best promise library today
const pgPromise = require('pg-promise'); // pg-promise core library
const {Posts} = require('./repo');

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  ssl: {
    rejectUnauthorized: false,
  },
};

const initOptions = {
  promiseLib: promise,
  extend(obj, dc) {
    obj.posts = new Posts(obj, pgp);
  },
};

const pgp = pgPromise(initOptions);
const db = pgp(dbConfig);

module.exports = {db, pgp};
