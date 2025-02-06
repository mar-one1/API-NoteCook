const express = require("express");
const router = express.Router();
const Recipe = require("../Model/Recipe"); // Import the Recipe model
const Fuse = require("fuse.js");
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const validateRecipe = require("../validators/validateRecipe");

const storage = multer.diskStorage({
  destination: "./public/data/uploads", // Destination directory
  filename: function (req, file, cb) {
    // Define a custom file name (you can modify this logic)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
  //const upload = multer({ storage: storage });
});
const upload = multer({ dest: "uploads/", storage: storage });

// Create a recipe
router.post("/", validateRecipe.validateCreateRecipe, async (req, res) => {
  const { name, icon, fav,unique_key, userId } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log(name);
  console.log(icon);
  console.log(fav);
  console.log(unique_key);

  Recipe.createRecipe(name, icon, fav, unique_key, userId, (err, newRecipe) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(newRecipe);
  });
});

router.delete("/delete/:path", (req, res) => {
  const pathimage = req.params.path;
  console.log("path for delete " + pathimage);
  Recipe.deleteimage(pathimage, (err, validite) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(validite);
  });
});

router.post("/upload/:id", upload.single("image"), async (req, res) => {
  const id = req.params.id;
  console.log(req.body);
  console.log(req.file);
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  // Process the uploaded file
  const fileName = req.file.filename;
  const imageUrl = encodeURIComponent(fileName);
  console.log(id);

  Recipe.UpdateRecipeImage(id, imageUrl, (err, validite) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // If the user doesn't exist, add them to the database
    res.status(201).json(validite);
  });
});

// Get a recipe by username
router.get("/user/full/:username", validateRecipe.validateGetByIdUser, (req, res) => {
  const username = req.params.username;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  Recipe.getAllFullRecipesByUsername(username, (err, recipes) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log("Fetched recipes for username:", username, recipes);

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ error: "No recipes found for this user" });
    }

    res.status(200).json(recipes);
  });
});



// Get a recipe by ID
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
      return res.status(406).json({ error: "Recipes not found" });
    }
    res.json(recipe);
  });
});

// POST route to insert a new recipe with details
router.post("/recipe", validateRecipe.validateCreateRecipe, async (req, res) => {
  const recipeData = req.body; // Assuming the request body contains the recipe data
  const { recipe, detailRecipe, ingredients, reviews, steps } = recipeData;
  const errors = validationResult(recipe);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  Recipe.insertRecipeWithDetails(recipeData, (err, recipeId) => {
    if (err) {
      console.error("Error inserting recipe:", err);
      return res.status(500).json({ error: "Error inserting recipe" });
    }
    console.log("Recipe inserted successfully with ID:", recipeId);
    res.status(201).json(recipeId);
  });
}
);

// Route to get recipes by conditions
router.get("/filters/recipes", (req, res) => {
  const conditions = req.query; // Get query parameters as conditions
  console.log(req.query);
  // Call the method to get recipes by conditions
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

// get User by id recipe
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

// get recipes by id User
router.get("/user/:username", validateRecipe.validateGetByUsernameRecipe, (req, res) => {
  const userId = req.params.username;
  console.log(userId);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  Recipe.getRecipesByUsernameUser(userId, (err, recipes) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!recipes || recipes.length === 0) {
      return res
        .status(406)
        .json({ error: "Recipes not found for this user" });
    }
    res.json(recipes);
  });
}
);

router.get("/search/nom", (req, res) => {
  const searchTerm = req.query.key;
  console.log("key : " + searchTerm);
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

router.put('/', (req, res) => {
  const recipeData = req.body;

  Recipe.updateRecipeWithDetails(recipeData, (err, recipeId) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update recipe' });
    }
    res.json(recipeId);
  });
});

router.delete('/delete/:path', (req, res) => {
  const pathimage = req.params.path;
  console.log('path for delete '+pathimage);
  Recipe.deleteimage(pathimage,(err, validite) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(validite);
  });
});


// DELETE route to delete a recipe by ID
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
// Add more routes for updating, deleting, or other operations as needed

module.exports = router;
