const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const pool = require("../data/database"); // Import your PostgreSQL pool
const User = require('../Model/User');
// Secret key for JWT token (change this to a secure value in production)
const { body, validationResult } = require('express-validator');
const validateUser = require('../validators/validateUser');
require("dotenv").config();
const secretKey = process.env.JWT_SECRET;
const authRouter = express.Router();
authRouter.use(bodyParser.json());
const multer = require('multer');
const path = require('path');
const upload = multer({ storage: multer.memoryStorage() });
const { processUploadedFile } = require('../utils/fileUpload');


// Login route
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  let client;
  try {
    client = await pool.connect();

    // Find the user
    const query = `SELECT * FROM "User" WHERE LOWER("username") = LOWER($1)`;
    const { rows } = await client.query(query, [username]);

    if (rows.length === 0) {
      return res.status(406).json({ error: "Invalid username or password" });
    }

    const user = rows[0];
    // Password check
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // ✔ MUST CHANGE PASSWORD LOGIC
    if (user.force_password_change === true) {
      return res.status(200).json({
        status: "PASSWORD_CHANGE_REQUIRED",
        user_id: user.Id_user
      });
    }

    if (user.status === "active") {
      return res.status(403).json({
        error: "Account disabled"
      });
    }

    // Normal login → Generate JWT
    const token = jwt.sign(
      { id: user.id_user, username: user.username },
      secretKey,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Authentication successful", token });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  } finally {
    if (client) {
      client.release();
    }
  }
});

authRouter.post("/register", validateUser.validateUserRegistration, async (req, res) => {
  try {

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
      unique_key_user,
    } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.createUser(
      username,
      firstname,
      lastname,
      birthday,
      email,
      phoneNumber,
      icon,
      hashedPassword,
      grade,
      status,
      url,
      unique_key_user,
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
});

authRouter.post('/upload/:username', upload.single('image'), async (req, res) => {
  const username = req.params.username;

  console.log('Request body:', req.body);

  // Check if a file is uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    // Process the uploaded file and get base64 data
    const { filename, base64Data } = processUploadedFile(req.file);
    const imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    console.log('Generated base64 image URL');

    // Update the user's image in the database
    User.updateUserImage(username, imageUrl, (err, updatedImageUrl) => {
      if (err) {
        console.error('Error updating user image:', err);
        return res.status(500).json({ error: 'Failed to update user image.' });
      }

      if (!updatedImageUrl) {
        return res.status(404).json({ error: 'User not found or update failed.' });
      }

      // Respond with success
      res.status(200).json(updatedImageUrl);
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});




authRouter.post("/change-password", async (req, res) => {
  const { user_id, old_password, new_password } = req.body;

  let client;
  try {
    client = await pool.connect();

    // Get user with password
    const query = `SELECT "password" FROM "User" WHERE "Id_user" = $1`;
    const { rows } = await client.query(query, [user_id]);

    if (rows.length === 0) {
      return res.status(406).json({ error: "User not found" });
    }

    const user = rows[0];

    // Compare old password
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Old password incorrect" });
    }
    // Hash new password
    const hashed = await bcrypt.hash(new_password, 10);
    // Update password + disable must change
    await client.query(
      `UPDATE "User"
       SET "password" = $1,
           "force_password_change" = FALSE
       WHERE "Id_user" = $2`,
      [hashed, user_id]
    );

    res.status(200).json({ status: "SUCCESS", message: "Password updated" });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(400).json({ error: "Failed to change password" });
  } finally {
    if (client) {
      client.release();
    }
  }
});



module.exports = authRouter;
