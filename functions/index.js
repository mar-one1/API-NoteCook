const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Root route - simple HTML response (for both paths)
app.get('/', rootHandler);
app.get('/.netlify/functions/index', rootHandler);

function rootHandler(req, res) {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .endpoint { background: #f4f4f4; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
        code { background: #eee; padding: 2px 5px; border-radius: 3px; }
        .info { background: #e8f5ff; padding: 10px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #0066cc; }
        .public { background: #e8f5e9; padding: 10px; margin-bottom: 10px; border-radius: 5px; border-left: 4px solid #4caf50; }
      </style>
    </head>
    <body>
      <h1>API Server is Running</h1>
      <p>Your API is running successfully in serverless mode.</p>
      
      <h3>Available Endpoints</h3>
      <div class="public">
        <p><code>GET /recipes</code> - Get all recipes</p>
        <p><code>GET /status</code> - Get server status</p>
      </div>
      
      <div class="info">
        <h3>Server Information</h3>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
        <p><strong>Netlify:</strong> ${process.env.NETLIFY === 'true' ? 'Yes' : 'No'}</p>
        <p><strong>Server Time:</strong> ${new Date().toISOString()}</p>
      </div>
    </body>
    </html>
  `);
});

// Status endpoint with Netlify Functions path
app.get('/.netlify/functions/index/status', (req, res) => {
  res.json({
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    netlify: process.env.NETLIFY === 'true',
    timestamp: new Date().toISOString()
  });
});

// Also add a path without the prefix for local development
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    netlify: process.env.NETLIFY === 'true',
    timestamp: new Date().toISOString()
  });
});

// Sample recipes endpoint - note the path structure for Netlify Functions
app.get('/.netlify/functions/index/recipes', (req, res) => {
  res.json([
    { id: 1, name: 'Sample Recipe 1', description: 'A sample recipe for testing' },
    { id: 2, name: 'Sample Recipe 2', description: 'Another test recipe' }
  ]);
});

// Also add a path without the prefix for local development
app.get('/recipes', (req, res) => {
  res.json([
    { id: 1, name: 'Sample Recipe 1', description: 'A sample recipe for testing' },
    { id: 2, name: 'Sample Recipe 2', description: 'Another test recipe' }
  ]);
});

// Export the serverless handler
module.exports.handler = serverless(app);
