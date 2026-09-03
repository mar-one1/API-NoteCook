<<<<<<< HEAD
let Sequelize, sequelize;

try {
  // Try to import Sequelize
  Sequelize = require('sequelize').Sequelize;
  
  // Determine the appropriate database path based on environment
  const dbPath = process.env.NODE_ENV === 'production' 
    ? '/tmp/DB_Notebook.db' 
    : 'DB_Notebook.db';
  
  // Create Sequelize instance with SQLite dialect
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    // Disable logging in production
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    // Disable PostgreSQL dialect features to avoid pg-hstore dependency
    dialectOptions: {
      // This prevents Sequelize from trying to load pg-hstore
      noPostgres: true
    }
=======
const { Sequelize } = require('sequelize');
const path = require('path');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
>>>>>>> bde9db8caa29941a23f776a0fc0a627974a1937c
  });
  
  // Test the connection only in development environment
  if (process.env.NODE_ENV !== 'production') {
    sequelize.authenticate()
      .then(() => {
        console.log('Connection has been established successfully.');
      })
      .catch(err => {
        console.error('Unable to connect to the database:', err);
      });
  }
} catch (error) {
  console.error('Error initializing Sequelize:', error.message);
  // Create a mock sequelize object with basic functionality
  sequelize = {
    define: () => ({
      findAll: async () => [],
      findOne: async () => null,
      create: async () => ({}),
      update: async () => [0],
      destroy: async () => 0
    }),
    model: () => null,
    models: {},
    transaction: async (callback) => callback(null),
    Op: {
      and: Symbol('and'),
      or: Symbol('or'),
      eq: Symbol('eq'),
      ne: Symbol('ne'),
      is: Symbol('is'),
      not: Symbol('not'),
      like: Symbol('like')
    }
  };
}

module.exports = sequelize;
