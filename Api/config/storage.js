const multer = require('multer');

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// Configure multer for memory storage
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

module.exports = upload;
