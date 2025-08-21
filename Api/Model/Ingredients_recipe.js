// ingredient_recipe.model.js

const db = require("../../database");

class IngredientRecipe {
  constructor(
    id_Ingeredient_recipe,
     Frk_idRecipe,
      Frk_idIngredient
    ) {
    this.id_Ingeredient_recipe = id_Ingeredient_recipe;
    this.Frk_idRecipe = Frk_idRecipe;
    this.Frk_idIngredient = Frk_idIngredient;
  }


  // Create a new ingredient recipe association
  static create(recipeId, ingredientId, callback) {
    
    db.run(
      'INSERT INTO ingredients_recipe (FRK_recipe, Frk_Ingredient_recipe) VALUES (?, ?)',
      [recipeId, ingredientId],
      function(err) {
        if (err) {
          callback(err);
          return;
        }
        const newIngredientRecipe = new IngredientRecipe(this.lastID, recipeId, ingredientId);
        callback(null, newIngredientRecipe);
      }
    );
    
  }

  // Retrieve all ingredient recipe associations
  static getAll(callback) {
    
    db.all('SELECT * FROM ingredients_recipe', (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      const associations = rows.map(row => new IngredientRecipe(row.Id_List_Ingeredients_recipe, row.FRK_recipe, row.Frk_Ingredient_recipe));
      callback(null, associations);
    });
    
  }

  // Retrieve all ingredient recipe associations for a recipe
  static getByRecipeId(recipeId, callback) {
    
    db.all('SELECT * FROM ingredients_recipe WHERE FRK_recipe = ?', [recipeId], (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      const associations = rows.map(row => new IngredientRecipe(row.Id_List_Ingeredients_recipe, row.FRK_recipe, row.Frk_Ingredient_recipe));
      callback(null, associations);
    });
    
  }

  // Retrieve all ingredient recipe associations for a specific ingredient ID
  static getByIngredientId(ingredientId, callback) {
    
    db.all('SELECT * FROM ingredients_recipe WHERE Frk_Ingredient_recipe = ?', [ingredientId], (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      const associations = rows.map(row => new IngredientRecipe(row.Id_List_Ingeredients_recipe, row.FRK_recipe, row.Frk_Ingredient_recipe));
      callback(null, associations);
    });
    
  }

  // Delete all ingredient recipe associations for a recipe
  static deleteByRecipeId(recipeId, callback) {
    
    db.run('DELETE FROM ingredients_recipe WHERE FRK_recipe = ?', [recipeId], function(err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    });
    
  }
}

module.exports = IngredientRecipe;
