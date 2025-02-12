const express = require("express");
const router = express.Router();
const IngredientRecipe = require("../Model/Ingredient"); // Import the IngredientRecipe model

// Create an ingredient recipe
router.post("/", (req, res) => {
  const { ingredient, poidIngredient, unit, recipeId } = req.body;

  // Validate request data here if needed

  IngredientRecipe.createIngredientRecipe(
    ingredient,
    poidIngredient,
    unit,
    recipeId,
    (err, newIngredientRecipe) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(newIngredientRecipe);
    }
  );
});

// Get an ingredient recipe by ID
router.get("/:id", (req, res) => {
  const ingredientRecipeId = req.params.id;
  IngredientRecipe.getIngredientRecipeById(
    ingredientRecipeId,
    (err, ingredientRecipe) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!ingredientRecipe) {
        return res.status(406).json({ error: "Ingredient recipe not found" });
      }
      res.json(ingredientRecipe);
    }
  );
});

// Get all ingredient recipes
router.get("/", (req, res) => {
  IngredientRecipe.getAllIngredientRecipe((err, ingredientRecipes) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(ingredientRecipes);
  });
});

// Get ingredients by recipe ID
router.get("/recipe/:id", (req, res) => {
  const recipeId = req.params.id;
  IngredientRecipe.getIngredientsByRecipeId(recipeId, (err, ingredients) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!ingredients || ingredients.length === 0) {
      return res
        .status(406)
        .json({ error: "Ingredients not found for this recipe" });
    }
    res.json(ingredients);
  });
});

// Add more routes for updating, deleting, or other operations as needed

// Update an ingredient recipe by ID
router.put("/:id", (req, res) => {
  const ingredientId = req.params.id;
  const { ingredient, poidIngredient, recipeId } = req.body;

  // Validate request data here if needed

  IngredientRecipe.updateIngredientRecipe(
    ingredientId,
    ingredient,
    poidIngredient,
    recipeId,
    (err, updatedIngredientRecipe) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!updatedIngredientRecipe) {
        return res
          .status(406)
          .json({ error: "Ingredient recipe not found or not updated" });
      }
      res.json(updatedIngredientRecipe);
    }
  );
});

// Delete an ingredient recipe by ID
router.delete("/:id", (req, res) => {
  const ingredientId = req.params.id;

  IngredientRecipe.deleteIngredientRecipe(ingredientId, (err, deleted) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!deleted) {
      return res
        .status(406)
        .json({ error: "Ingredient recipe not found or not deleted" });
    }
    res.json({ message: "Ingredient recipe deleted successfully" });
  });
});

module.exports = router;
