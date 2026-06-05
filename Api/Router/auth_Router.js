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

// Login route
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  let client;
  try {
    client = await pool.connect();

    // Find the user
    const query = `SELECT * FROM "User" WHERE "username" = $1`;
    const { rows } = await client.query(query, [username]);

    if (rows.length === 0) {
      return res.status(406).json({ error: "User not found" });
    }

    const user = rows[0];
    // Password check
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // ✔ MUST CHANGE PASSWORD LOGIC
    if (user.force_password_change === true) {
      return res.status(200).json({
        status: "PASSWORD_CHANGE_REQUIRED",
        user_id: user.Id_user
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

authRouter.post("/register", async (req, res) => {
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

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
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
