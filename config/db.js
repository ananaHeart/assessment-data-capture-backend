const mysql = require('mysql2');
require('dotenv').config();

// --- NEW LOGIC TO HANDLE SSL ---
const sslConfig = process.env.DB_SSL_REQUIRED === 'true' 
  ? { ssl: { rejectUnauthorized: false } } 
  : {};
// ---------------------------------

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT, // <-- Make sure this is here
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...sslConfig // <-- Add the SSL config here
});

module.exports = pool.promise();