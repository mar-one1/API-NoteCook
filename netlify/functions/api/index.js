const serverlessHttp = require('serverless-http');

// Export Express app from repo root.
const app = require('../../../index');

// serverless-http wraps Express into a Netlify function handler.
const handler = serverlessHttp(app);

exports.handler = async (event, context) => {
  return handler(event, context);
};


