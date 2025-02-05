// userRouter.js
const express = require("express");
const router = express.Router();
const User = require("../Model/User"); // Assuming userModel.js is inside a Model directory
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const { validationResult } = require("express-validator");
const validateUser = require("../validators/validateUser"); // Your validation logic
const upload = multer({ dest: "uploads/" }); // Change this if you want a different folder for image upload

// Create a new user
router.post("/", validateUser.validateUserRegistration, async (req, res) => {
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

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newUser = await User.createUser(
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
      url
    );
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a user by Username
router.get("/filtre/:username", async (req, res) => {
  try {
    const user = await User.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user image by username
router.post("/upload/:username", upload.single("image"), async (req, res) => {
  const username = req.params.username;
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const imageUrl = encodeURIComponent(req.file.filename);

  try {
    const updatedUser = await User.updateUserImage(username, imageUrl);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(201).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a user by ID
router.put("/:id", validateUser.validateUserUpdate, async (req, res) => {
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

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedUser = await User.updateUser(userId, { username, firstname, lastname, birthday, email, phoneNumber, icon, password, grade, status, url });
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found or not updated" });
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a user by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
