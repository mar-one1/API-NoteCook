const express = require('express');
const router = express.Router();
const User = require('../Model/User');
const { validationResult } = require('express-validator');
const validateUser = require('../validators/validateUser');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// CREATE user
router.post('/', validateUser.validateUserRegistration, async (req, res) => {
  const {
    username, firstname, lastname, birthday,
    email, phoneNumber, icon, password,
    grade, status, url
  } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  User.createUser(
    username, firstname, lastname, birthday, email,
    phoneNumber, icon, password, grade, status, url,
    (err, newUser) => {
      if (err) {
        const status = err.message === 'User already exists' ? 409 : 500;
        return res.status(status).json({ error: err.message });
      }
      res.status(201).json(newUser);
    }
  );
});

// UPLOAD user image (in-memory)
router.post('/upload/:username', upload.single('image'), (req, res) => {
  const username = req.params.username;

  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  const { buffer, originalname, mimetype } = req.file;

  User.updateUserImage(username, buffer, originalname, mimetype, (err, updatedImageUrl) => {
    if (err) return res.status(500).json({ error: 'Failed to update user image.' });
    if (!updatedImageUrl) return res.status(404).json({ error: 'User not found or update failed.' });

    res.status(200).json(updatedImageUrl);
  });
});

// DELETE image by path
router.delete('/delete/:path', (req, res) => {
  const pathimage = req.params.path;

  User.deleteimage(pathimage, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(result);
  });
});

// GET user by ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;

  User.getUserById(userId, (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(406).json({ error: 'User not found' });

    res.json(user);
  });
});

// GET user by username
router.get('/filtre/:username', (req, res) => {
  const username = req.params.username;

  User.getUserByUsername(username, (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(406).json({ error: 'User not found' });

    res.json(user);
  });
});

// GET user image
router.get('/image/:username', (req, res) => {
  const username = req.params.username;

  User.getUserImage(username, (err, imageByte) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!imageByte) return res.status(406).json({ error: 'Image not found' });

    res.json(imageByte);
  });
});

// GET all users
router.get('/', (req, res) => {
  User.getAllUsers((err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(users);
  });
});

// PUT update image by URL
router.put('/image/:username', (req, res) => {
  const username = req.params.username;
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'Image URL is required.' });

  User.updateUserImage(username, url, (err, updatedImageUrl) => {
    if (err) return res.status(500).json({ error: 'Error updating image.' });
    if (!updatedImageUrl) return res.status(404).json({ error: 'User not found or not updated.' });

    res.status(200).json(updatedImageUrl);
  });
});

// PUT update user by ID
router.put('/:id', validateUser.validateUserUpdate, (req, res) => {
  const userId = req.params.id;
  const {
    username, firstname, lastname, birthday,
    email, phoneNumber, icon, password,
    grade, status, url
  } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  User.updateUser(userId, username, firstname, lastname, birthday,
    email, phoneNumber, icon, password, grade, status, url,
    (err, updatedUser) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!updatedUser) return res.status(406).json({ error: 'User not found or not updated' });

      res.json(updatedUser);
    }
  );
});

// PUT update user by username
router.put('/filtre/:username', validateUser.validateUserUpdate, (req, res) => {
  const username = req.params.username;
  const {
    firstname, lastname, birthday,
    email, phoneNumber, icon, password,
    grade, status, url
  } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  User.updateUserByUsername(username, firstname, lastname, birthday,
    email, phoneNumber, icon, password, grade, status, url,
    (err, updatedUser) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!updatedUser) return res.status(406).json({ error: 'User not found or not updated' });

      res.json(updatedUser);
    }
  );
});

// DELETE user by ID
router.delete('/:id', validateUser.validateUserDelete, (req, res) => {
  const userId = req.params.id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  User.deleteUser(userId, (err, deleted) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!deleted) return res.status(406).json({ error: 'User not found or not deleted' });

    res.json({ message: 'User deleted successfully' });
  });
});

// Default root route
router.get('/', (req, res) => {
  res.send('Hello from the router User!');
});

module.exports = router;
