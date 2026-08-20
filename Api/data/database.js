const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = isProduction
  ? process.env.DATABASE_URL
  : process.env.POSTGRES_URL_LOCAL;

if (!connectionString) {
  throw new Error(
    isProduction
      ? 'DATABASE_URL is not defined'
      : 'POSTGRES_URL_LOCAL is not defined'
  );
}

const pool = new Pool({
  connectionString,
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,
});

const connectToDb = async () => {
  try {
    const client = await pool.connect();

    const result = await client.query('SELECT NOW()');

    console.log('Connected to PostgreSQL:', result.rows[0]);

    client.release();
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err.stack);
  }
};

connectToDb();

module.exports = pool;