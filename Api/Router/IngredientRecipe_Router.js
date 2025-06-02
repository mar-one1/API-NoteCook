const express = require('express');
const router = express.Router();
const pool = require('../../data/database');
const IngredientRecipe = require('../Model/IngredientRecipe');

// Create a new ingredient_recipe entry
// Expects JSON body: { recipeId: number, listIngredients: number[] }
router.post('/', async (req, res) => {
  try {
    const { recipeId, listIngredients } = req.body;
    if (!recipeId || !Array.isArray(listIngredients)) {
      return res.status(400).json({ error: 'recipeId and listIngredients are required and listIngredients must be an array.' });
    }
    const newEntry = await IngredientRecipe.create(recipeId, listIngredients);
    res.status(201).json(newEntry);
  } catch (err) {
    console.error('Error creating ingredient_recipe:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get all ingredient_recipe entries (with full ingredient details)
router.get('/', async (req, res) => {
  try {
    const entries = await IngredientRecipe.getAll();
    // For each entry, fetch full ingredient details
    const results = await Promise.all(entries.map(async entry => {
      const ids = entry.listIngredients;
      const ingRes = await pool.query(
        `SELECT * FROM "ingredients" WHERE id = ANY($1)`,
        [ids]
      );
      return {
        recipeId: entry.recipeId,
        ingredients: ingRes.rows // full details of ingredients
      };
    }));
    res.json(results);
  } catch (err) {
    console.error('Error fetching ingredient_recipes:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get a specific ingredient_recipe by recipeId (with full ingredient details)
router.get('/:recipeId', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.recipeId, 10);
    if (isNaN(recipeId)) {
      return res.status(400).json({ error: 'Invalid recipeId parameter.' });
    }
    const entry = await IngredientRecipe.getByRecipeId(recipeId);
    if (!entry) {
      return res.status(404).json({ error: 'IngredientRecipe not found for the given recipeId.' });
    }
    const ids = entry.listIngredients;
    const ingRes = await pool.query(
      `SELECT * FROM "ingredients" WHERE id = ANY($1)`,
      [ids]
    );
    res.json({ recipeId: entry.recipeId, ingredients: ingRes.rows });
  } catch (err) {
    console.error('Error fetching ingredient_recipe by recipeId:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update list_ingredients for a given recipeId
// Expects JSON body: { listIngredients: number[] }
router.put('/:recipeId', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.recipeId, 10);
    const { listIngredients } = req.body;
    if (isNaN(recipeId) || !Array.isArray(listIngredients)) {
      return res.status(400).json({ error: 'Valid recipeId and listIngredients array are required.' });
    }
    const updated = await IngredientRecipe.updateList(recipeId, listIngredients);
    if (!updated) {
      return res.status(404).json({ error: 'IngredientRecipe not found for the given recipeId.' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Error updating ingredient_recipe:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Delete a specific ingredientId from the list_ingredients for a given recipeId
router.delete('/:recipeId/ingredient/:ingredientId', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.recipeId, 10);
    const ingredientId = parseInt(req.params.ingredientId, 10);
    if (isNaN(recipeId) || isNaN(ingredientId)) {
      return res.status(400).json({ error: 'Invalid recipeId or ingredientId parameter.' });
    }
    const result = await pool.query(
      `UPDATE ingredient_recipe
       SET list_ingredients = array_remove(list_ingredients, $1)
       WHERE "Frk_idRecipe" = $2
       RETURNING *`,
      [ingredientId, recipeId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'IngredientRecipe not found for the given recipeId.' });
    }
    const row = result.rows[0];
    const updatedEntry = new IngredientRecipe(row.id, row.Frk_idRecipe, row.list_ingredients);
    res.json(updatedEntry);
  } catch (err) {
    console.error('Error deleting ingredientId from list:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Delete entire ingredient_recipe entry for a given recipeId
router.delete('/:recipeId', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.recipeId, 10);
    if (isNaN(recipeId)) {
      return res.status(400).json({ error: 'Invalid recipeId parameter.' });
    }
    const result = await IngredientRecipe.deleteByRecipeId(recipeId);
    res.json(result);
  } catch (err) {
    console.error('Error deleting ingredient_recipe:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
