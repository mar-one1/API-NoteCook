const pool = require("../../data/database"); // Assuming you have a PostgreSQL connection pool setup

class Chat {
  constructor(id, recipeId, senderId, receiverId, message, timestamp) {
    this.id = id;
    this.recipeId = recipeId;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.message = message;
    this.timestamp = timestamp;
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
            row.timestamp
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

  // Save a new message to the database
  static async saveMessage(data, callback) {
    const { recipeId, senderId, receiverId, message } = data;

    try {
      const result = await pool.query(
        `INSERT INTO "messages" ("recipeId", "senderId", "receiverId", "message") 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [recipeId, senderId, receiverId, message]
      );

      const insertedMessage = result.rows[0];
      callback(
        null,
        new Chat(
          insertedMessage.id,
          insertedMessage.recipeId,
          insertedMessage.senderId,
          insertedMessage.receiverId,
          insertedMessage.message,
          insertedMessage.timestamp
        )
      );
    } catch (err) {
      callback(err, null);
    }
  }
}

module.exports = Chat;
