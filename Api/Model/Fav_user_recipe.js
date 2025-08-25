const db = require("../../database");

const Favorite = {
    create: (FRK_user, FRK_recipe, callback) => {
        try {
            db.run(`INSERT INTO FavoriteUserRecipe (FRK_user, FRK_recipe) VALUES (?, ?)`, [FRK_user, FRK_recipe], function(err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, { id: this.lastID, FRK_user, FRK_recipe });
                }
            });
        } catch (error) {
            callback(error);
        }
    },

    getAll: (callback) => {
        try {
            db.all(`SELECT * FROM FavoriteUserRecipe`, (err, rows) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null, rows);
                }
            });
        } catch (error) {
            callback(error);
        }
    },

    deleteById: (id, callback) => {
        try {
            db.run(`DELETE FROM FavoriteUserRecipe WHERE favRecipe_id = ?`, id, (err) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        } catch (error) {
            callback(error);
        }
    },

    getFavoriteById: (favId, callback) => {
        db.get(
            'SELECT * FROM FavoriteUserRecipe WHERE favRecipe_id = ?',
            [favId],
            (err, row) => {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (!row) {
                    callback(null, null); // Favorite not found
                    return;
                }
                // Construct the favorite object
                const favorite = {
                    favRecipe_id: row.favRecipe_id,
                    FRK_user: row.FRK_user,
                    FRK_recipe: row.FRK_recipe
                };
                callback(null, favorite);
            }
        );
    },
      // Function to get favorites by user ID
      getFavoritesByUserId: (userId, callback) => {
        db.all(
            'SELECT * FROM FavoriteUserRecipe WHERE FRK_user = ?',
            [userId],
            (err, rows) => {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (!rows || rows.length === 0) {
                    callback(null, []); // No favorites found for the user
                    return;
                }
                // Construct an array of favorite objects
                const favorites = rows.map(row => ({
                    favRecipe_id: row.favRecipe_id,
                    FRK_user: row.FRK_user,
                    FRK_recipe: row.FRK_recipe
                }));
                callback(null, favorites);
            }
        );
    }
};

module.exports = Favorite;
