const db = require("../../database");

class chat {
  constructor(id, recipeId, senderId, receiverId, message, timestamp) {
    this.id = id;
    this.recipeId = recipeId;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.message = message;
    this.timestamp = timestamp;
  }

  // Function to fetch all messages from the database
  static getMessagesByRecipe(id, callback) {
    
    db.all(
      "SELECT * FROM messages where recipeId = ?  ORDER BY timestamp",
      [id],
      function (err, rows) {
        if (err) {
          
          callback(err);
          return;
        }
        const chats = rows.map((row) => {
          return new chat(
            row.id,
            row.recipeId,
            row.senderId,
            row.receiverId,
            row.message,
            row.timestamp
          );
        });
        callback(null, chats);
      }
    );
  }

  // Function to fetch all messages from the database
  static getAllMessages(callback) {
    
    db.all("SELECT * FROM messages ORDER BY timestamp", (err, rows) => {
      callback(err, rows);
    });
  }
  // Function to save a new message to the database
  static saveMessage(data, callback) {
    const { recipeId, senderId, receiverId, message } = data;
    console.log(data, recipeId, senderId);
    
    db.run(
      "INSERT INTO messages (recipeId, senderId, receiverId, message) VALUES (?, ?, ?, ?)",
      [recipeId, senderId, receiverId, message],
      function (err) {
        if (err) {
          console.error("Error saving message", err);
          callback(err, null);
        } else {
          // Retrieve the inserted message data
          const insertedMessage = new chat(
            this.lastID,
            recipeId,
            senderId,
            receiverId,
            message,
            new Date().toISOString() // Example: Current timestamp
          );
          callback(null, insertedMessage);
        }
      }
    );
  }
}
module.exports = chat;
