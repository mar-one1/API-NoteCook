const { Pool } = require('pg'); // Import PostgreSQL pool

class User {
  constructor(id, username, firstname, lastname, birthday, email, phoneNumber, icon, password, grade, status) {
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
  }

  static pool = new Pool({
    connectionString: process.env.POSTGRES_URL_LOCAL, // Your PostgreSQL connection string
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Create a new user
  static async createUser(username, firstname, lastname, birthday, email, phoneNumber, icon, password, grade, status, callback) {
    try {
      const client = await User.pool.connect();
      const result = await client.query(
        'INSERT INTO users (username, firstname, lastname, birthday, email, phone_number, icon, password, grade, status) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [username, firstname, lastname, birthday, email, phoneNumber, icon, password, grade, status]
      );

      const newUser = new User(
        result.rows[0].id_user,
        result.rows[0].username,
        result.rows[0].firstname,
        result.rows[0].lastname,
        result.rows[0].birthday,
        result.rows[0].email,
        result.rows[0].phone_number,
        result.rows[0].icon,
        result.rows[0].password,
        result.rows[0].grade,
        result.rows[0].status
      );

      callback(null, newUser);
      client.release();
    } catch (err) {
      console.error('Error creating user:', err);
      callback(err, null);
    }
  }

  // Get a user by ID
  static async getUserById(userId, callback) {
    try {
      const client = await User.pool.connect();
      const result = await client.query(
        'SELECT * FROM users WHERE id_user = $1',
        [userId]
      );

      if (result.rowCount === 0) {
        callback(null, null); // User not found
        client.release();
        return;
      }

      const user = new User(
        result.rows[0].id_user,
        result.rows[0].username,
        result.rows[0].firstname,
        result.rows[0].lastname,
        result.rows[0].birthday,
        result.rows[0].email,
        result.rows[0].phone_number,
        result.rows[0].icon,
        result.rows[0].password,
        result.rows[0].grade,
        result.rows[0].status
      );

      callback(null, user);
      client.release();
    } catch (err) {
      console.error('Error getting user by ID:', err);
      callback(err, null);
    }
  }

  // Get all users
  static async getAllUsers(callback) {
    try {
      const client = await User.pool.connect();
      const result = await client.query('SELECT * FROM users');
      const users = result.rows.map((row) => {
        return new User(
          row.id_user,
          row.username,
          row.firstname,
          row.lastname,
          row.birthday,
          row.email,
          row.phone_number,
          row.icon,
          row.password,
          row.grade,
          row.status
        );
      });

      callback(null, users);
      client.release();
    } catch (err) {
      console.error('Error getting all users:', err);
      callback(err, null);
    }
  }

  // Update a user's information
  static async updateUser(userId, username, firstname, lastname, birthday, email, phoneNumber, icon, password, grade, status, callback) {
    try {
      const client = await User.pool.connect();
      const result = await client.query(
        'UPDATE users SET username = $1, firstname = $2, lastname = $3, birthday = $4, email = $5, phone_number = $6, ' +
        'icon = $7, password = $8, grade = $9, status = $10 WHERE id_user = $11 RETURNING *',
        [username, firstname, lastname, birthday, email, phoneNumber, icon, password, grade, status, userId]
      );

      if (result.rowCount === 0) {
        callback(null, null); // User not found or not updated
        client.release();
        return;
      }

      const updatedUser = new User(
        result.rows[0].id_user,
        result.rows[0].username,
        result.rows[0].firstname,
        result.rows[0].lastname,
        result.rows[0].birthday,
        result.rows[0].email,
        result.rows[0].phone_number,
        result.rows[0].icon,
        result.rows[0].password,
        result.rows[0].grade,
        result.rows[0].status
      );

      callback(null, updatedUser);
      client.release();
    } catch (err) {
      console.error('Error updating user:', err);
      callback(err, null);
    }
  }

  // Delete a user
  static async deleteUser(userId, callback) {
    try {
      const client = await User.pool.connect();
      const result = await client.query(
        'DELETE FROM users WHERE id_user = $1',
        [userId]
      );

      if (result.rowCount === 0) {
        callback(null, false); // User not found or not deleted
        client.release();
        return;
      }

      callback(null, true); // User deleted successfully
      client.release();
    } catch (err) {
      console.error('Error deleting user:', err);
      callback(err, null);
    }
  }
}

module.exports = User;
