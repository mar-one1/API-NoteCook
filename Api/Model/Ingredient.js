const pool  = require("../../data/database");

class IngredientRecipe {
  constructor(id, ingredients, poidingredient, unite, recipeId) {
    this.id = id;
    this.ingredients = ingredients;
    this.poidingredient = poidingredient;
    this.unite = unite;
    this.recipeId = recipeId;
  }

  // Create a new ingredient recipe
  static async createIngredientRecipe(ingredient, poidIngredient, unite, recipeId, callback) {
   
    try {
      const result = await pool.query(
        'INSERT INTO "IngredientRecipe" ("Id_ingredient_recipe", "Ingredient_recipe", "PoidIngredient_recipe", "unit", "FRK_detail_recipe") VALUES ($1, $2, $3, $4) RETURNING *',
        [ingredient, poidIngredient, unite, recipeId]
      );

      const row = result.rows[0];
      const newIngredientRecipe = new IngredientRecipe(
        row.Id_ingredient_recipe,
        row.Ingredient_recipe,
        row.PoidIngredient_recipe,
        row.unit,
        row.FRK_detail_recipe
      );
      callback(null, newIngredientRecipe);
    } catch (err) {
      console.error('Error creating ingredient recipe:', err);
      callback(err, null);
    } 
  }

  // Retrieve all ingredient recipes
  static async getAllIngredientRecipe(callback) {
   
    try {
      const result = await pool.query('SELECT * FROM "IngredientRecipe"');
      const ingredientRecipe = result.rows.map(row => new IngredientRecipe(
        row.Id_ingredient_recipe,
        row.Ingredient_recipe,
        row.PoidIngredient_recipe,
        row.unit,
        row.FRK_detail_recipe
      ));
      callback(null, ingredientRecipe);
    } catch (err) {
      console.error('Error fetching all ingredient recipes:', err);
      callback(err, null);
    }
  }

  // Retrieve ingredient recipe by ID
  static async getIngredientRecipeById(ingredientId, callback) {
   
    try {
      const result = await pool.query(
        'SELECT * FROM "IngredientRecipe" WHERE "Id_ingredient_recipe" = $1',
        [ingredientId]
      );
      if (result.rows.length === 0) {
        return callback(null, null); // Ingredient recipe not found
      }
      const row = result.rows[0];
      const ingredientRecipe = new IngredientRecipe(
        row.Id_ingredient_recipe,
        row.Ingredient_recipe,
        row.PoidIngredient_recipe,
        row.unit,
        row.FRK_detail_recipe
      );
      callback(null, ingredientRecipe);
    } catch (err) {
      console.error('Error fetching ingredient recipe by ID:', err);
      callback(err, null);
    }
  }

  // Retrieve ingredient recipes by recipe ID
  static async getIngredientsByRecipeId(recipeId, callback) {
   
    try {
      const result = await pool.query(
        'SELECT * FROM "IngredientRecipe" WHERE "FRK_detail_recipe" = $1',
        [recipeId]
      );
      const ingredients = result.rows.map(row => new IngredientRecipe(
        row.Id_ingredient_recipe,
        row.Ingredient_recipe,
        row.PoidIngredient_recipe,
        row.unit,
        row.FRK_detail_recipe
      ));
      callback(null, ingredients);
    } catch (err) {
      console.error('Error fetching ingredient recipes by recipe ID:', err);
      callback(err, null);
    }
  }

  // Update ingredient recipe
  static async updateIngredientRecipe(ingredientId, ingredient, poidIngredient, unite, recipeId, callback) {
   
    try {
      const result = await pool.query(
        'UPDATE "IngredientRecipe" SET "Ingredient_recipe" = $1, "PoidIngredient_recipe" = $2, "unit" = $3, "FRK_detail_recipe" = $4 WHERE "Id_ingredient_recipe" = $5 RETURNING *',
        [ingredient, poidIngredient, unite, recipeId, ingredientId]
      );

      if (result.rows.length === 0) {
        callback(null, null); // Ingredient recipe not found or not updated
        return;
      }

      const row = result.rows[0];
      const updatedIngredientRecipe = new IngredientRecipe(
        row.Id_ingredient_recipe,
        row.Ingredient_recipe,
        row.PoidIngredient_recipe,
        row.unit,
        row.FRK_detail_recipe
      );
      callback(null, updatedIngredientRecipe);
    } catch (err) {
      console.error('Error updating ingredient recipe:', err);
      callback(err, null);
    }
  }

  // Delete ingredient recipe by ID
  static async deleteIngredientRecipe(ingredientId, callback) {
   
    try {
      const result = await pool.query(
        'DELETE FROM "IngredientRecipe" WHERE "Id_ingredient_recipe" = $1',
        [ingredientId]
      );
      if (result.rowCount === 0) {
        callback(null, false); // Ingredient recipe not found or not deleted
        return;
      }
      callback(null, true); // Ingredient recipe deleted successfully
    } catch (err) {
      console.error('Error deleting ingredient recipe:', err);
      callback(err, null);
    }
  }
}

module.exports = IngredientRecipe;
