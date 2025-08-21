const db = require("../../database");

class Categoryrecipe {
  constructor(id, icon, detail_ct) {
    this.id = id;
    this.icon = icon;
    this.detail_ct = detail_ct;
  }

  static createCategoryRecipe(icon, detail_ct, callback) {
    
    try {
      db.run(
        'INSERT INTO Categorie_recipe (Icon_Categorie_recipe, Detail_Categorie_recipe) VALUES (?, ?)',
        [icon, detail_ct],
        function (err) {
          if (err) {
            callback(err);
            return;
          }
          const newCategoryRecipe = new Categoryrecipe(
            this.lastID,
            icon,
            detail_ct
          );
          callback(null, newCategoryRecipe);
        }
      );
    } catch (err) {
      callback(err);
    } finally {
      
    }
  }

  static getAllCategoryRecipes(callback) {
    
    try {
      db.all('SELECT * FROM Categorie_recipe', (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        const categoryRecipes = rows.map((row) => {
          return new Categoryrecipe(
            row.Id_Categorie_recipe,
            row.Icon_Categorie_recipe,
            row.Detail_Categorie_recipe
          );
        });
        callback(null, categoryRecipes);
      });
    } catch (err) {
      callback(err, null);
    } finally {
      
    }
  }

  static getCategoryRecipeById(categoryId, callback) {
    
    try {
      db.get(
        'SELECT * FROM Categorie_recipe WHERE Id_Categorie_recipe = ?',
        [categoryId],
        (err, row) => {
          if (err) {
            callback(err, null);
            return;
          }
          if (!row) {
            callback(null, null); // Category recipe not found
            return;
          }
          const categoryRecipe = new Categoryrecipe(
            row.Id_Categorie_recipe,
            row.Icon_Categorie_recipe,
            row.Detail_Categorie_recipe
          );
          callback(null, categoryRecipe);
        }
      );
    } catch (err) {
      callback(err, null);
    } finally {
      
    }
  }

  static updateCategoryRecipe(categoryId, icon, detail_ct, callback) {
    
    try {
      db.run(
        'UPDATE Categorie_recipe SET Icon_Categorie_recipe = ?, Detail_Categorie_recipe = ? WHERE Id_Categorie_recipe = ?',
        [icon, detail_ct, categoryId],
        function (err) {
          if (err) {
            callback(err);
            return;
          }
          if (this.changes === 0) {
            callback(null, null); // Category recipe not found or not updated
            return;
          }
          const updatedCategoryRecipe = new Categoryrecipe(
            categoryId,
            icon,
            detail_ct
          );
          callback(null, updatedCategoryRecipe);
        }
      );
    } catch (err) {
      callback(err);
    } finally {
      
    }
  }

  static deleteCategoryRecipe(categoryId, callback) {
    
    try {
      db.run(
        'DELETE FROM Categorie_recipe WHERE Id_Categorie_recipe = ?',
        [categoryId],
        function (err) {
          if (err) {
            callback(err);
            return;
          }
          if (this.changes === 0) {
            callback(null, false); // Category recipe not found or not deleted
            return;
          }
          callback(null, true); // Category recipe deleted successfully
        }
      );
    } catch (err) {
      callback(err);
    } finally {
      
    }
  }

  static deleteCategoryRecipes(categoryIds, callback) {
    
    const placeholders = categoryIds.map(() => '?').join(',');
    const query = `DELETE FROM Categorie_recipe WHERE Id_Categorie_recipe IN (${placeholders})`;

    try {
      db.run(query, categoryIds, function (err) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, this.changes); // Number of rows deleted
      });
    } catch (err) {
      callback(err);
    } finally {
      
    }
  }
}

module.exports = Categoryrecipe;
