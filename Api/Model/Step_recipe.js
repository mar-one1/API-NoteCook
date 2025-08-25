const sqlite3 = require('sqlite3').verbose();
const Recipe = require('../Model/Recipe'); // Import the Recipe model

class StepRecipe {
  constructor(id, detailStep, imageStep, timeStep, recipeId) {
    this.id = id;
    this.detailStep = detailStep;
    this.imageStep = imageStep;
    this.timeStep = timeStep;
    this.recipeId = recipeId;
  }

  static createStepRecipe(detailStep, imageStep, timeStep, recipeId, callback) {
    
    db.run(
      'INSERT INTO Step_recipe (Detail_Step_recipe, Image_Step_recipe, Time_Step_recipe, FRK_recipe) VALUES (?, ?, ?, ?)',
      [detailStep, imageStep, timeStep, recipeId],
      function (err) {
        if (err) {
          callback(err);
          return;
        }
        const newStepRecipe = new StepRecipe(
          this.lastID,
          detailStep,
          imageStep,
          timeStep,
          recipeId
        );
        callback(null, newStepRecipe);
      }
    );
    
  }

  static getAllStepRecipes(callback) {
    
    db.all('SELECT * FROM Step_recipe', (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      }
      const stepRecipes = rows.map((row) => {
        return new StepRecipe(
          row.Id_Step_recipe,
          row.Detail_Step_recipe,
          row.Image_Step_recipe,
          row.Time_Step_recipe,
          row.FRK_recipe
        );
      });
      callback(null, stepRecipes);
    });
    
  }

  static getStepsByRecipeId(recipeId, callback) {
    
    db.all(
      'SELECT * FROM Step_recipe WHERE FRK_recipe = ?',
      [recipeId],
      (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        const steps = rows.map((row) => {
          return new StepRecipe(
            row.Id_Step_recipe,
            row.Detail_Step_recipe,
            row.Image_Step_recipe,
            row.Time_Step_recipe,
            row.FRK_recipe
          );
        });
        callback(null, steps);
      }
    );
    
  }

  static updateStepRecipe(stepId, detailStep, imageStep, timeStep, recipeId, callback) {
    
    db.run(
      'UPDATE Step_recipe SET Detail_Step_recipe = ?, Image_Step_recipe = ?, Time_Step_recipe = ?, FRK_recipe = ? WHERE Id_Step_recipe = ?',
      [detailStep, imageStep, timeStep, recipeId, stepId],
      function (err) {
        if (err) {
          callback(err);
          return;
        }
        if (this.changes === 0) {
          callback(null, null); // Step recipe not found or not updated
          return;
        }
        const updatedStepRecipe = new StepRecipe(
          stepId,
          detailStep,
          imageStep,
          timeStep,
          recipeId
        );
        callback(null, updatedStepRecipe);
      }
    );
    
  }

  static deleteStepRecipe(stepId, callback) {
    
    db.run(
      'DELETE FROM Step_recipe WHERE Id_Step_recipe = ?',
      [stepId],
      function (err) {
        if (err) {
          callback(err);
          return;
        }
        if (this.changes === 0) {
          callback(null, false); // Step recipe not found or not deleted
          return;
        }
        callback(null, true); // Step recipe deleted successfully
      }
    );
    
  }
}

module.exports = StepRecipe;