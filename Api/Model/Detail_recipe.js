const pool = require('../../data/database'); // Assuming pool is set up for PostgreSQL
const RecipeModel = require('./Recipe'); // Import the Recipe model

class DetailRecipe {
  constructor(id, detail, time, rate, level, calories, recipeId) {
    this.id = id;
    this.detail = detail;
    this.time = time;
    this.rate = rate;
    this.level = level;
    this.calories = calories;
    this.recipeId = recipeId;
  }

  static async createDetailRecipe(detail, time, rate, level, calories, recipeId, callback) {
    try {
      const result = await pool.query(
        `INSERT INTO "DetailRecipe" ("Dt_recipe", "Dt_recipe_time", "Rate_recipe", "Level_recipe", "Calories_recipe", "FRK_recipe") 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [detail, time, rate, level, calories, recipeId]
      );

      const newDetailRecipe = result.rows[0];
      callback(null, new DetailRecipe(
        newDetailRecipe.Id_Detail_recipe,
        newDetailRecipe.Dt_recipe,
        newDetailRecipe.Dt_recipe_time,
        newDetailRecipe.Rate_recipe,
        newDetailRecipe.Level_recipe,
        newDetailRecipe.Calories_recipe,
        newDetailRecipe.FRK_recipe
      ));
    } catch (err) {
      callback(err);
    }
  }

  static async getAllDetailRecipes(callback) {
    try {
      const result = await pool.query('SELECT * FROM "DetailRecipe"');
      const detailRecipes = result.rows.map(row => new DetailRecipe(
        row.Id_Detail_recipe,
        row.Dt_recipe,
        row.Dt_recipe_time,
        row.Rate_recipe,
        row.Level_recipe,
        row.Calories_recipe,
        row.FRK_recipe
      ));
      callback(null, detailRecipes);
    } catch (err) {
      callback(err);
    }
  }

  static async getDetailRecipeById(id, callback) {
    try {
      const result = await pool.query(
        `SELECT * FROM "DetailRecipe" WHERE "Id_detail_recipe" = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        callback(null, null); // DetailRecipe not found
      } else {
        const row = result.rows[0];
        callback(null, new DetailRecipe(
          row.Id_Detail_recipe,
          row.Dt_recipe,
          row.Dt_recipe_time,
          row.Rate_recipe,
          row.Level_recipe,
          row.Calories_recipe,
          row.FRK_recipe
        ));
      }
    } catch (err) {
      callback(err, null);
    }
  }

  static async getDetailRecipeByfkRecipe(FK, callback) {
    try {
      const result = await pool.query(
        `SELECT * FROM "DetailRecipe" WHERE "FRK_recipe" = $1`,
        [FK]
      );

      if (result.rows.length === 0) {
        callback(null, null); // DetailRecipe not found
      } else {
        const row = result.rows[0];
        callback(null, new DetailRecipe(
          row.Id_Detail_recipe,
          row.Dt_recipe,
          row.Dt_recipe_time,
          row.Rate_recipe,
          row.Level_recipe,
          row.Calories_recipe,
          row.FRK_recipe
        ));
      }
    } catch (err) {
      callback(err, null);
    }
  }

  static async getRecipeByDetailrecipeId(detailRecipeId, callback) {
    try {
      const result = await pool.query(
        `SELECT "FRK_recipe" FROM "DetailRecipe" WHERE "Id_detail_recipe" = $1`,
        [detailRecipeId]
      );

      if (result.rows.length === 0) {
        callback(null, null); // Detail_Recipe not found
      } else {
        const recipeId = result.rows[0].FRK_recipe;
        RecipeModel.getRecipeById(recipeId, callback);
      }
    } catch (err) {
      callback(err, null);
    }
  }

  // Add a method to get the associated Recipe for this DetailRecipe
  async getRecipe(callback) {
    try {
      const result = await pool.query(
        `SELECT "FRK_recipe" FROM "DetailRecipe" WHERE "Id_detail_recipe" = $1`,
        [this.id]
      );

      if (result.rows.length === 0) {
        callback(null, null); // No recipe found
      } else {
        const recipeId = result.rows[0].FRK_recipe;
        RecipeModel.getRecipeById(recipeId, callback);
      }
    } catch (err) {
      callback(err, null);
    }
  }

  // Method to update a DetailRecipe
  static async updateDetailRecipe(id, detail, time, rate, level, calories, recipeId, callback) {
    try {
      const result = await pool.query(
        `UPDATE "DetailRecipe" 
         SET "Dt_recipe" = $1, "Dt_recipe_time" = $2, "Rate_recipe" = $3, "Level_recipe" = $4, 
             "Calories_recipe" = $5, "FRK_recipe" = $6 
         WHERE "Id_detail_recipe" = $7 RETURNING *`,
        [detail, time, rate, level, calories, recipeId, id]
      );

      if (result.rows.length === 0) {
        callback(null, null); // DetailRecipe not updated
      } else {
        const updatedDetailRecipe = result.rows[0];
        callback(null, new DetailRecipe(
          updatedDetailRecipe.Id_Detail_recipe,
          updatedDetailRecipe.Dt_recipe,
          updatedDetailRecipe.Dt_recipe_time,
          updatedDetailRecipe.Rate_recipe,
          updatedDetailRecipe.Level_recipe,
          updatedDetailRecipe.Calories_recipe,
          updatedDetailRecipe.FRK_recipe
        ));
      }
    } catch (err) {
      callback(err);
    }
  }

  // Method to delete a DetailRecipe
  static async deleteDetailRecipe(id, callback) {
    try {
      const result = await pool.query(
        `DELETE FROM "DetailRecipe" WHERE "Id_detail_recipe" = $1 RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        callback(null, false); // DetailRecipe not found or not deleted
      } else {
        callback(null, true); // DetailRecipe deleted successfully
      }
    } catch (err) {
      callback(err);
    }
  }
}

module.exports = DetailRecipe;
