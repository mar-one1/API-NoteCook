const express = require("express");
//const { body, validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const user = require("../Model/User");
const db = require("../../database");
// Secret key for JWT token (change this to a secure value in production)
const secretKey = process.env.JWT_SECRET;
const authRouter = express.Router();

authRouter.use(bodyParser.json());

// Replace this with your actual user database or authentication logic
/*const users = [
  { id: 1, username: '1', password: '$2a$10$rtcpkO/lhLClCYhUrDMTFuGV0BGpejIfP7AYdx96.YSQpTqsl55sK' }, // Password: password1
  { id: 2, username: 'R', password: '$2a$10$s0LOsngxGXQpiDywyvF6ceCBGN238klsEprYMtVWdpnlXruSNvjnO' },
  ];
*/
// Fetch all users from the database



// Login route
authRouter.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log(username);
  console.log(password);
  // Find the user in the database
  db.get(
    "SELECT * FROM User WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Login failed" });
      }

      if (!user) {
        return res.status(406).json({ error: "User not found" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      // Compare the provided password with the hashed password in the database
      bcrypt.compare(password, user.password, (err, result) => {
        if (err || !result) {
          return res
            .status(401)
            .json({ error: "Authentication failed compare" });
        }

        console.log(user);
        // Generate a JWT token
        //const token = jwt.sign({ id: user.Id_user,username: user.username,firstname: user.Firstname_user,icon:user.icon,birthday:user.Birthday_user,lastname:user.Lastname_user,email:user.Email_user,phoneNumber:user.Phonenumber_user,grade:user.Grade_user,status:user.Status_user,password:user.password }, secretKey, {
        const token = jwt.sign(
          { id: user.Id_user, username: user.username },
          secretKey,
          {
            expiresIn: "0.5h", // Token expiration time (adjust as needed)
          }
        );

        res.status(200).json({ message: "Authentication successful", token });
      });
    
    }
  );
});
module.exports = authRouter;
