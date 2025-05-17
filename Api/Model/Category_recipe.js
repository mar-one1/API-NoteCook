const pool = require('../../data/database'); // Assuming pool is set up for PostgreSQL

class Categoryrecipe {
  constructor(id, icon, detail_ct) {
    this.id = id;
    this.icon = icon;
    this.detail_ct = detail_ct;
  }

  // Create a new CategoryRecipe
  static async createCategoryRecipe(icon, detail_ct, callback) {
    try {
      const result = await pool.query(
        `INSERT INTO "Categorie_recipe" ("Icon_Categorie_recipe", "Detail_Categorie_recipe") 
        VALUES ($1, $2) RETURNING *`,
        [icon, detail_ct]
      );

      const newCategoryRecipe = result.rows[0];
      callback(null, new Categoryrecipe(
        newCategoryRecipe.Id_Categorie_recipe,
        newCategoryRecipe.Icon_Categorie_recipe,
        newCategoryRecipe.Detail_Categorie_recipe
      ));
    } catch (err) {
      callback(err);
    }
  }

  // Get all CategoryRecipes
  static async getAllCategoryRecipes(callback) {
    try {
      const result = await pool.query('SELECT * FROM "Categorie_recipe"');
      const categoryRecipes = result.rows.map(row => new Categoryrecipe(
        row.Id_Categorie_recipe,
        row.Icon_Categorie_recipe,
        row.Icon_Path_Categorie_recipe,
        row.Detail_Categorie_recipe
      ));
      callback(null, categoryRecipes);
    } catch (err) {
      callback(err, null);
    }
  }

  // Get a single CategoryRecipe by ID
  static async getCategoryRecipeById(categoryId, callback) {
    try {
      const result = await pool.query(
        `SELECT * FROM "Categorie_recipe" WHERE "Id_Categorie_recipe" = $1`,
        [categoryId]
      );

      if (result.rows.length === 0) {
        callback(null, null); // CategoryRecipe not found
        return;
      }

      const row = result.rows[0];
      callback(null, new Categoryrecipe(
        row.Id_Categorie_recipe,
        row.Icon_Categorie_recipe,
        row.Detail_Categorie_recipe
      ));
    } catch (err) {
      callback(err, null);
    }
  }

  // Update a CategoryRecipe by ID
  static async updateCategoryRecipe(categoryId, icon, detail_ct, callback) {
    try {
      const result = await pool.query(
        `UPDATE "Categorie_recipe" 
         SET "Icon_Categorie_recipe" = $1, "Detail_Categorie_recipe" = $2 
         WHERE "Id_Categorie_recipe" = $3 RETURNING *`,
        [icon, detail_ct, categoryId]
      );

      if (result.rows.length === 0) {
        callback(null, null); // CategoryRecipe not found or not updated
        return;
      }

      const updatedCategoryRecipe = result.rows[0];
      callback(null, new Categoryrecipe(
        updatedCategoryRecipe.Id_Categorie_recipe,
        updatedCategoryRecipe.Icon_Categorie_recipe,
        updatedCategoryRecipe.Detail_Categorie_recipe
      ));
    } catch (err) {
      callback(err);
    }
  }

  // Delete a single CategoryRecipe by ID
  static async deleteCategoryRecipe(categoryId, callback) {
    try {
      const result = await pool.query(
        `DELETE FROM "Categorie_recipe" WHERE "Id_Categorie_recipe" = $1 RETURNING *`,
        [categoryId]
      );

      if (result.rows.length === 0) {
        callback(null, false); // CategoryRecipe not found or not deleted
      } else {
        callback(null, true); // CategoryRecipe deleted successfully
      }
    } catch (err) {
      callback(err);
    }
  }

  // Bulk delete multiple CategoryRecipes by IDs
  static async deleteCategoryRecipes(categoryIds, callback) {
    const placeholders = categoryIds.map((_, index) => `$${index + 1}`).join(','); // Generate placeholders
    const query = `DELETE FROM "Categorie_recipe" WHERE "Id_Categorie_recipe" IN (${placeholders})`;

    try {
      const result = await pool.query(query, categoryIds);
      callback(null, result.rowCount); // Number of rows deleted
    } catch (err) {
      callback(err);
    }
  }
}

module.exports = Categoryrecipe;
