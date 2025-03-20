const { Pool } = require('pg')
require('dotenv').config();
 
// PostgreSQL Connection Setup
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_LOCAL, // Use environment variable for your database connection string
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Only enable SSL in production
});

pool.connect((err) => {
    if (err) throw err
    console.log("Connect to PostgreSQL successfully!")
})

module.exports = pool