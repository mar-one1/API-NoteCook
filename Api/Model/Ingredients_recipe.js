const pool  = require("../../data/database");

class IngredientRecipe {
  constructor(id_ingredient_recipe, name, quantity, unit, frk_detail_recipe) {
    this.id_ingredient_recipe = id_ingredient_recipe;
    this.name = name;
    this.quantity = quantity;
    this.unit = unit;
    this.frk_detail_recipe = frk_detail_recipe;
  }

  // Create a new ingredient recipe association
  static async create(detailRecipeId, name, quantity, unit) {
    
    try {
      const result = await pool.query(
        'INSERT INTO "IngredientRecipe" ("Id_ingredient_recipe", "Ingredient_recipe", "PoidIgredient_recipe", "unit", "FRK_detail_recipe") VALUES ($1, $2, $3, $4) RETURNING *',
        [detailRecipeId, name, quantity, unit, frk_detail_recipe]
      );

      const row = result.rows[0];
      return new IngredientRecipe(row.id_ingredient_recipe, row.name, row.quantity, row.unit , row.frk_detail_recipe);
    } catch (err) {
      console.error('Error creating ingredient recipe association:', err);
      throw err;
    }
  }

  // Retrieve all ingredient recipe associations
  static async getAll() {
    try {
      const result = await pool.query('SELECT * FROM "IngredientRecipe"');
      return result.rows.map(
        row => new IngredientRecipe(row.id_ingredient_recipe, row.name, row.quantity, row.unit, row.frk_detail_recipe)
      );
    } catch (err) {
      console.error('Error fetching all ingredient recipe associations:', err);
      throw err;
    }
  }

  // Retrieve all ingredient recipe associations for a recipe detail ID
  static async getByDetailRecipeId(detailRecipeId) {
    
    try {
      const result = await pool.query(
        'SELECT * FROM "IngredientRecipe" WHERE "FRK_detail_recipe" = $1',
        [detailRecipeId]
      );

      return result.rows.map(
        row => new IngredientRecipe(row.id_ingredient_recipe, row.name, row.quantity, row.unit, row.frk_detail_recipe)
      );
    } catch (err) {
      console.error('Error fetching ingredient recipes by detail recipe ID:', err);
      throw err;
    }
  }

  // Delete all ingredient recipe associations for a recipe detail ID
  static async deleteByDetailRecipeId(detailRecipeId) {
    
    try {
      const result = await pool.query(
        'DELETE FROM "IngredientRecipe" WHERE "FRK_detail_recipe" = $1',
        [detailRecipeId]
      );

      return result.rowCount; // Returns the number of deleted rows
    } catch (err) {
      console.error('Error deleting ingredient recipes by detail recipe ID:', err);
      throw err;
    }
  }
}

module.exports = IngredientRecipe;