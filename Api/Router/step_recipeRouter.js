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

module.exports = router;
