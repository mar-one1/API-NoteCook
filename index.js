const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socketIo = require('socket.io');
<<<<<<< HEAD

// Determine if we're in production environment
const isProduction = process.env.NODE_ENV === 'production';

// Use in-memory database in production, file-based in development
const dbPath = isProduction ? ':memory:' : 'DB_Notebook.db';
console.log(`Using database: ${dbPath} (${isProduction ? 'Production' : 'Development'} mode)`);
const db = new sqlite3.Database(dbPath); // Connect to database
=======
>>>>>>> bde9db8caa29941a23f776a0fc0a627974a1937c
const port = process.env.PORT || 3000;
app.use(express.static('public'));
const swaggerSetup = require('./Api/swagger');
const cors = require('cors');
const dotenv = require('dotenv'); // Load environment variables from .env file
dotenv.config(); // Ensure the environment variables are loaded
<<<<<<< HEAD
=======
const { users } = require('./Api/handlers/socketHandler');
const { setupSocketHandlers } = require('./Api/handlers/socketHandler');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cloudinary = require("./Api/config/cloudinary");
// test merge test 3
const allowedOrigins = [
    'http://localhost:3000',
    'vermillion-bienenstitch-d376af.netlify.app' 
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
app.get("/cloudinary-ping", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();

    res.json({
      success: true,
      result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// test upload from URL
app.get("/test-upload", async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      {
        folder: "test"
      }
    );

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


app.get('/test-ip', (req, res) => {
  res.json({
    ip: req.ip,
    forwarded: req.headers['x-forwarded-for']
  });
});
// Secure CORS
app.use(cors({
  origin: function (origin, callback) {
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
>>>>>>> bde9db8caa29941a23f776a0fc0a627974a1937c


const { deleteUnusedImages } = require('./Api/Router/ImageHelper');
const chatRoutes = require('./Api/Router/chat_Router');
const authRouter = require('./Api/Router/auth_Router');
<<<<<<< HEAD
// Import the verifyToken middleware
//const verifyToken = require('./Api/Middleware/verifyToken'); // Adjust the path as needed
const bodyParser = require('body-parser');
=======
const verifyToken = require('./Api/Middleware/verifyToken');
>>>>>>> bde9db8caa29941a23f776a0fc0a627974a1937c
const usersRouter = require('./Api/Router/usersRouter');
const recipeRouter = require('./Api/Router/recipeRouter');
const detailRecipeRouter = require('./Api/Router/detail_recipeRouter');
const ingredientRecipeRouter = require('./Api/Router/ingredient_Router');
const ingredientsRecipeRouter = require('./Api/Router/IngredientRecipe_Router');
const stepRecipeRouter = require('./Api/Router/step_recipeRouter');
const reviewRecipeRouter = require('./Api/Router/review_recipeRouter');
const produitRouter = require('./Api/Router/produit_Router');
const favRouter = require('./Api/Router/fav_user_recipe_Router');
<<<<<<< HEAD
const recipeModelRouter = require('./Api/Repo/recipeModelRouter');
const categoryModelRouter = require('./Api/Router/category_Router');
=======
const categoryRouter = require('./Api/Router/category_Router');
>>>>>>> bde9db8caa29941a23f776a0fc0a627974a1937c


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
// Swagger setup
swaggerSetup(app);

app.use('/auth', authRouter);
app.use(verifyToken); // Apply middleware to all routes
app.use('/users', usersRouter);
app.use('/api/chat', chatRoutes);
<<<<<<< HEAD
app.use('/auth', authRouter);
// Apply the middleware to all routes
//app.use(verifyToken);
=======
>>>>>>> bde9db8caa29941a23f776a0fc0a627974a1937c
app.use('/recipes', recipeRouter);
app.use('/detailrecipes', detailRecipeRouter);
app.use('/ingredientrecipes', ingredientRecipeRouter);
app.use('/ingredientsrecipes', ingredientsRecipeRouter);
app.use('/steprecipes', stepRecipeRouter);
app.use('/reviewrecipes', reviewRecipeRouter);
app.use('/produits', produitRouter);
app.use('/favorites', favRouter);
app.use('/categories', categoryRouter);

<<<<<<< HEAD
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
  console.log(socket.id + ': user connected');

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
          console.log(`User ${data.receiverId} is not connected `);
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
const path = require('path');
const fs = require('fs');
db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON'); // Enable foreign key support (optional)

  db.get("SELECT 1", (err, result) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
    } else {
      console.log('Connected to the database.');

      // Initialize SQLite database
      try {
        // Read and run schema.sql
        const schemaPath = path.join(__dirname, './sqliteedbreate.sql');
        
        if (fs.existsSync(schemaPath)) {
          const schema = fs.readFileSync(schemaPath, 'utf8');
          
          db.exec(schema, (err) => {
            if (err) {
              console.error('Error executing schema:', err.message);
            } else {
              console.log('Database schema created or already exists.');
              
              // If using in-memory database in production, we need to seed it with some data
              if (isProduction) {
                console.log('Running in production with in-memory database - adding sample data');
                // Add some sample data for testing
                db.run(`INSERT OR IGNORE INTO Recipe (name, description, image_url) 
                       VALUES ('Sample Recipe', 'This is a sample recipe for testing', 'sample.jpg')`);
              }
            }
          });
        } else {
          console.warn('Schema file not found. Using database as-is.');
        }
      } catch (fsError) {
        console.error('Error reading schema file:', fsError.message);
        console.log('Continuing with existing database structure');
      }
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

// Example: Public route (previously protected)
app.get('/protected', (req, res) => {
  // This route is now public for testing
  res.status(200).json({ message: 'This route is now public for testing' });
=======
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
>>>>>>> bde9db8caa29941a23f776a0fc0a627974a1937c
});

// Start the server if running as a real server (not inside Netlify Functions)
if (!process.env.NETLIFY || process.env.NETLIFY_FUNCTION_NAME === undefined) {
  server.listen(port, () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🚀 Server is running at http://localhost:${port}//`);
    } else {
      console.log(`🚀 Server running in production`);
    }
  });
}

// Export the Express app for serverless function
module.exports = app;

