const pool = require("../../data/database");
const Recipe = require("../Model/Recipe"); // Import the Recipe model

class StepRecipe {
  constructor(id, detailStep, imageStep, timeStep, recipeId) {
    this.id = id;
    this.detailStep = detailStep;
    this.imageStep = imageStep;
    this.timeStep = timeStep;
    this.recipeId = recipeId;
  }

  static createStepRecipe(detailStep, imageStep, timeStep, recipeId, callback) {
    const query = `
      INSERT INTO "StepRecipe" ("Detail_step_recipe", "Image_step_recipe", "Time_step_recipe", "FRK_recipe")
      VALUES ($1, $2, $3, $4)
      RETURNING "Id_step_recipe", "Detail_step_recipe", "Image_step_recipe", "Time_step_recipe", "FRK_recipe"
    `;
    const values = [detailStep, imageStep, timeStep, recipeId];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      const row = result.rows[0];
      const newStepRecipe = new StepRecipe(
        row.id_step_recipe,
        row.detail_step_recipe,
        row.image_step_recipe,
        row.time_step_recipe,
        row.frk_recipe
      );
      callback(null, newStepRecipe);
    });
  }

  static getAllStepRecipes(callback) {
    const query = 'SELECT * FROM "StepRecipe"';

    pool.query(query, (err, result) => {
      if (err) {
        callback(err, null);
        return;
      }
      const stepRecipes = result.rows.map((row) => {
        return new StepRecipe(
          row.Id_step_recipe,
          row.Detail_step_recipe,
          row.Image_step_recipe,
          row.Time_step_recipe,
          row.FRK_recipe
        );
      });
      callback(null, stepRecipes);
    });
  }

  static getStepsByRecipeId(recipeId, callback) {
    const query = 'SELECT * FROM "StepRecipe" WHERE "FRK_recipe" = $1';
    const values = [recipeId];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err, null);
        return;
      }
      const steps = result.rows.map((row) => {
        return new StepRecipe(
          row.Id_step_recipe,
          row.Detail_step_recipe,
          row.Image_step_recipe,
          row.Time_step_recipe,
          row.FRK_recipe
        );
      });
      callback(null, steps);
    });
  }

  static updateStepRecipe(stepId, detailStep, imageStep, timeStep, recipeId, callback) {
    const query = `
      UPDATE "StepRecipe"
      SET "Detail_step_recipe" = $1, "Image_step_recipe" = $2, "Time_step_recipe" = $3, "FRK_recipe" = $4
      WHERE "Id_step_recipe" = $"5"
      RETURNING "Id_step_recipe", "Detail_step_recipe", "Image_step_recipe", "Time_step_recipe", "FRK_recipe"
    `;
    const values = [detailStep, imageStep, timeStep, recipeId, stepId];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      if (result.rowCount === 0) {
        callback(null, null); // Step recipe not found
        return;
      }
      const row = result.rows[0];
      const updatedStepRecipe = new StepRecipe(
        row.Id_step_recipe,
        row.Detail_step_recipe,
        row.Image_step_recipe,
        row.Time_step_recipe,
        row.FRK_recipe
      );
      callback(null, updatedStepRecipe);
    });
  }

  static deleteStepRecipe(stepId, callback) {
    const query = 'DELETE FROM "StepRecipe" WHERE "Id_step_recipe" = $1';
    const values = [stepId];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      const isDeleted = result.rowCount > 0; // True if a row was deleted, false otherwise
      callback(null, isDeleted);
    });
  }
}

module.exports = StepRecipe;
