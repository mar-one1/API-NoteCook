const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const pool = require("../../data/database"); // Import your PostgreSQL pool

const authRouter = express.Router();

authRouter.use(bodyParser.json());

// Secret key for JWT token (change this to a secure value in production)
const secretKey = "123456";

// Login route
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Username:", username);
  console.log("Password:", password);

  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();

    // Find the user in the database
    const query = `SELECT * FROM "User" WHERE "username" = $1`;
    const { rows } = await client.query(query, [username]);

    if (rows.length === 0) {
      return res.status(406).json({ error: "User not found" });
    }

    const user = rows[0];

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id_user, username: user.username },
      secretKey,
      { expiresIn: "0.5h" } // Token expiration time (adjust as needed)
    );

    res.status(200).json({ message: "Authentication successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
  }
});

module.exports = authRouter;
