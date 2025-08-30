const db = require("../../database");
const UserModel = require("./User"); // Import the User model
const DetailRecipeModel = require("./Detail_recipe"); // Import the User model
const fs = require("fs");
const { reconstructFieldPath } = require("express-validator/lib/field-selection");
class Recipe {
  constructor(id, name, icon, fav, unique_key, userId) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.fav = fav;
    this.unique_key = unique_key;
    this.userId = userId;
  }

  static createRecipe(name, icon, fav, unique_key, userId, callback) {

    try {
      db.run(
        "INSERT INTO Recipe (Nom_Recipe, Icon_recipe, Fav_recipe, unique_key_recipe, Frk_user) VALUES (?, ?, ?, ?, ?)",
        [name, icon, fav, unique_key, userId],
        function (err) {
          if (err) {
            callback(err);
            return;
          }
          const newRecipe = new Recipe(this.lastID, name, icon, fav, unique_key, userId);
          callback(null, newRecipe);
        }
      );

    } catch (err) {

      console.error("Error create Recipe ", err);
      callback(err, null);
    }
  }

  // Helper function to get all image paths from the database
  static getAllImagePathsFromDatabase(callback) {
    if (typeof callback !== "function") {
      throw new Error("Callback function is required");
    }


    try {
      db.all("SELECT Icon_recipe FROM Recipe", [], (err, rows) => {
        if (err) {

          console.error("Error getting all image paths from database:", err);
          return callback(err, null);
        }
        const paths = rows.map((row) => row.Icon_recipe);
        console.log("path geting form db :" + paths);

        callback(null, paths);
      });
    } catch (err) {

      console.error("Error getting all image paths from database:", err);
      callback(err, null);
    }
  }

  static getRecipeById(id, callback) {

    db.get(
      'SELECT * FROM Recipe WHERE Id_recipe = ?',
      [id],
      (err, row) => {
        if (err) {
          callback(err, null);
          return;
        }
        if (!row) {
          callback(null, null); // Recipe not found
          return;
        }
        const recipe = new Recipe(
          row.Id_recipe,
          row.Nom_Recipe,
          row.Icon_recipe,
          row.Fav_recipe,
          row.unique_key_recipe,
          row.Frk_user
        );
        callback(null, recipe);
      }
    );

  }

  static getAllFullRecipesByUsername(username, callback) {

    try {
      UserModel.getUserByUsername(username, (err, user) => {
        if (err) {

          callback(err, null);
          return;
        }
        if (!user) {

          callback(null, null); // user not found
          return;
        }
        const id = user.id;
        console.log(id);
        const sql = `
                SELECT Recipe.*, 
                    Detail_recipe.*, 
                    Ingredient.*, 
                    Step_recipe.*, 
                    Review_recipe.*,
                    FavoriteUserRecipe.*
                FROM Recipe
                LEFT JOIN Detail_recipe ON Recipe.Id_recipe = Detail_recipe.FRK_recipe
                LEFT JOIN Ingredient ON Recipe.Id_recipe = Ingredient.FRK_recipe
                LEFT JOIN Step_recipe ON Recipe.Id_recipe = Step_recipe.FRK_recipe
                LEFT JOIN Review_recipe ON Recipe.Id_recipe = Review_recipe.FRK_recipe
                LEFT JOIN FavoriteUserRecipe ON Recipe.Id_recipe = FavoriteUserRecipe.FRK_recipe
                WHERE Recipe.Frk_user = ?
            `;

        db.all(sql, [id], (err, rows) => {
          if (err) {

            callback(err, null);
            return;
          }

          const dataMap = new Map(); // Map to store unique entries across all tables

          rows.forEach((row) => {
            const recipeId = row.Id_recipe;

            // Check if the entry with the same recipeId already exists in the map
            if (!dataMap.has(recipeId)) {
              dataMap.set(recipeId, {
                recipe: {
                  id: row.Id_recipe,
                  name: row.Nom_Recipe,
                  icon: row.Icon_recipe,
                  fav: row.Fav_recipe,
                  unique_key: row.unique_key_recipe,
                },

                detail_recipe: {
                  id: row.Id_detail_recipe,
                  detail: row.Dt_recipe,
                  time: row.Dt_recipe_time,
                  rate: row.Rate_recipe,
                  level: row.Level_recipe,
                  calories: row.Calories_recipe,
                },
                ingredients: new Set(),
                reviews: new Set(),
                steps: new Set(),
                favs: new Set(),
              });
            }

            // Add ingredients, reviews, steps, and favs to the corresponding entry
            const entry = dataMap.get(recipeId);
            entry.ingredients.add(
              JSON.stringify({
                id: row.Id_Ingredient,
                ingredient: row.Ingredient_recipe,
                poidIngredient: row.PoidIngredient,
                unite: row.Unite,
                recipeId: row.FRK_recipe,
              })
            );
            entry.reviews.add(
              JSON.stringify({
                id: row.Id_Review_recipe,
                detailReview: row.Detail_Review_recipe,
                rateReview: row.Rate_Review_recipe,
              })
            );
            entry.steps.add(
              JSON.stringify({
                id: row.Id_Step_recipe,
                detailStep: row.Detail_Step_recipe,
                imageStep: row.Image_Step_recipe,
                timeStep: row.Time_Step_recipe,
              })
            );
            entry.favs.add(
              JSON.stringify({
                favRecipe_id: row.favRecipe_id,
                FRK_user: row.FRK_user,
              })
            );
          });

          // Convert sets to arrays before returning
          const uniqueEntries = Array.from(dataMap.values()).map((entry) => ({
            ...entry,
            ingredients: Array.from(entry.ingredients).map(JSON.parse),
            reviews: Array.from(entry.reviews).map(JSON.parse),
            steps: Array.from(entry.steps).map(JSON.parse),
            favs: Array.from(entry.favs).map(JSON.parse),
          }));

          callback(null, uniqueEntries);

        });
      });
    } catch (err) {
      console.error("Error retrieving recipes by username:", err);
      callback(err, null);
    }
  }


  static insertRecipeWithDetails(recipeData, callback) {
    const { recipe, detail_recipe, ingredients, reviews, steps } = recipeData;

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // ✅ تحقق إذا كاينة نفس الوصفة بالـ unique_key
      db.get(
        `SELECT Id_recipe FROM Recipe WHERE unique_key_recipe = ?`,
        [recipe.unique_key],
        (err, existing) => {
          if (err) {
            db.run("ROLLBACK");
            return callback(err);
          }

          if (existing) {
            console.log("❗️Recipe already exists, skipping insert:", recipe.unique_key);
            db.run("ROLLBACK");
            return callback(null, existing.Id_recipe);
          }

          // 1. Insert into Recipe table
          db.run(
            `INSERT INTO Recipe (Nom_Recipe, Icon_recipe, Fav_recipe, unique_key_recipe, Frk_user)
             VALUES (?, ?, ?, ?, ?)`,
            [recipe.name, recipe.icon, recipe.fav, recipe.unique_key, recipe.userId],
            function (err) {
              if (err) {
                db.run("ROLLBACK");
                return callback(err);
              }

              const recipeId = this.lastID;

              // 2. Insert into DetailRecipe
              db.run(
                `INSERT INTO DetailRecipe 
                 (Dt_recipe, Dt_recipe_time, Rate_recipe, Level_recipe, Calories_recipe, FRK_recipe)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  detail_recipe.detail,
                  detail_recipe.time,
                  detail_recipe.rate,
                  detail_recipe.level,
                  detail_recipe.calories,
                  recipeId,
                ],
                function (err) {
                  if (err) {
                    db.run("ROLLBACK");
                    return callback(err);
                  }

                  const detailId = this.lastID;

                  // 3. Insert ingredients
                  if (Array.isArray(ingredients) && ingredients.length > 0) {
                    const stmtIng = db.prepare(
                      `INSERT INTO IngredientRecipe 
                       (Ingredient_recipe, PoidIngredient_recipe, unit, FRK_detail_recipe) 
                       VALUES (?, ?, ?, ?)`
                    );
                    for (const ing of ingredients) {
                      stmtIng.run([
                        ing.ingredient,
                        ing.poidIngredient,
                        ing.unite,
                        detailId,
                      ]);
                    }
                    stmtIng.finalize();
                  }

                  // 4. Insert steps
                  if (Array.isArray(steps) && steps.length > 0) {
                    const stmtStep = db.prepare(
                      `INSERT INTO StepRecipe 
                       (Detail_step_recipe, Image_step_recipe, Time_step_recipe, FRK_recipe) 
                       VALUES (?, ?, ?, ?)`
                    );
                    for (const step of steps) {
                      stmtStep.run([
                        step.detailStep,
                        step.imageStep,
                        step.timeStep,
                        recipeId,
                      ]);
                    }
                    stmtStep.finalize();
                  }

                  // 5. Insert reviews
                  if (Array.isArray(reviews) && reviews.length > 0) {
                    const stmtReview = db.prepare(
                      `INSERT INTO ReviewRecipe 
                       (Detail_review_recipe, Rate_review_recipe, FRK_recipe) 
                       VALUES (?, ?, ?)`
                    );
                    for (const review of reviews) {
                      stmtReview.run([
                        review.detailReview,
                        review.rateReview,
                        recipeId,
                      ]);
                    }
                    stmtReview.finalize();
                  }

                  // ✅ Commit the transaction
                  db.run("COMMIT", (err) => {
                    if (err) {
                      return callback(err);
                    }
                    console.log("✅ Recipe inserted successfully with ID:", recipeId);
                    callback(null, recipeId);
                  });
                }
              );
            }
          );
        }
      );
    });
  }

  static getRecipesByConditions(conditions, callback) {

    try {
      let query = `
    SELECT 
      Recipe.*, 
      Detail_recipe.*, 
      Ingredient.*, 
      Step_recipe.*, 
      Review_recipe.*
    FROM Recipe
    LEFT JOIN Detail_recipe ON Recipe.Id_recipe = Detail_recipe.FRK_recipe
    LEFT JOIN Ingredient ON Recipe.Id_recipe = Ingredient.FRK_recipe
    LEFT JOIN Step_recipe ON Recipe.Id_recipe = Step_recipe.FRK_recipe
    LEFT JOIN Review_recipe ON Recipe.Id_recipe = Review_recipe.FRK_recipe`;

      let params = [];
      let whereClauseAdded = false;

      // Check if searchText is provided
      if (conditions.searchText) {
        query += ` WHERE (
      Recipe.Nom_Recipe LIKE ? OR
      Detail_recipe.Dt_recipe LIKE ? OR
      Ingredient.Ingredient_recipe LIKE ? OR
      Step_recipe.Detail_Step_recipe LIKE ? OR
      Review_recipe.Detail_Review_recipe LIKE ?
    )`;

        // Add searchText parameters
        params.push(`%${conditions.searchText}%`);
        /*params.push(`%${conditions.searchText}%`);
        params.push(`%${conditions.searchText}%`);
        params.push(`%${conditions.searchText}%`);
        params.push(`%${conditions.searchText}%`);*/

        whereClauseAdded = true;
      }

      for (const key in conditions) {
        if (key !== "searchText") {
          if (!whereClauseAdded) {
            query += " WHERE";
            whereClauseAdded = true;
          } else {
            query += " AND";
          }
          query += ` ${key} LIKE ?`;
          params.push(`%${conditions[key]}%`);
        }
      }

      db.all(query, params, (err, rows) => {
        if (err) {
          callback(err);

          return;
        }
        const recipeSet = new Set();
        rows.forEach((row) => {
          // Use JSON.stringify to compare recipe objects as strings
          recipeSet.add(
            JSON.stringify({
              id: row.Id_recipe,
              name: row.Nom_Recipe,
              icon: row.Icon_recipe,
              fav: row.Fav_recipe,
              unique_key: row.unique_key_recipe,
              userId: row.Frk_user,
            })
          );
        });
        // Convert the set back to an array of recipes
        const uniqueRecipes = Array.from(recipeSet).map(JSON.parse);
        callback(null, uniqueRecipes);

      });
    } catch (err) {

      console.error("Error getting recipes by conditions:", err);
      callback(err, null);
    }
  }

  static getFullRecipeById(id, callback) {

    try {
      const sql = `
    SELECT Recipe.*,User.*, Detail_recipe.*, Ingredient.*, Step_recipe.*,Review_recipe.*
          FROM Recipe
          LEFT JOIN User ON Recipe.Frk_user = User.Id_user
          LEFT JOIN Detail_recipe ON Recipe.Id_recipe = Detail_recipe.FRK_recipe
          LEFT JOIN Ingredient ON Recipe.Id_recipe = Ingredient.FRK_recipe
          LEFT JOIN Step_recipe ON Recipe.Id_recipe = Step_recipe.FRK_recipe
          LEFT JOIN Review_recipe ON Recipe.Id_recipe = Review_recipe.FRK_recipe
          LEFT JOIN FavoriteUserRecipe ON Recipe.Id_recipe = Review_recipe.FRK_recipe
          WHERE Recipe.Id_recipe = ?
    `;

      db.all(sql, [id], (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        if (!rows || rows.length === 0) {
          callback(null, null); // Recipe not found
          return;
        }
        //a complete////!
        const user = new UserModel(
          rows[0].Id_user,
          rows[0].username,
          rows[0].Firstname_user,
          rows[0].Lastname_user,
          rows[0].Birthday_user,
          rows[0].Email_user,
          rows[0].Phonenumber_user,
          (rows[0].Icon_user = null),
          rows[0].password,
          rows[0].Grade_user,
          rows[0].Status_user,
          rows[0].Url_image
        );
        // Create instances for the main recipe and its detail
        const recipe = new Recipe(
          rows[0].Id_recipe,
          rows[0].Nom_Recipe,
          rows[0].Icon_recipe,
          rows[0].Fav_recipe,
          rows[0].unique_key_recipe,
          rows[0].Frk_user
        );

        const detail_recipe = new DetailRecipeModel(
          rows[0].Id_detail_recipe,
          rows[0].Dt_recipe,
          rows[0].Dt_recipe_time,
          rows[0].Rate_recipe,
          rows[0].Level_recipe,
          rows[0].Calories_recipe,
          rows[0].FRK_recipe
        );

        // Create sets to ensure uniqueness
        const ingredientSet = new Set();
        const reviewSet = new Set();
        const stepSet = new Set();

        // Map over the rows for ingredients, reviews, and steps
        rows.forEach((row) => {
          // Ensure uniqueness for each entity type
          ingredientSet.add(
            JSON.stringify({
              id: row.Id_Ingredient,
              ingredient: row.Ingredient_recipe,
              poidIngredient: row.PoidIngredient_recipe,
              unite: row.Unite,
              recipeId: row.FRK_recipe,
            })
          );

          reviewSet.add(
            JSON.stringify({
              id: row.Id_review_recipe,
              detailReview: row.Detail_Review_recipe,
              rateReview: row.Rate_Review_recipe,
              recipeId: row.FRK_recipe,
            })
          );

          stepSet.add(
            JSON.stringify({
              id: row.Id_Step_recipe,
              detailStep: row.Detail_Step_recipe,
              imageStep: row.Image_Step_recipe,
              timeStep: row.Time_Step_recipe,
              recipeId: row.FRK_recipe,
            })
          );
        });

        // Convert sets back to arrays of unique entities
        const ingredients = Array.from(ingredientSet).map(JSON.parse);
        const reviews = Array.from(reviewSet).map(JSON.parse);
        const steps = Array.from(stepSet).map(JSON.parse);

        // Pass all the data to the callback
        callback(null, {
          recipe,
          user,
          detail_recipe,
          ingredients,
          reviews,
          steps,
        });
      });

    } catch (err) {

      console.error("Error full retrieving recipes by id recipe: " + id, err);
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


  static async UpdateRecipeImage(unique, imagebyte, callback) {

    try {
      // Retrieve the recipe ID using the unique_key_recipe
      db.get(
        `SELECT Icon_recipe FROM Recipe WHERE unique_key_recipe = ?`,
        [unique],
        (err, row) => {
          if (err || !row) {
            db.run("ROLLBACK");
            console.error("Error retrieving recipe ID:", err);
            return callback(err || new Error("Recipe not found"));
          }
          const oldPath = row.Icon_recipe;
          db.run(
            "UPDATE Recipe SET Icon_recipe = ? WHERE unique_key_recipe = ?",
            [imagebyte, unique],
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

  static getAllRecipes(callback) {

    try {
      db.all("SELECT * FROM Recipe", (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        const recipes = rows.map((row) => {
          return new Recipe(
            row.Id_recipe,
            row.Nom_Recipe,
            row.Icon_recipe,
            row.Fav_recipe,
            row.unique_key_recipe,
            row.Frk_user
          );
        });
        callback(null, recipes);
      });

    } catch (err) {

      console.error("Error get All Recipes", err);
      callback(err, null);
    }
  }

  static getUserByRecipeId(recipeId, callback) {

    try {
      db.get(
        "SELECT Frk_user FROM Recipe WHERE Id_recipe = ?",
        [recipeId],
        (err, row) => {
          if (err) {
            callback(err, null);
            return;
          }
          if (!row) {
            callback(null, null); // Recipe not found
            return;
          }

          const userId = row.Frk_user;
          UserModel.getUserById(userId, callback);
        }
      );

    } catch (err) {

      console.error("Error retrieving get User By Recipe Id: " + recipeId, err);
      callback(err, null);
    }
  }

  static getRecipesByUserId(userId, callback) {

    db.all("SELECT * FROM Recipe WHERE Frk_user = ?", [userId], (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      }
      const recipes = rows.map((row) => {
        return new Recipe(
          row.Id_recipe,
          row.Nom_Recipe,
          row.Icon_recipe,
          row.Fav_recipe,
          row.unique_key_recipe,
          row.Frk_user
        );
      });
      callback(null, recipes);
    });

  }

  static getRecipesByUsernameUser(username, callback) {

    console.log(username);
    UserModel.getUserByUsername(username, (err, user) => {
      if (err) {
        callback(err, null);
        return;
      }
      if (!user) {
        callback(null, null); // user not found
        return;
      }
      //res.json(user);
      const id = user.id;
      console.log(id);
      db.all("SELECT * FROM Recipe WHERE Frk_user = ?", [id], (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        const recipes = rows.map((row) => {
          return new Recipe(
            row.Id_recipe,
            row.Nom_Recipe,
            row.Icon_recipe,
            row.Fav_recipe,
            row.unique_key_recipe,
            row.Frk_user
          );
        });
        callback(null, recipes);
      });

    });
  }

  static searchRecipes(Nom_Recipe, callback) {
    const fuzzyTerm = `%${Nom_Recipe}%`;

    db.all(
      "SELECT * FROM Recipe WHERE Nom_Recipe LIKE ?",
      [fuzzyTerm],
      (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        const recipes = rows.map((row) => {
          return new Recipe(
            row.Id_recipe,
            row.Nom_Recipe,
            row.Icon_recipe,
            row.Fav_recipe,
            row.unique_key_recipe,
            row.Frk_user
          );
        });
        callback(null, recipes);
      }
    );

  }

  static checkexist(recipeData, callback) {
    const { recipe } = recipeData;
    const uniqueKey = recipe.unique_key;

    db.get(
      `SELECT Id_recipe FROM Recipe WHERE unique_key_recipe = ?`,
      [uniqueKey],
      (err, row) => {
        if (err) {
          console.error("Error retrieving recipe ID:", err);
          return callback(err);
        }

        if (!row) {
          // Not found → return 201
          console.log("Recipe does not exist, should insert:", uniqueKey);
          return callback(null, { status: 201, recipeId: null });
        }

        // Found → return 200
        console.log("✅ Recipe exists:", row.Id_recipe);
        return callback(null, { status: 200, recipeId: row.Id_recipe });
      }
    );
  }


  static updateRecipeWithDetails(recipeData, callback) {
    const { recipe, detail_recipe, ingredients, reviews, steps } = recipeData;
    const uniqueKey = recipe.unique_key;

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // تحقق واش الوصفة كاينة
      db.get(
        `SELECT Id_recipe FROM Recipe WHERE unique_key_recipe = ?`,
        [uniqueKey],
        (err, recipeRow) => {
          if (err) {
            db.run("ROLLBACK");
            return callback(err);
          }

          if (!recipeRow) {
            console.log(`Recipe not found. Inserting instead: ${uniqueKey}`);
            db.run("ROLLBACK", (err) => {
              if (err) return callback(err);
              // now it's safe to call insert
              this.insertRecipeWithDetails(recipeData, callback);
            });
            return;
          }


          const recipeId = recipeRow.Id_recipe;
          console.log("Updating recipe with ID:", recipeId);


          // تحديث جدول الوصفات
          db.run(
            `UPDATE Recipe
             SET Nom_Recipe = ?, Fav_recipe = ?
             WHERE Id_recipe = ?`,
            [recipe.name, recipe.fav, uniqueKey],
            (err) => {
              if (err) {
                db.run("ROLLBACK");
                return callback(err);
              }
              console.log("Updating>>");
              db.run(
                `UPDATE Detail_recipe
                  SET Dt_recipe = ?, Dt_recipe_time = ?, Rate_recipe = ?, 
                  Level_recipe = ?, Calories_recipe = ?
                  WHERE FRK_recipe = ?`,
                [
                  detail_recipe.detail,
                  detail_recipe.time,
                  detail_recipe.rate,
                  detail_recipe.level,
                  detail_recipe.calories,
                  recipeId,
                ],
                function (err) {
                  if (err) {
                    db.run("ROLLBACK");
                    return callback(err);
                  }
                  console.log("Updating>>>");
                  // 🔍 Get the ID back
                  db.get(
                    `SELECT Id_detail_recipe FROM Detail_recipe WHERE FRK_recipe = ?`,
                    [recipeId],
                    (err, detailRow) => {
                      if (err) {
                        db.run("ROLLBACK");
                        return callback(err);
                      }
                      console.log("Updating>>>>");
                      const detailId = detailRow ? detailRow.Id_detail_recipe : null;
                      console.log("Detail ID:", detailId);
                      console.log("Updating>>>>>>");
                      // ✅ تحديث المكونات
                      Recipe.updateIngredients(db, ingredients, detailId, (err) => {
                        if (err) {
                          db.run("ROLLBACK");
                          return callback(err);
                        }

                        // ✅ تحديث الخطوات
                        Recipe.updateSteps(db, steps, recipeId, (err) => {
                          if (err) {
                            db.run("ROLLBACK");
                            return callback(err);
                          }

                          db.run("COMMIT", (err) => {
                            if (err) {
                              return callback(err);
                            }
                            console.log("Recipe updated successfully:", uniqueKey);
                            callback(null, uniqueKey);
                          });
                        });
                      });
                    }
                  );
                }
              );
            }
          );
        });
    });
  }

  static updateIngredients(db, ingredients, recipeId, callback) {
    try {
      db.run(
        `DELETE FROM Ingredient WHERE FRK_recipe = ?`,
        [recipeId],
        (err) => {
          if (err) {
            return callback(err);
          }

          // Insert new ingredients after deletion
          Recipe.insertIngredients(db, ingredients, recipeId, callback);
        }
      );
    } catch (err) {
      console.error("Error updating Ingredients", err);
      callback(err, null);
    }
  }

  static updateSteps(db, steps, recipeId, callback) {
    try {
      db.run(
        `DELETE FROM Step_recipe WHERE FRK_recipe = ?`,
        [recipeId],
        (err) => {
          if (err) {
            return callback(err);
          }

          // Insert new steps after deletion
          Recipe.insertSteps(db, steps, recipeId, callback);
        }
      );
    } catch (err) {
      console.error("Error updating Steps", err);
      callback(err, null);
    }
  }
  static insertIngredients(db, ingredients, recipeId, callback) {
    try {
      const insertIngredient = db.prepare(
        `INSERT INTO Ingredient (Ingredient_recipe, PoidIngredient_recipe, Unite, FRK_recipe) VALUES (?, ?, ?, ?)`
      );

      let called = false; // ⬅️ باش مانناديش callback بزاف المرات

      ingredients.forEach((ingredient) => {
        insertIngredient.run(
          ingredient.ingredient,
          ingredient.poidIngredient,
          ingredient.unite,
          recipeId,
          (err) => {
            if (err && !called) {
              called = true;
              insertIngredient.finalize(() => { }); // نحاول نسالي الـ statement
              return callback(err);
            }
          }
        );
      });

      insertIngredient.finalize((err) => {
        if (!called) {
          called = true;
          callback(err);
        }
      });
    } catch (err) {
      console.error("Error insert Ingredients", err);
      callback(err);
    }
  }

  static insertReviews(db, reviews, recipeId, callback) {
    try {
      const insertReview = db.prepare(
        `INSERT INTO Review_recipe (Detail_Review_recipe, Rate_Review_recipe, FRK_recipe) VALUES (?, ?, ?)`
      );
      reviews.forEach((review) => {
        insertReview.run(
          review.detailReview,
          review.rateReview,
          recipeId,
          (err) => {
            if (err) {
              callback(err);
              return; // Return to avoid further iterations
            }
          }
        );
      });
      insertReview.finalize(callback); // Return from finalize to ensure it's not called multiple times
    } catch (err) {
      console.error("Error insert Reviews", err);
      callback(err, null);
    }
  }

  static insertSteps(db, steps, recipeId, callback) {
    try {
      const insertStep = db.prepare(
        `INSERT INTO Step_recipe (Detail_Step_recipe, Image_Step_recipe, Time_Step_recipe, FRK_recipe) VALUES (?, ?, ?, ?)`
      );
      steps.forEach((step) => {
        insertStep.run(
          step.detailStep,
          step.imageStep,
          step.timeStep,
          recipeId,
          (err) => {
            if (err) {
              callback(err);
              return; // Return to avoid further iterations
            }
          }
        );
      });
      insertStep.finalize(callback); // Return from finalize to ensure it's not called multiple times
    } catch (err) {
      console.error("Error insert Steps", err);
      callback(err, null);
    }
  }



  static deleteRecipe(recipeId, callback) {

    db.run(
      "DELETE FROM Recipe WHERE Id_recipe = ?",
      [recipeId],
      function (err) {
        if (err) {
          callback(err);
          return;
        }
        if (this.changes === 0) {
          callback(null, false); // Recipe not found or not deleted
          return;
        }
        callback(null, true); // Recipe deleted successfully
      }
    );

  }

  // Add a method to get the User associated with this Recipe
  getUser(callback) {
    UserModel.getUserById(this.userId, callback);
  }

  // Add more methods as needed
}

module.exports = Recipe;
