const { Pool } = require('pg');
const config = require('../config');

// PostgreSQL Connection Setup
const pool = new Pool({
    connectionString: config.POSTGRES_URL_LOCAL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the connection
pool.connect()
    .then(() => console.log('Connected to PostgreSQL successfully!'))
    .catch(err => {
        console.error('Failed to connect to PostgreSQL:', err);
        throw err;
    });

module.exports = pool;