const pool  = require("../../data/database");

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
<<<<<<< HEAD
  static create(recipeId, ingredientId, callback) {
    const db = new sqlite3.Database('DB_Notebook.db');
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
    db.close();
  }

  // Retrieve all ingredient recipe associations
  static getAll(callback) {
    const db = new sqlite3.Database('DB_Notebook.db');
    db.all('SELECT * FROM ingredients_recipe', (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      const associations = rows.map(row => new IngredientRecipe(row.Id_List_Ingeredients_recipe, row.FRK_recipe, row.Frk_Ingredient_recipe));
      callback(null, associations);
    });
    db.close();
  }

  // Retrieve all ingredient recipe associations for a recipe
  static getByRecipeId(recipeId, callback) {
    const db = new sqlite3.Database('DB_Notebook.db');
    db.all('SELECT * FROM ingredients_recipe WHERE FRK_recipe = ?', [recipeId], (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      const associations = rows.map(row => new IngredientRecipe(row.Id_List_Ingeredients_recipe, row.FRK_recipe, row.Frk_Ingredient_recipe));
      callback(null, associations);
    });
    db.close();
  }

  // Retrieve all ingredient recipe associations for a specific ingredient ID
  static getByIngredientId(ingredientId, callback) {
    const db = new sqlite3.Database('DB_Notebook.db');
    db.all('SELECT * FROM ingredients_recipe WHERE Frk_Ingredient_recipe = ?', [ingredientId], (err, rows) => {
      if (err) {
        callback(err);
        return;
      }
      const associations = rows.map(row => new IngredientRecipe(row.Id_List_Ingeredients_recipe, row.FRK_recipe, row.Frk_Ingredient_recipe));
      callback(null, associations);
    });
    db.close();
  }

  // Delete all ingredient recipe associations for a recipe
  static deleteByRecipeId(recipeId, callback) {
    const db = new sqlite3.Database('DB_Notebook.db');
    db.run('DELETE FROM ingredients_recipe WHERE FRK_recipe = ?', [recipeId], function(err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    });
    db.close();
=======
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
>>>>>>> bde9db8caa29941a23f776a0fc0a627974a1937c
  }
}

module.exports = IngredientRecipe;
