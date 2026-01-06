const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socketIo = require('socket.io');
const port = process.env.PORT || 3000;
app.use(express.static('public'));
const swaggerSetup = require('./Api/swagger');
const cors = require('cors');
const dotenv = require('dotenv'); // Load environment variables from .env file
dotenv.config(); // Ensure the environment variables are loaded
const { users } = require('./Api/handlers/socketHandler');
const { setupSocketHandlers } = require('./Api/handlers/socketHandler');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const allowedOrigins = [
    'http://localhost:3000' 
  ];
// TRUST PROXY (IMPORTANT)
app.set('trust proxy', 1);
// Rate limiting BEFORE any routes
app.use(helmet());
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }
});
app.use(limiter);


app.get('/test-ip', (req, res) => {
  res.json({
    ip: req.ip,
    forwarded: req.headers['x-forwarded-for']
  });
});
// Secure CORS
app.use(cors({
  origin: function (origin, callback) {
    console.log(origin);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token'],
  credentials: true
}));
// Setup socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Make io instance available to routes
app.set('io', io);

// Setup socket handlers
setupSocketHandlers(io);


const { deleteUnusedImages } = require('./Api/Router/ImageHelper');
const chatRoutes = require('./Api/Router/chat_Router');
const authRouter = require('./Api/Router/auth_Router');
const verifyToken = require('./Api/Middleware/verifyToken');
const usersRouter = require('./Api/Router/usersRouter');
const recipeRouter = require('./Api/Router/recipeRouter');
const detailRecipeRouter = require('./Api/Router/detail_recipeRouter');
const ingredientRecipeRouter = require('./Api/Router/ingredient_Router');
const ingredientsRecipeRouter = require('./Api/Router/IngredientRecipe_Router');
const stepRecipeRouter = require('./Api/Router/step_recipeRouter');
const reviewRecipeRouter = require('./Api/Router/review_recipeRouter');
const produitRouter = require('./Api/Router/produit_Router');
const favRouter = require('./Api/Router/fav_user_recipe_Router');
const categoryRouter = require('./Api/Router/category_Router');

app.delete('/cleanup-images', async (req, res) => {
  try {
    const result = await deleteUnusedImages();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware for parsing JSON request bodies
// Parse JSON bodies (secure)
app.use(express.json({
  limit: '10kb'
}));

// Parse URL-encoded bodies (secure)
app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}));

// Initialize Swagger documentation
swaggerSetup(app);

app.use('/auth', authRouter);
app.use(verifyToken); // Apply middleware to all routes
app.use('/users', usersRouter);
app.use('/api/chat', chatRoutes);
app.use('/recipes', recipeRouter);
app.use('/detailrecipes', detailRecipeRouter);
app.use('/ingredientrecipes', ingredientRecipeRouter);
app.use('/ingredientsrecipes', ingredientsRecipeRouter);
app.use('/steprecipes', stepRecipeRouter);
app.use('/reviewrecipes', reviewRecipeRouter);
app.use('/produits', produitRouter);
app.use('/favorites', favRouter);
app.use('/categories', categoryRouter);

// Route check user connection
app.get('/isUserConnected/:userId', (req, res) => {
  const userId = req.params.userId;
  res.json({ connected: !!users[userId] });
});

// Example of a protected route
app.get('/protected', verifyToken, (req, res) => {
  if (req.tokenRefreshed) {
    res.status(201).json({ message: 'This route is protected and token was refreshed', user: req.user, token: req.newAccessToken });
  } else {
    res.status(200).json({ message: 'This route is protected', user: req.user, token: req.newAccessToken });
  }
});

// Start the server if not in serverless environment
server.listen(port, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Server is running at http://localhost:${port}/`);
  } else {
    console.log(`🚀 Server running in production`);
  }
});
// Export the Express app for serverless function
module.exports = app;
