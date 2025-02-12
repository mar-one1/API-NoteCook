const pool = require("../../data/database");

const Favorite = {
  // Create a new favorite
  create: async (FRK_user, FRK_recipe, callback) => {
    try {
      const result = await pool.query(
        `INSERT INTO "FavoriteUserRecipe" ("FRK_user", "FRK_recipe") VALUES ($1, $2) RETURNING *`,
        [FRK_user, FRK_recipe]
      );
      const favorite = result.rows[0];
      callback(null, { id: favorite.favRecipe_id, FRK_user, FRK_recipe });
    } catch (error) {
      callback(error);
    }
  },

  // Get all favorites
  getAll: async (callback) => {
    try {
      const result = await pool.query(`SELECT * FROM "FavoriteUserRecipe"`);
      callback(null, result.rows);
    } catch (error) {
      callback(error);
    }
  },

  // Get favorite by ID
  getFavoriteById: async (favId, callback) => {
    try {
      const result = await pool.query(
        'SELECT * FROM "FavoriteUserRecipe" WHERE "favRecipe_id" = $1',
        [favId]
      );
      if (result.rows.length === 0) {
        callback(null, null); // Favorite not found
      } else {
        callback(null, result.rows[0]);
      }
    } catch (error) {
      callback(error);
    }
  },

  // Get favorites by user ID
  getFavoritesByUserId: async (userId, callback) => {
    try {
      const result = await pool.query(
        'SELECT * FROM "FavoriteUserRecipe" WHERE "FRK_user" = $1',
        [userId]
      );
      if (result.rows.length === 0) {
        callback(null, []); // No favorites found for the user
      } else {
        callback(null, result.rows);
      }
    } catch (error) {
      callback(error);
    }
  },

  // Delete a favorite by ID
  deleteById: async (id, callback) => {
    try {
      const result = await pool.query(
        'DELETE FROM "FavoriteUserRecipe" WHERE "favRecipe_id" = $1 RETURNING *',
        [id]
      );
      if (result.rows.length === 0) {
        callback(null, false); // No favorite found to delete
      } else {
        callback(null, true); // Favorite deleted successfully
      }
    } catch (error) {
      callback(error);
    }
  }
};

module.exports = Favorite;
