const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

router.post(
  "/upload-image",
  upload.single("image"),
  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        "recipes/images",
        "image"
      );

      res.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

module.exports = router;