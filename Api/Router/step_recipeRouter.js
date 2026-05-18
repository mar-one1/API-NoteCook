const express = require("express");
const router = express.Router();
const StepRecipe = require("../Model/Step_recipe"); // Import the StepRecipe model
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Create a step recipe
router.post("/", (req, res) => {
  const { detailStep, imageStep, timeStep, recipeId } = req.body;

  // Validate request data here if needed

  StepRecipe.createStepRecipe(
    detailStep,
    imageStep,
    timeStep,
    recipeId,
    (err, newStepRecipe) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(newStepRecipe);
    }
  );
});

// Get All steps
router.get("/", (req, res) => {
  StepRecipe.getAllStepRecipes((err, stepRecipes) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(stepRecipes);
  });
});

// Get steps by recipe ID
router.get("/recipe/:id", (req, res) => {
  const recipeId = req.params.id;
  StepRecipe.getStepsByRecipeId(recipeId, (err, steps) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!steps || steps.length === 0) {
      return res.status(406).json({ error: "Steps not found for this recipe" });
    }
    res.json(steps);
  });
});

// Add more routes for updating, deleting, or other operations as needed

// Update a step recipe by ID
router.put("/:id", (req, res) => {
  const stepId = req.params.id;
  const { detailStep, imageStep, timeStep, recipeId } = req.body;

  // Validate request data here if needed

  StepRecipe.updateStepRecipe(
    stepId,
    detailStep,
    imageStep,
    timeStep,
    recipeId,
    (err, updatedStepRecipe) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!updatedStepRecipe) {
        return res
          .status(406)
          .json({ error: "Step recipe not found or not updated" });
      }
      res.json(updatedStepRecipe);
    }
  );
});

// Delete a step recipe by ID
router.delete("/:id", (req, res) => {
  const stepId = req.params.id;

  StepRecipe.deleteStepRecipe(stepId, (err, deleted) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!deleted) {
      return res
        .status(406)
        .json({ error: "Step recipe not found or not deleted" });
    }
    res.json({ message: "Step recipe deleted successfully" });
  });
});

const { processUploadedFile } = require('../utils/fileUpload');
/*
router.post("/upload/:id", upload.single("image"), async (req, res) => {
  const id = req.params.id;
  console.log(req.body);
  
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    // Process the uploaded file and get base64 data
    const { filename, base64Data } = processUploadedFile(req.file);
    const imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    // Call the method to update recipe image
    await StepRecipe.updateStepImage(id, imageUrl, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(result);
    });
  } catch (err) {
    console.error('Error processing upload:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
*/

// New route to upload step image and update DB together with Cloudinary handling
router.post("/upload/:id", upload.single("image"), async (req, res) => {

  const stepId = req.params.id;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  try {

    // 1. Upload directly to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      "recipes/steps/images",
      "image"
    );

    // 2. Save in DB (NO CALLBACK)
    const updatedStep = await StepRecipe.updateStepImage(
      stepId,
      result.secure_url,
      result.public_id
    );

    // 3. Response
    res.status(200).json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      data: updatedStep,
    });

  } catch (err) {

    console.error("Step image upload error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

router.post("/upload-video/:id", upload.single("video"), async (req, res) => {

  const stepId = req.params.id;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No video uploaded",
    });
  }

  try {

    // 1. Upload to Cloudinary (VIDEO mode)
    const result = await uploadToCloudinary(
      req.file.buffer,
      "recipes/steps/videos",
      "video" // 🔥 IMPORTANT
    );

    // 2. Save in DB
    const updatedStep = await StepRecipe.updateStepVideo(
      stepId,
      result.secure_url,
      result.public_id
    );

    res.status(200).json({
      success: true,
      videoUrl: result.secure_url,
      publicId: result.public_id,
      data: updatedStep,
    });

  } catch (err) {
    console.error("Video upload error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
