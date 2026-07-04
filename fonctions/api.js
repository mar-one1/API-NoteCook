const express = require('express');
const serverless = require('serverless-http');
const app = require('../index.js'); // Import your Express app

// Export the serverless handler
module.exports.handler = serverless(app);
