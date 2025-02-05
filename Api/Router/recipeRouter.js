const express = require("express");
const router = express.Router();
const Recipe = require("../Model/Recipe"); // Import the Recipe model
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const validateRecipe = require("../validators/validateRecipe");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Image upload storage configuration with file type validation
const storage = multer.diskStorage({
  destination: "./public/data/uploads", // Destination directory
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Create a recipe
router.post("/", validateRecipe.validateCreateRecipe, async (req, res) => {
  const { name, icon, fav, unique_key, userId } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newRecipe = await Recipe.createRecipe(name, icon, fav, unique_key, userId);
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload an image for a recipe
router.post("/upload/:id", upload.single("image"), async (req, res) => {
  const id = req.params.id;
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const imageUrl = encodeURIComponent(req.file.filename);

  try {
    const updatedRecipe = await Recipe.updateRecipeImage(id, imageUrl);
    res.status(201).json(updatedRecipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a recipe by ID
router.get("/:id", validateRecipe.validateGetByIdRecipe, async (req, res) => {
  const recipeId = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const recipe = await Recipe.getFullRecipeById(recipeId);
    if (!recipe) {
      return res.status(406).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Insert a recipe with details
router.post("/recipe", validateRecipe.validateCreateRecipe, async (req, res) => {
  const recipeData = req.body;
  const { recipe, detailRecipe, ingredients, reviews, steps } = recipeData;
  const errors = validationResult(recipe);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const recipeId = await Recipe.insertRecipeWithDetails(recipeData);
    res.status(201).json(recipeId);
  } catch (err) {
    console.error("Error inserting recipe:", err);
    res.status(500).json({ error: "Error inserting recipe" });
  }
});

// Get recipes by conditions
router.get("/filters/recipes", async (req, res) => {
  const conditions = req.query;

  try {
    const recipes = await Recipe.getRecipesByConditions(conditions);
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ error: "Recipes not found" });
    }
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.getAllRecipes();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by recipe ID
router.get("/:id/user", validateRecipe.validateGetByIdRecipe, async (req, res) => {
  const recipeId = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await Recipe.getUserByRecipeId(recipeId);
    if (!user) {
      return res.status(406).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recipes by user
router.get("/user/:username", validateRecipe.validateGetByUsernameRecipe, async (req, res) => {
  const username = req.params.username;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const recipes = await Recipe.getRecipesByUsernameUser(username);
    if (!recipes || recipes.length === 0) {
      return res.status(406).json({ error: "Recipes not found for this user" });
    }
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search for recipes by name
router.get("/search/nom", async (req, res) => {
  const searchTerm = req.query.key;

  try {
    const recipes = await Recipe.searchRecipes(searchTerm);
    if (!recipes || recipes.length === 0) {
      return res.status(406).json({ error: "Recipes not found" });
    }
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update recipe
router.put('/', async (req, res) => {
  const recipeData = req.body;

  try {
    const updatedRecipe = await Recipe.updateRecipeWithDetails(recipeData);
    res.json(updatedRecipe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// Delete a recipe by ID
router.delete("/:id", validateRecipe.validateDeleteRecipe, async (req, res) => {
  const recipeId = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const deleted = await Recipe.deleteRecipe(recipeId);
    if (!deleted) {
      return res.status(406).json({ error: "Recipe not found or not deleted" });
    }
    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an image
router.delete('/delete/:path', async (req, res) => {
  const pathimage = req.params.path;

  try {
    const deleted = await Recipe.deleteimage(pathimage);
    res.status(201).json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
