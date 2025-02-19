const pool  = require("../../data/database");

class IngredientRecipe {
  constructor(id_Ingeredient_recipe, Frk_idRecipe, Frk_idIngredient) {
    this.id_Ingeredient_recipe = id_Ingeredient_recipe;
    this.Frk_idRecipe = Frk_idRecipe;
    this.Frk_idIngredient = Frk_idIngredient;
  }

  // Create a new ingredient recipe association
  static async create(recipeId, ingredientId) {
    try {
      const res = await pool.query(
        'INSERT INTO "Ingredients" ("Frk_idRecipe", "Frk_idIngredient") VALUES ($1, $2) RETURNING *',
        [recipeId, ingredientId]
      );
      return new IngredientRecipe(res.rows[0].id_Ingeredient_recipe, recipeId, ingredientId);
    } catch (err) {
      throw err;
    }
  }

  // Retrieve all ingredient recipe associations
  static async getAll() {
    try {
      const res = await pool.query('SELECT * FROM "Ingredients"');
      return res.rows.map(row => new IngredientRecipe(row.id_Ingeredient_recipe, row.Frk_idRecipe, row.Frk_idIngredient));
    } catch (err) {
      throw err;
    }
  }

  // Retrieve all ingredient recipe associations for a recipe
  static async getByRecipeId(recipeId) {
    try {
      const res = await pool.query('SELECT * FROM "Ingredients" WHERE "Frk_idRecipe" = $1', [recipeId]);
      return res.rows.map(row => new IngredientRecipe(row.id_Ingeredient_recipe, row.Frk_idRecipe, row.Frk_idIngredient));
    } catch (err) {
      throw err;
    }
  }

  // Retrieve all ingredient recipe associations for a specific ingredient ID
  static async getByIngredientId(ingredientId) {
    try {
      const res = await pool.query('SELECT * FROM "Ingredients" WHERE "Frk_idIngredient" = $1', [ingredientId]);
      return res.rows.map(row => new IngredientRecipe(row.id_Ingeredient_recipe, row.Frk_idRecipe, row.Frk_idIngredient));
    } catch (err) {
      throw err;
    }
  }

  // Delete all ingredient recipe associations for a recipe
  static async deleteByRecipeId(recipeId) {
    try {
      await pool.query('DELETE FROM "Ingredients" WHERE "Frk_idRecipe" = $1', [recipeId]);
      return { message: "Deleted successfully" };
    } catch (err) {
      throw err;
    }
  }
}

module.exports = IngredientRecipe;
