const pool = require("../data/database");
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const fs = require("fs");
const path = require("path");
const { isNull } = require("util");
const crypto = require("crypto");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */
class User {
  constructor(
    id,
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
    unique_key_user
  ) {
    this.id = id;
    this.username = username;
    this.firstname = firstname;
    this.lastname = lastname;
    this.birthday = birthday;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.icon = icon;
    this.password = password;
    this.grade = grade;
    this.status = status;
    this.url = url;
    this.unique_key_user = unique_key_user;
  }



  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Create a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     responses:
   *       '201':
   *         description: Successfully created a new user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       '400':
   *         description: Bad request, invalid user data
   *       '500':
   *         description: Internal server error
   */
  static async createUser(
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
    unique_key_user
  ) {
    try {

    
      // 2. Check username exists
      const usernameCheck = await pool.query(
      'SELECT "Id_user" FROM "User" WHERE username = $1',
      [username]
    );

    if (usernameCheck.rows.length > 0) {
      throw new Error("Username already exists");
    }

    // 3. Check email exists
    if (email) {
      const emailCheck = await pool.query(
        'SELECT "Id_user" FROM "User" WHERE "Email_user" = $1',
        [email]
      );

      if (emailCheck.rows.length > 0) {
        throw new Error("Email already exists");
      }
    }

    // 1. Generate unique key if missing
      if (unique_key_user === null || unique_key_user === undefined || unique_key_user === "") {
        unique_key_user = crypto.randomUUID();
      } else {
        // 4. Check unique_key_user exists
        const keyCheck = await pool.query(
          'SELECT "Id_user" FROM "User" WHERE "unique_key_user" = $1',
          [unique_key_user]
        );

        if (keyCheck.rows.length > 0) {
         throw new Error("Unique key already exists");
        } else {
          // regenerate once if collision
          unique_key_user = crypto.randomUUID();

          const retryCheck = await pool.query(
            'SELECT "Id_user" FROM "User" WHERE "unique_key_user" = $1',
            [unique_key_user]
          );

          if (retryCheck.rows.length > 0) {
            throw new Error("Failed to generate unique key");
          }
        }
    }



    // 5. Insert user
    const insertQuery = `
      INSERT INTO "User" (
        username,
        "Firstname_user",
        "Lastname_user",
        "Birthday_user",
        "Email_user",
        "Phonenumber_user",
        "Icon_user",
        password,
        "Grade_user",
        "Status_user",
        "Url_image",
        "unique_key_user"
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `;

    const values = [
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
      unique_key_user
    ];

    const result = await pool.query(insertQuery, values);

    return result.rows[0];

  } catch(error) {
    console.error("Create User Error:", error);
    throw error;
  }
}



  /**
   * @swagger
   * /users/{userId}:
   *   get:
   *     summary: Get a user by ID
   *     tags: [Users]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       '200':
   *         description: Successfully retrieved user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       '406':
   *         description: User not found
   *       '500':
   *         description: Internal server error
   */
  static async getUserById(id, callback) {
  // Getting a pool from the pool
  try {
    const query = 'SELECT * FROM "User" WHERE "Id_user" = $1';
    const res = await pool.query(query, [id]);

    if (res.rows.length === 0) {
      callback(null, null); // User not found
      return;
    }

    const row = res.rows[0];
    const user = new User(
      row.Id_user,
      row.username,
      row.Firstname_user,
      row.Lastname_user,
      row.Birthday_user,
      row.Email_user,
      row.Phonenumber_user,
      row.Icon_user == null,  // Fix the Icon_user field assignment
      row.password,
      row.Grade_user,
      row.Status_user,
      row.Url_image,
      row.unique_key_user
    );
    callback(null, user);
  } catch (err) {
    console.error("Error getting user by id: " + id, err);
    callback(err, null);
  }
}


  // Helper function to get all image paths from the database
  static async getAllImagePathsFromDatabase(callback) {

  try {
    const query = 'SELECT "Url_image" FROM "User"';
    const res = await pool.query(query);

    const paths = res.rows.map((row) => row.Url_image);
    console.log("Paths getting from db:", paths);

    callback(null, paths);
  } catch (err) {
    console.error("Error getting all image paths from database:", err);
    callback(err, null);
  }
}


  static async updateUserImage(username, imageUrl, callback) {
  try {
    const query = 'UPDATE "User" SET "Url_image" = $1 WHERE "username" = $2';
    const res = await pool.query(query, [imageUrl, username]);

    if (res.rowCount === 0) {
      callback(null, null); // No rows updated, user not found
      return;
    }

    // Successfully updated user image
    callback(null, imageUrl);
    console.log("Image updated:", imageUrl);
  } catch (err) {
    console.error("Error updating user image:", err);
    callback(err, null);
  }
}



  static async getUserImage(username, callback) {

  try {
    const query = 'SELECT Icon_user FROM "User" WHERE username = $1';
    const res = await pool.query(query, [username]);

    if (res.rows.length === 0) {
      callback(null, null); // User not found
      return;
    }

    // Pass the retrieved image URL or binary data to the callback
    callback(null, res.rows[0].Icon_user);
  } catch (err) {
    console.error("Error getting user image", err);
    callback(err, null);
  }
}


  static async getUserByUsername(usernameUser, callback) {

  try {
    const query = 'SELECT * FROM "User" WHERE username = $1';
    const res = await pool.query(query, [usernameUser]);

    if (res.rows.length === 0) {
      callback(null, null); // User not found
      return;
    }

    const row = res.rows[0];
    const user = new User(
      row.Id_user,
      row.username,
      row.Firstname_user,
      row.Lastname_user,
      row.Birthday_user,
      row.Email_user,
      row.Phonenumber_user,
      row.Icon_user == null,  // Icon_user should not be null unless explicitly required
      row.password,
      row.Grade_user,
      row.Status_user,
      row.Url_image,
      row.unique_key_user
    );

    callback(null, user);
  } catch (err) {
    console.error("Error getting user by username: " + usernameUser, err);
    callback(err, null);
  }
}


  static async deleteimage(pathimage, callback) {
  try {
    // Skip update if oldPath is base64 string
    if (pathimage && pathimage.startsWith('data:')) {
      console.log("Old path is base64 data, skipping image update.");
      return callback(null, imagebyte);
    }
    const filePathToDelete = "./public/uploads/" + pathimage; // Replace with the path to the file you want to delete
    // Check if the file exists
    console.log("path for delete " + filePathToDelete);
    fs.access(filePathToDelete, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("File does not exist or cannot be accessed.");
        return;
      }

      // File exists, proceed to delete
      fs.unlink(filePathToDelete, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting file:", unlinkErr);
          return;
        }
        console.log("File deleted successfully.");
        callback(null, "File deleted successfully.");
      });
    });
  } catch (err) {

    console.error("Error delete image user : " + pathimage, err);
    callback(err, null);
  }
}
  static async getUsers(page = 1, limit = 10, callback) {
  try {
    page = Number(page) || 1;
    limit = Math.min(Number(limit) || 10, 50);
    const offset = (page - 1) * limit;

    const res = await pool.query(
      `SELECT "Id_user", "username", "Firstname_user", "Lastname_user"
       FROM "User"
       ORDER BY "Id_user" Asc
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const users = res.rows.map(row => ({
      id: row.Id_user,
      username: row.username,
      firstname: row.Firstname_user,
      lastname: row.Lastname_user
    }));

    const countRes = await pool.query(`SELECT COUNT(*) FROM "User"`);
    const totalUsers = parseInt(countRes.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);

    callback(null, { page, limit, totalUsers, totalPages, users });

  } catch (err) {
    console.error("Error getting users:", err);
    callback(err, null);
  }
}

  static async updateUser(
  UserId,
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
  callback
) {

  try {
    // If password is being updated, hash it
    const hashedPassword = password ? await bcrypt.hash(password, saltRounds) : null;

    const query = `UPDATE "User" 
        SET "Firstname_user" = $1, "Lastname_user" = $2, "Birthday_user" = $3, "Email_user" = $4, "Phonenumber_user" = $5, "Icon_user" = $6, password = $7, "Grade_user" = $8, "Status_user" = $9, "Url_image" = $10, "unique_key_user" = $11
        WHERE Id_user = $12
        RETURNING "Id_user"`;

    const res = await pool.query(query, [
      firstname, lastname, birthday, email, phoneNumber, icon, hashedPassword || password, grade, status, url, UserId
    ]);

    if (res.rowCount === 0) {
      callback(null, null); // User not found or not updated
      return;
    }

    const updatedUser = new User(
      res.rows[0].id_user,
      username,
      firstname,
      lastname,
      birthday,
      email,
      phoneNumber,
      icon,
      hashedPassword || password,
      grade,
      status,
      url,
      unique_key_user
    );

    callback(null, updatedUser);
  } catch (err) {
    console.error("Error updating user", err);
    callback(err, null);
  }
}

  static async deleteUser(id, callback) {

  try {
    // Delete user image file if needed
    const queryImage = 'SELECT "Icon_user" FROM "User" WHERE "Id_user" = $1';
    const resImage = await pool.query(queryImage, [id]);

    if (resImage.rows.length === 0) {
      callback(null, "User not found");
      return;
    }

    const imageFilePath = resImage.rows[0].Icon_user;
    if (imageFilePath) {
      fs.unlink(path.join(__dirname, 'public', 'uploads', imageFilePath), (err) => {
        if (err) {
          console.error("Error deleting image file", err);
        } else {
          console.log("Image file deleted");
        }
      });
    }

    // Now delete the user record
    const query = 'DELETE FROM "User" WHERE "Id_user" = $1 RETURNING *';
    const resDelete = await pool.query(query, [id]);

    if (resDelete.rowCount === 0) {
      callback(null, "User not found");
      return;
    }

    callback(null, `User with ID ${id} deleted successfully`);
  } catch (err) {
    console.error("Error deleting user", err);
    callback(err, null);
  }
}



  static async updateUserByUsername(
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
  callback
) {

  try {
    console.log("test" + username);

    const query = `
        UPDATE "User" 
        SET "Firstname_user" = $1, "Lastname_user" = $2, "Birthday_user" = $3, "Email_user" = $4, "Phonenumber_user" = $5, "Icon_user" = $6, password = $7, "Grade_user" = $8, "Status_user" = $9, "Url_image" = $10, unique_key_user = $11 
        WHERE username = $11 
        RETURNING "Id_user"
      `;

    const values = [
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
      username,
    ];

    const res = await pool.query(query, values);

    if (res.rowCount === 0) {
      const error = new Error("User not found or not updated");
      callback(error, null);
      return;
    }

    const updatedUser = new User(
      res.rows[0].id_user,
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
      unique_key_user
    );

    console.log(updatedUser);
    callback(null, updatedUser);
  } catch (err) {
    console.error("Error updating user by username: " + username, err);
    callback(err, null);
  }
}

  static async updateImageUserByUsername(username, icon, callback) {

  try {
    const query = `
        UPDATE "User" 
        SET "Url_image" = $1 
        WHERE username = $2 
        RETURNING "Id_user", username, "Url_image"
      `;

    const values = [icon, username];
    const res = await pool.query(query, values);

    if (res.rowCount === 0) {
      const error = new Error("User not found or not updated");
      callback(error, null);
      return;
    }

    const updatedUser = new User(
      res.rows[0].id_user,  // Assuming 'id_user' is the primary key
      username,
      null, // The first name, last name, and other fields can be `null` or handled as needed
      null,
      null,
      null,
      null,
      icon,
      null,
      null,
      null,
      null
    );

    console.log(updatedUser);
    callback(null, updatedUser);
  } catch (err) {
    console.error("Error updating image for user by username: " + username, err);
    callback(err, null);
  }
}


  static async deleteUser(UserId, callback) {

  try {
    const query = 'DELETE FROM "User" WHERE "Id_user" = $1 RETURNING "Id_user"';

    const res = await pool.query(query, [UserId]);

    if (res.rowCount === 0) {
      callback(null, false); // User not found or not deleted
      return;
    }

    callback(null, true); // User deleted successfully
  } catch (err) {
    console.error("Error deleting user with ID: " + UserId, err);
    callback(err, null);
  }
}


  // ... (Other methods)

  // Add more methods as needed (e.g., update, delete, get all users)
}

module.exports = User;