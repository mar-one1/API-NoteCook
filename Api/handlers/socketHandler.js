const messageModel = require('../Model/chat');

// Initialize the users object to store socket connections
const users = {};

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(socket.id + ': user connected');

    // Handle user registration with user ID
    socket.on('register', (userId) => {
      users[userId] = socket.id;
      console.log(`User ${userId} registered with socket ID ${socket.id}`);
      // Broadcast user online status
      io.emit('user status', { userId, status: 'online' });
    });

    // Handle typing status
    socket.on('typing', (data) => {
      const receiverSocketId = users[data.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user typing', {
          senderId: data.senderId,
          recipeId: data.recipeId
        });
      }
    });

    // Handle stop typing status
    socket.on('stop typing', (data) => {
      const receiverSocketId = users[data.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user stop typing', {
          senderId: data.senderId,
          recipeId: data.recipeId
        });
      }
    });

    // Handle chat message event
    socket.on('chat message', (data) => {
      console.log('Received message:', data);

      // Save message to the PostgreSQL database
      messageModel.saveMessage(data, (err, savedMessage) => {
        if (err) {
          console.error('Error saving message', err);
          // Notify sender about the error
          socket.emit('message status', {
            messageId: data.messageId,
            status: 'failed',
            error: 'Failed to save message'
          });
        } else {
          console.log('Message saved:', savedMessage);

          // Send delivery confirmation to sender
          socket.emit('message status', {
            messageId: data.messageId,
            status: 'sent',
            timestamp: savedMessage.timestamp
          });

          // Emit message to the receiver if they are connected
          const receiverSocketId = users[data.receiverId];
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('chat message', {
              messageId: data.messageId,
              recipeId: data.recipeId,
              senderId: data.senderId,
              receiverId: data.receiverId,
              message: data.message,
              timestamp: savedMessage.timestamp,
            });
          } else {
            console.log(`User ${data.receiverId} is not connected`);
          }
        }
      });
    });

    // Handle message rejection
    socket.on('reject message', (data) => {
      const senderSocketId = users[data.senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit('message status', {
          messageId: data.messageId,
          status: 'rejected',
          timestamp: new Date(),
          reason: data.reason || 'Message rejected by recipient'
        });
      }
    });

    // Handle message read status
    socket.on('message read', async (data) => {
      try {
        const updatedMessage = await messageModel.markMessageAsRead(data.messageId);

        const senderSocketId = users[data.senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit('message status', {
            messageId: data.messageId,
            status: 'read',
            readAt: updatedMessage.readAt
          });
        }
      } catch (err) {
        console.error('❌ Error handling message read:', err);
      }
    });


    // Handle disconnect event
    socket.on('disconnect', () => {
      console.log('A user disconnected');
      // Remove user from the users object and broadcast offline status
      for (const userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
          io.emit('user status', { userId, status: 'offline' });
          console.log(`User ${userId} removed from users object`);
          break;
        }
      }
    });
  });



  // Schedule periodic cleanup of expired messages
  setInterval(async () => {
    try {
      await messageModel.deleteExpiredMessages();
      console.log('Expired messages cleanup completed');
    } catch (err) {
      console.error('Error during message cleanup:', err);
    }
  }, 3600000); // Run cleanup every hour
};

module.exports = {
  setupSocketHandlers,
  users // Export users object for potential external use
};