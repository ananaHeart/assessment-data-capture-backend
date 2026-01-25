const mysql = require('mysql2');
require('dotenv').config(); // This loads the variables from .env

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// We export the promise-based version of the pool
module.exports = pool.promise();