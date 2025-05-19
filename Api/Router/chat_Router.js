const express = require('express');
const router = express.Router();
const messageModel = require('../Model/chat');
const { users } = require('../handlers/socketHandler');

// Endpoint to get all messages
router.get('/messages', (req, res) => {
    messageModel.getAllMessages((err, messages) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching messages' });
        }
        res.json(messages);
    });
});
// Endpoint to get messages by recipe id
/*router.get('/messages/:recipeId', (req, res) => {
    const id = req.params.recipeId;
    console.log(id);
    messageModel.getMessagesByRecipe(id, (err, messages) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching messages' });
        }
        res.json(messages);
    });
});*/
// Endpoint to save a new message
router.post('/messages', (req, res) => {
    const data = req.body;
    if (!data) {
        return res.status(400).json({ error: 'Message text is required' });
    }
    messageModel.saveMessage(data, (err, message) => {
        if (err) {
            return res.status(500).json({ error: 'Error saving message' });
        }
        res.json(message);
    });
});
// Endpoint to get messages by recipe id
router.get('/messages/:recipeId', async (req, res) => {
    const recipeId = req.params.recipeId;
    const userId = parseInt(req.query.userId); // <-- المتلقي

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    messageModel.getMessagesByRecipe(recipeId, async (err, messages) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching messages' });
        }

        // Update unread messages to "read"
        const unreadMessages = messages.filter(
            (msg) => msg.receiverId === userId && msg.status !== 'read'
        );

        for (const msg of unreadMessages) {
            try {
                await messageModel.updateMessageStatusAsync(msg.id, 'read', new Date().toISOString());
            } catch (updateErr) {
                console.error('Error marking message as read:', updateErr);
            }
        }

        res.json(messages);
    });
});
// Endpoint to update message status (including rejection)
router.put('/messages/:messageId/status', (req, res) => {
    const { messageId } = req.params;
    const { status, reason } = req.body;
    
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    if (status === 'rejected' && !reason) {
        return res.status(400).json({ error: 'Reason is required for message rejection' });
    }

    const validStatuses = ['sent', 'delivered', 'read', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    messageModel.updateMessageStatus(messageId, status, (err, message) => {
        if (err) {
            console.error('Error updating message status:', err);
            return res.status(500).json({ error: 'Error updating message status' });
        }

        // If message is rejected, notify the sender through WebSocket
        if (status === 'rejected' && message) {
            const senderSocketId = users[message.senderId];
            if (senderSocketId) {
                req.app.get('io').to(senderSocketId).emit('message status', {
                    messageId: message.id,
                    status: 'rejected',
                    timestamp: new Date(),
                    reason: reason
                });
            }
        }

        res.json(message);
    });
});

router.delete('/message/:id', async (req, res) => {
  const messageId = parseInt(req.params.id);
 // مثال: تمنع حذف رسالة من غير المرسل
      const message = await messageModel.getMessageById(messageId);
      if (message.senderId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to delete this message' });
      }
  try {
    const deletedMessage = await messageModel.deleteMessage(messageId);
    res.status(200).json({
      message: 'Message deleted successfully',
      data: deletedMessage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
