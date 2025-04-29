const express = require('express');
const app = express();
const { Pool } = require('pg'); // PostgreSQL client
const http = require('http');
const server = require('http').createServer(app);
const socketIo = require('socket.io');
const port = process.env.PORT || 3000;
app.use(express.static('public'));
const swaggerSetup = require('./Api/swagger');
const messageModel = require('./Api/Model/chat'); // Replace with your actual message model
const cors = require('cors');
const dotenv = require('dotenv'); // Load environment variables from .env file
dotenv.config(); // Ensure the environment variables are loaded

const { deleteUnusedImages } = require('./Api/Router/ImageHelper');
const chatRoutes = require('./Api/Router/chat_Router');
const authRouter = require('./Api/Router/auth_Router');
const verifyToken = require('./Api/Middleware/verifyToken');
const bodyParser = require('body-parser');
const usersRouter = require('./Api/Router/usersRouter');
const recipeRouter = require('./Api/Router/recipeRouter');
const detailRecipeRouter = require('./Api/Router/detail_recipeRouter');
const ingredientRecipeRouter = require('./Api/Router/ingredient_Router');
const stepRecipeRouter = require('./Api/Router/step_recipeRouter');
const reviewRecipeRouter = require('./Api/Router/review_recipeRouter');
const produitRouter = require('./Api/Router/produit_Router');
const favRouter = require('./Api/Router/fav_user_recipe_Router');
const recipeModelRouter = require('./Api/Repo/recipeModelRouter');
const categoryModelRouter = require('./Api/Router/category_Router');

// Initialize the users object to store socket connections
const users = {};

// PostgreSQL Connection Setup
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_LOCAL, // Use environment variable for your database connection string
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Only enable SSL in production
});


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

app.use('/users', usersRouter);
app.use('/api/chat', chatRoutes);
app.use('/auth', authRouter);
app.use(verifyToken); // Apply middleware to all routes
app.use('/recipes', recipeRouter);
app.use('/detailrecipes', detailRecipeRouter);
app.use('/ingredientrecipes', ingredientRecipeRouter);
app.use('/steprecipes', stepRecipeRouter);
app.use('/reviewrecipes', reviewRecipeRouter);
app.use('/produits', produitRouter);
app.use('/favorites', favRouter);
app.use('/api', recipeModelRouter);
app.use('/category', categoryModelRouter);

// Socket.io setup
const io = socketIo(server, {
  pingTimeout: 60000, // 60 seconds ping timeout
  pingInterval: 25000, // 25 seconds ping interval
});

io.on('connection', (socket) => {
  console.log(socket.id + ': user connected');
  
  // Handle user registration with user ID
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // Handle chat message event
  socket.on('chat message', (data) => {
    console.log('Received message:', data);

    // Save message to the PostgreSQL database
    messageModel.saveMessage(data, (err, savedMessage) => {
      if (err) {
        console.error('Error saving message', err);
      } else {
        console.log('Message saved:', savedMessage);

        // Emit message to the receiver if they are connected
        const receiverSocketId = users[data.receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('chat message', {
            recipeId: data.recipeId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message,
            timestamp: savedMessage.timestamp,
          });
        } else {
          console.log(`User ${data.receiverId} is not connected`);
        }
      }
    });
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Remove user from the users object
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log(`User ${userId} removed from users object`);
        break;
      }
    }
  });
});

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

// Connect to PostgreSQL and perform a test query
const connectToDb = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log('Connected to PostgreSQL:', result.rows[0]);
    client.release();
  } catch (err) {
    console.error('Error executing query', err.stack);
  }
};
connectToDb();

// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
