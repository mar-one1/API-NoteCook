const { Pool } = require('pg');

const isDevelopment = process.env.NODE_ENV !== 'production';
// PostgreSQL Connection Setup
const pool = new Pool({
  connectionString : isDevelopment ? process.env.POSTGRES_URL_LOCAL: process.env.DATABASE_URL, // Use environment variable for your database connection string
  ssl: !isDevelopment ? { rejectUnauthorized: false } : false, // Only enable SSL in production
});

// Connect to PostgreSQL and perform a test query
const connectToDb = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log('Connected to PostgreSQL:', result.rows[0]);
    client.release();
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err.stack);
  }
};
connectToDb();
module.exports = pool;