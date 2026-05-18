router.post(
  "/upload-video",
  upload.single("video"),
  async (req, res) => {
    try {

      const result = await uploadToCloudinary(
        req.file.buffer,
        "recipes/videos",
        "video"
      );

      res.json({
        success: true,
        video_url: result.secure_url,
        public_id: result.public_id,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);