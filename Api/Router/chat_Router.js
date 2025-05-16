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
router.get('/messages/:recipeId', (req, res) => {
    const id = req.params.recipeId;
    console.log(id);
    messageModel.getMessagesByRecipe(id, (err, messages) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching messages' });
        }
        res.json(messages);
    });
});
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

module.exports = router;
