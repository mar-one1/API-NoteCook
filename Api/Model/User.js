const db = require("../../database");
const fs = require("fs");

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
    url
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
  static createUser(
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
    callback
  ) {
    
    try {
      // Check if the user already exists
      db.get(
        "SELECT * FROM User WHERE username = ?",
        [username],
        function (err, row) {
          if (err) {
            
            callback(err);
            return;
          }

          if (row) {
            
            console.log("User already exists");
            // User already exists, handle accordingly (e.g., return an error)
            callback(new Error("User already exists"));
            return;
          }

          // User doesn't exist, insert them into the database
          db.run(
            "INSERT INTO User (username, Firstname_user, Lastname_user, Birthday_user, Email_user, Phonenumber_user, Icon_user, password, Grade_user, Status_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
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
            ],
            function (err) {
              if (err) {
                
                callback(err);
                return;
              }

              // Fetch the inserted user
              const newUser = new User(
                this.lastID,
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
              
              callback(null, newUser);
            }
          );
        }
      );
    } catch (err) {
      
      console.error("Error Create User", err);
      callback(err, null);
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
  static getUserById(id, callback) {
    
    try {
      db.get("SELECT * FROM User WHERE Id_user = ?", [id], (err, row) => {
        if (err) {
          callback(err, null);
          return;
        }
        if (!row) {
          callback(null, null); // User not found
          return;
        }
        const user = new User(
          row.Id_user,
          row.username,
          row.Firstname_user,
          row.Lastname_user,
          row.Birthday_user,
          row.Email_user,
          row.Phonenumber_user,
          (row.Icon_user = null),
          row.password,
          row.Grade_user,
          row.Status_user,
          row.Url_image
        );
        callback(null, user);
      });
      
    } catch (err) {
      
      console.error("Error getting user by id: " + id, err);
      callback(err, null);
    }
  }

  // Helper function to get all image paths from the database
  static getAllImagePathsFromDatabase(callback) {
    
    db.all("SELECT Url_image FROM User", [], (err, rows) => {
      if (err) {
        
        console.error("Error getting all image paths from database:", err);
        return callback(err, null);
      }
      const paths = rows.map((row) => row.Url_image);
      console.log("path geting form db :" + paths);
      
      callback(null, paths);
    });
  }

  static async UpdateUserImage(username, imagebyte, callback) {
    
    try {
      db.run(
        "UPDATE User SET Url_image = ? WHERE username = ?",
        [imagebyte, username],
        function (err) {
          if (err) {
            callback(err);
            return;
          }
          if (this.changes === 0) {
            callback(null, null); // User not found or not updated
            return;
          }
          // If the user doesn't exist, add them to the database
          callback(null, imagebyte);
          console.log(imagebyte);
        }
      );
      
    } catch (err) {
      
      console.error("Error Update User Image", err);
      callback(err, null);
    }
  }

  static getUserImage(username, callback) {
    
    try {
      db.get(
        "SELECT Icon_user FROM User WHERE username = ?",
        [username],
        (err, row) => {
          if (err) {
            
            callback(err, null);
            return;
          }
          if (!row) {
            
            callback(null, null); // User not found
            return;
          }
          
          // Pass the retrieved image URL or binary data to the callback
          callback(null, row.Icon_user);
        }
      );
      UpdateUserImage;
    } catch (err) {
      
      console.error("Error get User Image", err);
      callback(err, null);
    }
  }

  static getUserByUsername(usernameUser, callback) {
    
    try {
      db.get(
        "SELECT * FROM User WHERE username = ?",
        [usernameUser],
        (err, row) => {
          if (err) {
            callback(err, null);
            return;
          }
          if (!row) {
            callback(null, null); // User not found
            return;
          }
          const user = new User(
            row.Id_user,
            row.username,
            row.Firstname_user,
            row.Lastname_user,
            row.Birthday_user,
            row.Email_user,
            row.Phonenumber_user,
            (row.Icon_user = null),
            row.password,
            row.Grade_user,
            row.Status_user,
            row.Url_image
          );
          callback(null, user);
        }
      );
      
    } catch (err) {
      
      console.error("Error getting user by username: " + usernameUser, err);
      callback(err, null);
    }
  }

  static deleteimage(pathimage, callback) {
    try {
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
  static getAllUsers(callback) {
    
    try {
      db.all("SELECT * FROM User", (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        const users = rows.map((row) => {
          return new User(
            row.Id_user,
            row.username,
            row.Firstname_user,
            row.Lastname_user,
            row.Birthday_user,
            row.Email_user,
            row.Phonenumber_user,
            row.Icon_user,
            row.password,
            row.Grade_user,
            row.Status_user,
            row.Url_image
          );
        });
        callback(null, users);
      });
      
    } catch (err) {
      
      console.error("Error get All Users", err);
      callback(err, null);
    }
  }

  static updateUser(
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
    callback
  ) {
    
    try {
      db.run(
        "UPDATE User SET Firstname_user = ?, Lastname_user = ?, Birthday_user = ?, Email_user = ?, Phonenumber_user = ?, Icon_user = ?, password = ?, Grade_user = ?, Status_user = ?,Url_image = ? WHERE Id_user = ?",
        [
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
          UserId,
        ],
        function (err) {
          if (err) {
            callback(err);
            return;
          }
          if (this.changes === 0) {
            callback(null, null); // User not found or not updated
            return;
          }
          const updatedUser = new User(
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
            url
          );
          callback(null, updatedUser);
        }
      );
      
    } catch (err) {
      
      console.error("Error update User", err);
      callback(err, null);
    }
  }

  static updateUserByUsername(
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
    callback
  ) {
    
    try {
      console.log("test" + username);

      db.run(
        "UPDATE User SET Firstname_user = ?, Lastname_user = ?, Birthday_user = ?, Email_user = ?, Phonenumber_user = ?, Icon_user = ?, password = ?, Grade_user = ?, Status_user = ?, Url_image = ? WHERE username = ?",
        [
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
          username,
        ],
        function (err) {
          if (err) {
            callback(err);
             // Close the database connection in case of an error
            return;
          }

          if (this.changes === 0) {
            const error = new Error("User not found or not updated");
            callback(error, null);
             // Close the database connection if no rows were updated
            return;
          }

          const id = this.lastID; // Use `this.lastID` to get the ID of the last inserted row
          console.log(`Row(s) updated: ${this.changes}` + "id : " + id);

          const updatedUser = new User(
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
            url
          );
          console.log(updatedUser);
          callback(null, updatedUser);

           // Close the database connection after the update
        }
      );
    } catch (err) {
      
      console.error("Error update UserBy Username : " + username, err);
      callback(err, null);
    }
  }
  static updateImageUserByUsername(username, icon, callback) {
    
    try {
      db.run(
        "UPDATE User SET  Url_image = ? WHERE username = ?",
        [icon, username],
        function (err) {
          if (err) {
            callback(err);
            return;
          }
          if (this.changes === 0) {
            const error = new Error("User not found or not updated");
            callback(error, null);
            return;
          }
          const updatedUser = new User(
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
            url
          );
          callback(null, updatedUser);
        }
      );
      
    } catch (err) {
      
      console.error("Error update Image User By Username : " + username, err);
      callback(err, null);
    }
  }

  static deleteUser(UserId, callback) {
    
    try {
      db.run("DELETE FROM User WHERE Id_user = ?", [UserId], function (err) {
        if (err) {
          callback(err);
          return;
        }
        if (this.changes === 0) {
          callback(null, false); // User not found or not deleted
          return;
        }
        callback(null, true); // User deleted successfully
      });
      
    } catch (err) {
      
      console.error("Error delete User id : " + UserId, err);
      callback(err, null);
    }
  }

  // ... (Other methods)

  // Add more methods as needed (e.g., update, delete, get all users)
}

module.exports = User;
