const express = require("express");
const router = express.Router();
const Recipe = require("../Model/Recipe");
const Fuse = require("fuse.js");
const { body, validationResult } = require("express-validator");
const validateRecipe = require("../validators/validateRecipe");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Create a recipe
router.post("/", validateRecipe.validateCreateRecipe, async (req, res) => {
  const { name, icon, fav, unique_key, userId } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  Recipe.createRecipe(name, icon, fav, unique_key, userId, (err, newRecipe) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(newRecipe);
  });
});

// Upload image to a recipe (uses memoryStorage)
router.post("/upload/:id", upload.single("image"), async (req, res) => {
  const id = req.params.id;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    const { buffer: imageBuffer, originalname, mimetype } = req.file;

    Recipe.updateRecipeImage(id, imageBuffer, originalname, mimetype, (err, updatedRecipe) => {
      if (err) {
        return res.status(500).json({ error: "Failed to update recipe image." });
      }
      if (!updatedRecipe) {
        return res.status(404).json({ error: "Recipe not found or update failed." });
      }
      res.status(200).json(updatedRecipe);
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete image by path
router.delete("/delete/:path", (req, res) => {
  const pathimage = req.params.path;
  Recipe.deleteimage(pathimage, (err, validite) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(validite);
  });
});

// Get full recipes by username
router.get("/user/full/:username", validateRecipe.validateGetByIdUser, (req, res) => {
  const username = req.params.username;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  Recipe.getAllFullRecipesByUsername(username, (err, recipes) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ error: "No recipes found for this user" });
    }
    res.status(200).json(recipes);
  });
});

// Get recipe by ID
router.get("/:id", validateRecipe.validateGetByIdRecipe, (req, res) => {
  const recipeId = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  Recipe.getFullRecipeById(recipeId, (err, recipe) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!recipe) {
      return res.status(406).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  });
});

// Insert a full recipe with details
router.post("/recipe", validateRecipe.validateCreateRecipe, async (req, res) => {
  const recipeData = req.body;
  const errors = validationResult(recipeData.recipe);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  Recipe.insertRecipeWithDetails(recipeData, (err, recipeId) => {
    if (err) {
      return res.status(500).json({ error: "Error inserting recipe" });
    }
    res.status(201).json(recipeId);
  });
});

// Get recipes with filters
router.get("/filters/recipes", (req, res) => {
  const conditions = req.query;

  Recipe.getRecipesByConditions(conditions, (err, recipes) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ error: "Recipes not found" });
    }
    res.json(recipes);
  });
});

// Get all recipes
router.get("/", (req, res) => {
  Recipe.getAllRecipes((err, recipes) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(recipes);
  });
});

// Get user by recipe ID
router.get("/:id/user", validateRecipe.validateGetByIdRecipe, (req, res) => {
  const recipeId = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  Recipe.getUserByRecipeId(recipeId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(406).json({ error: "User not found" });
    }
    res.json(user);
  });
});

// Get recipes by username
router.get("/user/:username", validateRecipe.validateGetByUsernameRecipe, (req, res) => {
  const userId = req.params.username;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  Recipe.getRecipesByUsernameUser(userId, (err, recipes) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!recipes || recipes.length === 0) {
      return res.status(406).json({ error: "Recipes not found for this user" });
    }
    res.json(recipes);
  });
});

// Search by name
router.get("/search/nom", (req, res) => {
  const searchTerm = req.query.key;
  Recipe.searchRecipes(searchTerm, (err, recipes) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!recipes || recipes.length === 0) {
      return res.status(406).json({ error: "Recipes not found !!!" });
    }
    res.json(recipes);
  });
});

// Update recipe with details
router.put("/", (req, res) => {
  const recipeData = req.body;

  Recipe.updateRecipeWithDetails(recipeData, (err, recipeId) => {
    if (err) {
      return res.status(500).json({ error: "Failed to update recipe" });
    }
    res.json(recipeId);
  });
});

// Delete recipe by ID
router.delete("/:id", validateRecipe.validateDeleteRecipe, (req, res) => {
  const recipeId = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  Recipe.deleteRecipe(recipeId, (err, deleted) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!deleted) {
      return res.status(406).json({ error: "Recipe not found or not deleted" });
    }
    res.json({ message: "Recipe deleted successfully" });
  });
});

module.exports = router;
