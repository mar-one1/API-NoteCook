const { Pool } = require('pg');

class IngredientRecipe {
  constructor(id_ingredient_recipe, detail_recipe_id, name, quantity, unit) {
    this.id_ingredient_recipe = id_ingredient_recipe;
    this.detail_recipe_id = detail_recipe_id;
    this.name = name;
    this.quantity = quantity;
    this.unit = unit;
  }
  static pool = new Pool({
    connectionString: process.env.POSTGRES_URL_LOCAL, // Your PostgreSQL connection string
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });



  // Create a new ingredient recipe association
  static async create(detailRecipeId, name, quantity, unit) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO ingredientrecipes (detail_recipe_id, name, quantity, unit) VALUES ($1, $2, $3, $4) RETURNING *',
        [detailRecipeId, name, quantity, unit]
      );

      const row = result.rows[0];
      return new IngredientRecipe(row.id_ingredient_recipe, row.detail_recipe_id, row.name, row.quantity, row.unit);
    } catch (err) {
      console.error('Error creating ingredient recipe association:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  // Retrieve all ingredient recipe associations
  static async getAll() {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM ingredientrecipes');
      return result.rows.map(
        row => new IngredientRecipe(row.id_ingredient_recipe, row.detail_recipe_id, row.name, row.quantity, row.unit)
      );
    } catch (err) {
      console.error('Error fetching all ingredient recipe associations:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  // Retrieve all ingredient recipe associations for a recipe detail ID
  static async getByDetailRecipeId(detailRecipeId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM ingredientrecipes WHERE detail_recipe_id = $1',
        [detailRecipeId]
      );

      return result.rows.map(
        row => new IngredientRecipe(row.id_ingredient_recipe, row.detail_recipe_id, row.name, row.quantity, row.unit)
      );
    } catch (err) {
      console.error('Error fetching ingredient recipes by detail recipe ID:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  // Delete all ingredient recipe associations for a recipe detail ID
  static async deleteByDetailRecipeId(detailRecipeId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM ingredientrecipes WHERE detail_recipe_id = $1',
        [detailRecipeId]
      );

      return result.rowCount; // Returns the number of deleted rows
    } catch (err) {
      console.error('Error deleting ingredient recipes by detail recipe ID:', err);
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = IngredientRecipe;