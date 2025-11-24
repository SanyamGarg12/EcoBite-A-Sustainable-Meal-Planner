const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecobite',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // Force DATE and DATETIME fields to be returned as strings instead of Date objects
});

module.exports = pool;

