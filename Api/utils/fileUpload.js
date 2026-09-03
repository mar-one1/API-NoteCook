const { Buffer } = require('buffer');

// Convert file buffer to Base64
const bufferToBase64 = (buffer) => {
  return Buffer.from(buffer).toString('base64');
};

// Generate a unique filename
const generateUniqueFilename = (originalname) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const extension = originalname.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
};

// Process uploaded file
const processUploadedFile = (file) => {
  const base64Data = bufferToBase64(file.buffer);
  const filename = generateUniqueFilename(file.originalname);
  return {
    filename,
    base64Data,
    mimetype: file.mimetype
  };
};

module.exports = {
  processUploadedFile
};
