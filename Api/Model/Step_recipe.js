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
static async UpdateStepsImages(id_step, imagebyte, callback) {

    try {
      // Retrieve the recipe ID using the unique_key_recipe
      db.get(
        `SELECT Image_Step_recipe FROM Step_recipe WHERE Image_Step_recipe = ?`,
        [id_step],
        (err, row) => {
          if (err || !row) {
            db.run("ROLLBACK");
            console.error("Error retrieving recipe ID:", err);
            return callback(err || new Error("Recipe not found"));
          }
          const oldPath = row.imageStep;
          db.run(
            "UPDATE Step_recipe SET Image_Step_recipe = ? WHERE Image_Step_recipe = ?",
            [imagebyte, id_step],
            function (err) {
              if (err) {
                callback(err);
                return;
              }
              if (this.changes === 0) {
                callback(null, null); // User not found or not updated
                return;
              }
              // If the user doesn't exist, add them to the database
              console.log(oldPath);
              Recipe.deleteimage(oldPath);
              callback(null, imagebyte);
              console.log(imagebyte);
            }
          );
        }
      )

    } catch (err) {

      console.error("Error Update Recipe Image : " + unique, err);
      callback(err, null);
    }
  }
static deleteimage(pathimage, callback = () => { }) { // Default empty callback
    const filePathToDelete = "./public/data/uploads/" + pathimage;
    try {
      console.log("path for delete " + filePathToDelete);
      fs.access(filePathToDelete, fs.constants.F_OK, (err) => {
        if (err) {
          console.error("File does not exist or cannot be accessed.");
          return callback(err);  // Pass error to the callback
        }

        // File exists, proceed to delete
        fs.unlink(filePathToDelete, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting file:", unlinkErr);
            return callback(unlinkErr);  // Pass error to the callback
          }
          console.log("File deleted successfully.");
          callback(null, "File deleted successfully.");  // Success message
        });
      });
    } catch (err) {
      console.error("Error deleting image recipe: " + filePathToDelete, err);
      callback(err);  // Pass error to the callback
    }
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