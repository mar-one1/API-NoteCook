const express = require('express');
const app = express();
const { Pool } = require('pg'); // PostgreSQL client
const server = require('http').createServer(app);
const socketIo = require('socket.io');
const port = process.env.PORT || 3001;
app.use(express.static('public'));
const swaggerSetup = require('./Api/swagger');
const cors = require('cors');
const dotenv = require('dotenv'); // Load environment variables from .env file
dotenv.config(); // Ensure the environment variables are loaded
const { users } = require('./Api/handlers/socketHandler');

const { deleteUnusedImages } = require('./Api/Router/ImageHelper');
const chatRoutes = require('./Api/Router/chat_Router');
const authRouter = require('./Api/Router/auth_Router');
const verifyToken = require('./Api/Middleware/verifyToken');
const bodyParser = require('body-parser');
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

// Import socket handler setup
const { setupSocketHandlers } = require('./Api/handlers/socketHandler');


app.delete('/cleanup-images', async (req, res) => {
  try {
    const result = await deleteUnusedImages();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware for parsing JSON request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize Swagger documentation
swaggerSetup(app);


app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use(verifyToken); // Apply middleware to all routes
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

// Socket.io setup with CORS configuration
const io = socketIo(server, {
  pingTimeout: 60000, // 60 seconds ping timeout
  pingInterval: 25000, // 25 seconds ping interval
  cors: {
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'token']
  }
});

// Make io instance available to routes
app.set('io', io);

// Setup socket handlers
setupSocketHandlers(io);

// Register route to check if a user is connected
app.get('/isUserConnected/:userId', (req, res) => {
  const userId = req.params.userId;
  if (users[userId]) {
    res.json({ connected: true });
  } else {
    res.json({ connected: false });
  }
});

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'token']
}));

// Example of a protected route
app.get('/protected', verifyToken, (req, res) => {
  if (req.tokenRefreshed) {
    res.status(201).json({ message: 'This route is protected and token was refreshed', user: req.user, token: req.newAccessToken });
  } else {
    res.status(200).json({ message: 'This route is protected', user: req.user, token: req.newAccessToken });
  }
});

// Start the server if not in serverless environment
if (process.env.NODE_ENV !== 'production') {
  server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
  });
}

// Export the Express app for serverless function
module.exports = app;
