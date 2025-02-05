const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const saltRounds = 10;



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

  static pool = new Pool({
    connectionString: process.env.POSTGRES_URL_LOCAL, // Your PostgreSQL connection string
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  /**
   * Create a new user
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
    url
  ) {
    const client = await this.pool.connect();
    try {
      // Check if the user already exists
      const userExists = await client.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );

      if (userExists.rows.length > 0) {
        throw new Error("User already exists");
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert the user
      const result = await client.query(
        `INSERT INTO users (username, firstname, lastname, birthday, email, phone_number, icon, password, grade, status, url_image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
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
        ]
      );

      return result.rows[0]; // Return the created user
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id) {
    const client = await this.pool.connect();
    try {
      const result = await client.query("SELECT * FROM users WHERE id_user = $1", [id]);

      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(username) {
    const client = await this.pool.connect();
    try {
      const result = await client.query("SELECT * FROM users WHERE username = $1", [username]);

      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update user
   */
  static async updateUser(id, fields) {
    const client = await this.pool.connect();
    try {
      const setClause = Object.keys(fields)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(", ");

      const values = Object.values(fields);
      values.unshift(id);

      const query = `UPDATE users SET ${setClause} WHERE id_user = $1 RETURNING *`;
      const result = await client.query(query, values);

      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update user image by username
   */
  static async updateUserImage(username, imageUrl) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        "UPDATE users SET url_image = $1 WHERE username = $2 RETURNING *",
        [imageUrl, username]
      );

      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id) {
    const client = await this.pool.connect();
    try {
      const result = await client.query("DELETE FROM users WHERE id_user = $1 RETURNING *", [id]);

      if (result.rows.length === 0) return false;
      return true;
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Get all users
   */
  static async getAllUsers() {
    const client = await this.pool.connect();
    try {
      const result = await client.query("SELECT * FROM users");
      return result.rows;
    } catch (err) {
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = User;
