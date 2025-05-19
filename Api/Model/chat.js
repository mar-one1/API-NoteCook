const pool = require("../../data/database"); // Assuming you have a PostgreSQL connection pool setup

class Chat {
  constructor(id, recipeId, senderId, receiverId, message, timestamp, status = 'sent', readAt = null) {
    this.id = id;
    this.recipeId = recipeId;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.message = message;
    this.timestamp = timestamp;
    this.status = status;
    this.readAt = readAt;
  }

  // Fetch all messages for a specific recipe
  static async getMessagesByRecipe(recipeId, callback) {
    try {
      const result = await pool.query(
        `SELECT * FROM "messages" WHERE "recipeId" = $1 ORDER BY "timestamp"`,
        [recipeId]
      );
      const chats = result.rows.map(
        (row) =>
          new Chat(
            row.id,
            row.recipeId,
            row.senderId,
            row.receiverId,
            row.message,
            row.timestamp,
            row.status,
            row.readAt
          )
      );
      callback(null, chats);
    } catch (err) {
      callback(err, null);
    }
  }

  // Fetch all messages in the database
  static async getAllMessages(callback) {
    try {
      const result = await pool.query(`SELECT * FROM "messages" ORDER BY "timestamp"`);
      callback(null, result.rows);
    } catch (err) {
      callback(err, null);
    }
  }

  // Update message status and readAt using async/await
  static async updateMessageStatusAsync(messageId, status, readAt = null) {
    try {
      const result = await pool.query(
        `UPDATE "messages" SET "status" = $1, "readAt" = $2 WHERE "id" = $3 RETURNING *`,
        [status, readAt, messageId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error updating message status:', err);
      throw err;
    }
  }

  // Update message status using callback
  static async updateMessageStatus(messageId, status, callback) {
    try {
      const result = await pool.query(
        `UPDATE "messages" SET "status" = $1 WHERE "id" = $2 RETURNING *`,
        [status, messageId]
      );
      callback(null, result.rows[0]);
    } catch (err) {
      callback(err, null);
    }
  }

  // Save a new message to the database
  static async saveMessage(data, callback) {
    const { recipeId, senderId, receiverId, message } = data;
    try {
      const result = await pool.query(
        `INSERT INTO messages ("recipeId", "senderId", "receiverId", "message", "timestamp", "readAt")
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [recipeId, senderId, receiverId, message, new Date().toISOString(), null]
      );
      callback(null, result.rows[0]);
    } catch (err) {
      console.error('❌ Error in saveMessage:', err); // This will help you debug
      callback(err);
    }
  }
}

module.exports = Chat;
