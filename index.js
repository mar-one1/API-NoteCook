const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const server = require('http').createServer(app);
const socketIo = require('socket.io');
const db = new sqlite3.Database('DB_Notebook.db'); //database file name
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
// Import the verifyToken middleware
const verifyToken = require('./Api/Middleware/verifyToken'); // Adjust the path as needed
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

app.delete('/cleanup-images', async (req, res) => {
  try {
    const result = await deleteUnusedImages();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ...
// Middleware for parsing JSON request bodies
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Initialize Swagger documentation
swaggerSetup(app);


app.use('/users', usersRouter);
app.use('/api/chat', chatRoutes);
app.use('/auth', authRouter);
// Apply the middleware to all routes
app.use(verifyToken);
app.use('/recipes', recipeRouter);
app.use('/detailrecipes', detailRecipeRouter);
app.use('/ingredientrecipes', ingredientRecipeRouter);
app.use('/steprecipes', stepRecipeRouter);
app.use('/reviewrecipes', reviewRecipeRouter);
app.use('/produits', produitRouter);
app.use('/favorites', favRouter);
app.use('/api', recipeModelRouter);
app.use('/category', categoryModelRouter);

/*const io = require('socket.io')(server, {
  cors: {
      origin: "*",  // Allow all origins or set specific origins
      methods: ["GET", "POST"]
  }
});*/
const io = require('socket.io')(server, {
  pingTimeout: 60000, // 60 seconds ping timeout
  pingInterval: 25000, // 25 seconds ping interval
});

io.on('connection', () => { /* … */ });
server.listen(3000);
// Serve Swagger UI
// Store user socket connections
const users = {};
io.use((socket, next) => {
  console.log('Socket handshake:', socket.handshake);
  next();
});


io.on('connection', (socket) => {
  console.log(socket.id+': user connected');

  // Handle user registration with user ID
  socket.on('register', (userId) => {
      users[userId] = socket.id;
      console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // Handle chat message event
  socket.on('chat message', (data) => {
    console.log('Received message:', data);

    // Save message to the database
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
                    timestamp: savedMessage.timestamp
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

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON'); // Enable foreign key support (optional)

  db.get("SELECT 1", (err, result) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
    } else {
      console.log('Connected to the database.');

      // You can perform your database operations here
    }
  });
});
// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'token']
}));  


// Connect to your MongoDB database
//mongoose.connect('mongodb://127.0.0.1:27017/db_note', { useNewUrlParser: true, useUnifiedTopology: true });

// Example: Protect a route using the verifyToken middleware
app.get('/protected', verifyToken, (req, res) => {
  // Check if token was refreshed
  if (req.tokenRefreshed) {
    // If token was refreshed, respond with the new token
    res.status(201).json({ message: 'This route is protected token was refreshed', user: req.user, token: req.newAccessToken });
  } else {
    // If token was valid, proceed with the endpoint logic
    // Your endpoint logic here...
    res.status(200).json({ message: 'This route is protected', user: req.user, token: req.newAccessToken });
  }

});


// Serving static files from the 'public' directory



// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello Worl d');
// });


// Start the server and listen on the specified port
/*app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
})*/



