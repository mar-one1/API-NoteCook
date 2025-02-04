const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const authRouter = express.Router();
authRouter.use(bodyParser.json());




// Secret key for JWT token (use a secure value in production)
const secretKey = "123456";

// Login route
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL_LOCAL, // Your PostgreSQL connection string
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  try {
    // Find the user in the database
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(406).json({ error: "User not found" });
    }

    const user = result.rows[0];

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id_user, username: user.username },
      secretKey,
      {
        expiresIn: "0.5h", // Token expiration time
      }
    );

    res.status(200).json({ message: "Authentication successful", token });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = authRouter;
