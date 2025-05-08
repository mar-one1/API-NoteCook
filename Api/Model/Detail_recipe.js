const sqlite3 = require('sqlite3').verbose();
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

  static createDetailRecipe(detail, time, rate, level, calories, recipeId, callback) {
    const db = new sqlite3.Database('DB_Notebook.db');
    db.run(
      'INSERT INTO Detail_recipe (Dt_recipe, Dt_recipe_time, Rate_recipe, Level_recipe, Calories_recipe, FRK_recipe) VALUES (?, ?, ?, ?, ?, ?)',
      [detail, time, rate, level, calories, recipeId],
      function (err) {
        if (err) {
          callback(err);
          return;
        }
        const newDetailRecipe = new DetailRecipe(
          this.lastID,
          detail,
          time,
          rate,
          level,
          calories,
          recipeId
        );
        callback(null, newDetailRecipe);
      }
    );
    db.close();
  }

  static getDetailRecipeById(id, callback) {
    const db = new sqlite3.Database('DB_Notebook.db');
    db.get(
      'SELECT * FROM Detail_recipe WHERE Id_Detail_recipe = ?',
      [id],
      (err, row) => {
        if (err) {
          callback(err, null);
          return;
        }
        if (!row) {
          callback(null, null); // DetailRecipe not found
          return;
        }
        const detailRecipe = new DetailRecipe(
          row.Id_Detail_recipe,
          row.Dt_recipe,
          row.Dt_recipe_time,
          row.Rate_recipe,
          row.Level_recipe,
          row.Calories_recipe,
          row.FRK_recipe
        );
        callback(null, detailRecipe);
      }
    );
    db.close();
  }
  static getDetailRecipeByfkRecipe(FK, callback) {
    const db = new sqlite3.Database('DB_Notebook.db');
    db.get(
      'SELECT * FROM Detail_recipe WHERE FRK_recipe = ?',
      [FK],
      (err, row) => {
        if (err) {
          callback(err, null);
          return;
        }
        if (!row) {
          callback(null, null); // DetailRecipe not found
          return;
        }
        const detailRecipe = new DetailRecipe(
          row.Id_detail_recipe,
          row.Dt_recipe,
          row.Dt_recipe_time,
          row.Rate_recipe,
          row.Level_recipe,
          row.Calories_recipe,
          row.FRK_recipe
        );
        console.log(detailRecipe);
        callback(null, detailRecipe);
      }
    );
    db.close();
  }

  static getRecipeByDetailrecipeId(detailRecipeId, callback) {
    const db = new sqlite3.Database('DB_Notebook.db');
    db.get(
      'SELECT FRK_recipe FROM Detail_recipe WHERE Id_Detail_recipe = ?',
      [detailRecipeId],
      (err, row) => {
        if (err) {
          callback(err, null);
          return;
        }
        if (!row) {
          callback(null, null); // Detail_Recipe not found
          return;
        }

        const recipeId = row.FRK_recipe;
        RecipeModel.getRecipeById(recipeId, callback);
      }
    );
    db.close();
  }

  // Add a method to get the associated Recipe for this DetailRecipe
  getRecipe(callback) {
    RecipeModel.getRecipeById(this.recipeId, callback);
  }

  // Add more methods as needed
}

module.exports = DetailRecipe;
