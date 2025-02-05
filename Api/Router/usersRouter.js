const express = require('express');
const router = express.Router();
const User = require('../Model/User');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
router.use(express.json()); 
router.use(express.urlencoded({ extended: true }));
const UserRepository  = require('../Repo/UserRepository'); // Replace with the actual path
const { body, validationResult } = require('express-validator');
const validateUser = require('../validators/validateUser');


// Get a user by ID
/*router.get('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    await UserRepository.getUserById(userId, (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!user) {
        return res.status(406).json({ error: 'User not found' });
      }
      res.json(user);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});*/


//router.use(bodyParser.json());
const storage = multer.diskStorage({
  destination: './public/uploads/', // Destination directory
  filename: function (req, file, cb) {
      // Define a custom file name (you can modify this logic)
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
  } 
//const upload = multer({ storage: storage });
});
const upload = multer({ dest: 'uploads/', storage: storage})

// Create a new user
// Create a new user
router.post('/', validateUser.validateUserRegistration, async (req, res) => {

  // Extract user data from the request body
  const {
    username,
    firstname,
    lastname,
    birthday,
    email,
    phoneNumber,
    icon,
    password,
    grade,
    status,
    url,
  } = req.body;

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Create the user in the database
  User.createUser(
  username,
  firstname,
  lastname,
  birthday,
  email,
  phoneNumber,
  icon,
  password,
  grade,
  status,
  url,
  (err, newUser) => {
    
    if (err) {
      if (err.message === 'User already exists') {
        return res.status(409).json({ error: 'User already exists' });
      }
      else {
      return res.status(500).json({ error: err.message });
      }
    }
    res.status(201).json(newUser);
  }
  );
});

router.delete('/delete/:path', (req, res) => {
  const pathimage = req.params.path;
  console.log('path for delete '+pathimage);
  User.deleteimage(pathimage,(err, validite) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(validite);
  });
});

router.post('/upload/:username', upload.single('image'),async  (req, res) => {
  const username = req.params.username;
  console.log(req.body);
  console.log(req.file);
  if (!req.file) {
      return res.status(400).send('No file uploaded.');
  }
  // Process the uploaded file
  const fileName = req.file.filename;
  const imageUrl = encodeURIComponent(fileName);
  console.log(username);

  User.UpdateUserImage(username,imageUrl,(err, validite) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
  // If the user doesn't exist, add them to the database
    res.status(201).json(validite);
  });
});

// Get a user by ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;

  User.getUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(406).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// Get a user by USERNAME
router.get('/filtre/:username', (req, res) => {
  const username = req.params.username;
console.log(username)
  User.getUserByUsername(username, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(406).json({ error: 'User not found' });
    } 
    res.json(user);
  });
});

// Get a user by image user
router.get('/image/:username', (req, res) => {
  const username = req.params.username;
console.log("username for image is : " +username)
  User.getUserImage(username, (err, imageByte) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!imageByte) {
      return res.status(406).json({ error: 'image not found' });
    } 
    console.log(imageByte);
    res.json(imageByte);
  });
});

// get All Users
router.get('/', (req, res) => {
  User.getAllUsers((err, users) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(users);
  });
});

// Add more user routes as needed

router.put('/image/:username', (req, res) => {
  const username = req.params.username;
  const {url} =req.body;
  const imageurl = url;
  console.log(req.body);
  console.log(username);
  User.UpdateUserImage(username,imageurl,(err,path) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!path) {
      return res.status(406).json({ error: 'User not found or not updated!!' });
    }
    res.json(path);
  });
})

// Update a user by ID
router.put('/:id', validateUser.validateUserUpdate, (req, res) => {
  const userId = req.params.id;
  const {
    username,
    firstname,
    lastname,
    birthday,
    email,
    phoneNumber,
    icon,
    password,
    grade,
    status,
    url,
  } = req.body;
   // Check for validation errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }
  User.updateUser(userId,username,firstname,lastname,birthday,email,phoneNumber,icon,password,grade,status,url, (err, updatedUser) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!updatedUser) {
      return res.status(406).json({ error: 'User not found or not updated' });
    }
    res.json(updatedUser);
  });
});

// Update a user by USERNAME
router.put('/filtre/:username',  validateUser.validateUserUpdate ,async (req, res) => {
  const username = req.params.username;
  console.log(username);
  const {
    firstname,
    lastname,
    birthday,
    email,
    phoneNumber,
    icon,
    password,
    grade,
    status,
    url,
  } = req.body;
   // Check for validation errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }
  User.updateUserByUsername(username,firstname,lastname,birthday,email,phoneNumber,icon,password,grade,status,url, (err, updatedUser) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!updatedUser) {
      return res.status(406).json({ error: 'User not found or not updated' });
    }
    res.json(updatedUser);
  });
});



// Delete a user by ID
router.delete('/:id', validateUser.validateUserDelete, (req, res) => {
  const userId = req.params.id;
   // Check for validation errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }
  User.deleteUser(userId, (err, deleted) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!deleted) {
      return res.status(406).json({ error: 'User not found or not deleted' });
    }
    res.json({ message: 'User deleted successfully' });
  });
  // Implement delete logic here using the User model
});

// Add more user routes with parameters as needed

// Define a route for the root URL
router.get('/', (req, res) => {
  res.send('Hello from the router User!');
});


module.exports = router;


module.exports = router;
