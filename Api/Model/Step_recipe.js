const { Pool } = require('pg'); // Import PostgreSQL pool

class StepRecipe {
  constructor(id, description, image, time, recipeId) {
    this.id = id;
    this.description = description;
    this.image = image;
    this.time = time;
    this.recipeId = recipeId;
  }

  static pool = new Pool({
    connectionString: process.env.POSTGRES_URL_LOCAL, // Your PostgreSQL connection string
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Create a new step recipe
  static async createStepRecipe(description, image, time, recipeId, callback) {
    try {
      const client = await StepRecipe.pool.connect();
      const result = await client.query(
        'INSERT INTO steprecipes (description, image, time, recipe_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [description, image, time, recipeId]
      );

      const newStepRecipe = new StepRecipe(
        result.rows[0].id_step_recipe,
        result.rows[0].description,
        result.rows[0].image,
        result.rows[0].time,
        result.rows[0].recipe_id
      );

      callback(null, newStepRecipe);
      client.release();
    } catch (err) {
      console.error('Error creating step recipe:', err);
      callback(err, null);
    }
  }

  // Get all step recipes
  static async getAllStepRecipes(callback) {
    try {
      const client = await StepRecipe.pool.connect();
      const result = await client.query('SELECT * FROM steprecipes');
      const stepRecipes = result.rows.map((row) => {
        return new StepRecipe(
          row.id_step_recipe,
          row.description,
          row.image,
          row.time,
          row.recipe_id
        );
      });

      callback(null, stepRecipes);
      client.release();
    } catch (err) {
      console.error('Error getting all step recipes:', err);
      callback(err, null);
    }
  }

  // Get steps by recipe ID
  static async getStepsByRecipeId(recipeId, callback) {
    try {
      const client = await StepRecipe.pool.connect();
      const result = await client.query(
        'SELECT * FROM steprecipes WHERE recipe_id = $1',
        [recipeId]
      );

      const steps = result.rows.map((row) => {
        return new StepRecipe(
          row.id_step_recipe,
          row.description,
          row.image,
          row.time,
          row.recipe_id
        );
      });

      callback(null, steps);
      client.release();
    } catch (err) {
      console.error('Error getting steps by recipe ID:', err);
      callback(err, null);
    }
  }

  // Update a step recipe
  static async updateStepRecipe(stepId, description, image, time, recipeId, callback) {
    try {
      const client = await StepRecipe.pool.connect();
      const result = await client.query(
        'UPDATE steprecipes SET description = $1, image = $2, time = $3, recipe_id = $4 WHERE id_step_recipe = $5 RETURNING *',
        [description, image, time, recipeId, stepId]
      );

      if (result.rowCount === 0) {
        callback(null, null); // Step recipe not found or not updated
        client.release();
        return;
      }

      const updatedStepRecipe = new StepRecipe(
        result.rows[0].id_step_recipe,
        result.rows[0].description,
        result.rows[0].image,
        result.rows[0].time,
        result.rows[0].recipe_id
      );

      callback(null, updatedStepRecipe);
      client.release();
    } catch (err) {
      console.error('Error updating step recipe:', err);
      callback(err, null);
    }
  }

  // Delete a step recipe
  static async deleteStepRecipe(stepId, callback) {
    try {
      const client = await StepRecipe.pool.connect();
      const result = await client.query(
        'DELETE FROM steprecipes WHERE id_step_recipe = $1',
        [stepId]
      );

      if (result.rowCount === 0) {
        callback(null, false); // Step recipe not found or not deleted
        client.release();
        return;
      }

      callback(null, true); // Step recipe deleted successfully
      client.release();
    } catch (err) {
      console.error('Error deleting step recipe:', err);
      callback(err, null);
    }
  }
}

module.exports = StepRecipe;
