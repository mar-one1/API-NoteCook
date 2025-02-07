const pool = require("../../data/database");
const UserModel = require("./User"); // Import the User model
const DetailRecipeModel = require("./Detail_recipe"); // Import the DetailRecipe model
const IngredientModel = require("./Ingredient"); // Import the Ingredient model
const ReviewModel = require("./Review_recipe"); // Import the Review model
const StepModel = require("./Step_recipe"); // Import the Step model
const imageHelper = require("../Router/ImageHelper"); // Import the ImageHelper
const fs = require("fs");
const { log } = require("console");

class Recipe {
  constructor(id, name, icon, fav, unique_key, userId) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.fav = fav;
    this.unique_key = unique_key;
    this.userId = userId;
  }

  static async createRecipe(name, icon, fav, unique_key, userId, callback) {
    const client = await pool.connect(); // Getting a client from the pool
    const query =
      'INSERT INTO "Recipe" ("Nom_Recipe", "Icon_recipe", "Fav_recipe", "unique_key_recipe", "Frk_user") VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [name, icon, fav, unique_key, userId];

    try {
      const result = await pool.query(query, values);
      const newRecipe = new Recipe(
        result.rows[0].id,
        name,
        icon,
        fav,
        unique_key,
        userId
      );
      callback(null, newRecipe);
    } catch (err) {
      console.error("Error creating recipe:", err);
      callback(err, null);
    } finally {
      client.release(); // Release the client back to the pool
    }
  }



  // Helper function to get all image paths from the database
  static async getAllImagePathsFromDatabase() {
    const client = await pool.connect(); // Getting a client from the pool
    const query = 'SELECT "Icon_recipe" FROM "Recipe"'; // Use double quotes for mixed-case identifiers
    try {
      const result = await pool.query(query); // Execute the query
      const paths = result.rows.map((row) => row.Icon_recipe); // Map the rows to extract image paths
      console.log("Paths retrieved from database:", paths);
      return paths; // Return the array of image paths
    } catch (err) {
      console.error("Error getting all image paths from database:", err);
      throw err; // Rethrow the error to be handled by the calling code
    } finally {
      client.release(); // Release the client back to the pool
    }
  }


  static async getRecipeById(id) {
    const client = await pool.connect(); // Get a client from the pool
    const query = 'SELECT * FROM "Recipe" WHERE "Id_recipe" = $1';
    try {
      const result = await client.query(query, [id]); // Use the client to execute the query
      if (result.rows.length === 0) {
        return null; // Recipe not found
      }
      const row = result.rows[0];
      return new Recipe(
        row.Id_recipe,
        row.Nom_Recipe,
        row.Icon_recipe,
        row.Fav_recipe,
        row.unique_key_recipe,
        row.Frk_user
      );
    } catch (err) {
      console.error("Error fetching recipe by ID:", err);
      throw err; // Rethrow the error for higher-level handling
    } finally {
      client.release(); // Ensure the client is released back to the pool
    }
  }



  static getAllFullRecipesByUsername(username, callback) {
    pool.connect((err, client, release) => {
      if (err) {
        console.error("Error acquiring client from pool:", err);
        callback(err, null);
        return;
      }
  
      // Get the user by username
      const userQuery = 'SELECT * FROM "User" WHERE "username" = $1';
      client.query(userQuery, [username], (err, userResult) => {
        if (err) {
          release(); // Release client back to the pool
          callback(err, null);
          return;
        }
  
        if (userResult.rows.length === 0) {
          release();
          callback(null, null); // User not found
          return;
        }
  
        const userId = userResult.rows[0].Id_user;
        console.log(userId);
        
  
        // Main query to fetch all related recipe data
        const recipeQuery = `
          SELECT "Recipe".*, 
                 "DetailRecipe".*, 
                 "IngredientRecipe".*, 
                 "StepRecipe".*, 
                 "ReviewRecipe".*,
                 "FavoriteUserRecipe".*
          FROM "Recipe"
          LEFT JOIN "DetailRecipe" ON "Recipe"."Id_recipe" = "DetailRecipe"."FRK_recipe"
          LEFT JOIN "IngredientRecipe" ON "Recipe"."Id_recipe" = "IngredientRecipe"."FRK_detail_recipe"
          LEFT JOIN "StepRecipe" ON "Recipe"."Id_recipe" = "StepRecipe"."FRK_recipe"
          LEFT JOIN "ReviewRecipe" ON "Recipe"."Id_recipe" = "ReviewRecipe"."FRK_recipe"
          LEFT JOIN "FavoriteUserRecipe" ON "Recipe"."Id_recipe" = "FavoriteUserRecipe"."FRK_recipe"
          WHERE "Recipe"."Frk_user" = $1
        `;
  
        client.query(recipeQuery, [userId], (err, result) => {
          release(); // Release client back to the pool
  
          if (err) {
            callback(err, null);
            return;
          }
  
          const dataMap = new Map();
  
          // Process each row and organize it in a Map
          result.rows.forEach((row) => {
            const recipeId = row.Id_recipe;
  
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
  
            // Add nested entities to the corresponding sets
            const entry = dataMap.get(recipeId);
            entry.ingredients.add(
              JSON.stringify({
                id: row.Id_Ingredient_recipe,
                ingredient: row.Ingredient_recipe,
                poidIngredient: row.PoidIngredient_recipe,
                unite: row.unit,
                recipeId: row.FRK_detail_recipe,
              })
            );
            entry.reviews.add(
              JSON.stringify({
                id: row.Id_Review_recipe,
                detailReview: row.Detail_review_recipe,
                rateReview: row.Rate_review_recipe,
              })
            );
            entry.steps.add(
              JSON.stringify({
                id: row.Id_Step_recipe,
                detailStep: row.Detail_step_recipe,
                imageStep: row.Image_step_recipe,
                timeStep: row.Time_step_recipe,
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
    });
  }
  
  
  
  // Insert recipe with details
  static async insertRecipeWithDetails(recipeData, callback) {


    try {
      // Connect to PostgreSQL
      await client.connect();

      // Begin transaction
      await Recipe.beginTransaction(client);

      const { recipe, detail_recipe, ingredients, reviews, steps } = recipeData;

      // Insert recipe
      const recipeId = await Recipe.insertRecipe(client, recipe);

      // Insert detail recipe
      await Recipe.insertDetailRecipe(client, detail_recipe, recipeId);

      // Insert ingredients
      await Recipe.insertIngredients(client, ingredients, recipeId);

      // Insert steps
      await Recipe.insertSteps(client, steps, recipeId);

      // Insert reviews
      await Recipe.insertReviews(client, reviews, recipeId);

      // Commit transaction
      await Recipe.commitTransaction(client);

      console.log("Recipe inserted successfully with ID:", recipeId);
      callback(null, recipeId);
    } catch (err) {
      // Rollback transaction if an error occurs
      await Recipe.rollbackTransaction(client);
      console.error("Error creating recipe:", err);
      callback(err);
    } finally {
      await client.end(); // Close the connection to PostgreSQL
    }
  }

  // Helper function to begin a transaction
  static async beginTransaction(client) {
    return client.query('BEGIN');
  }

  // Helper function to commit a transaction
  static async commitTransaction(client) {
    return client.query('COMMIT');
  }

  // Helper function to rollback a transaction
  static async rollbackTransaction(client) {
    return client.query('ROLLBACK');
  }

  // Insert recipe into Recipe table
  static async insertRecipe(client, recipe) {
    const result = await client.query(
      `INSERT INTO "Recipe" ("Nom_Recipe", "Icon_recipe", "Fav_recipe", "unique_key_recipe", "Frk_user")
       VALUES ($1, $2, $3, $4, $5) RETURNING Id_recipe`,
      [recipe.name, recipe.icon, recipe.fav, recipe.unique_key, recipe.userId]
    );
    return result.rows[0].recipe_id;
  }

  // Insert detail recipe into Detail_recipe table
  static async insertDetailRecipe(client, detail_recipe, recipeId) {
    await client.query(
      `INSERT INTO "DetailRecipe" ("Dt_recipe", "Dt_recipe_time", "Rate_recipe", "Level_recipe", "Calories_recipe", "FRK_recipe")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        detail_recipe.detail,
        detail_recipe.time,
        detail_recipe.rate,
        detail_recipe.level,
        detail_recipe.calories,
        recipeId
      ]
    );
  }

  // Insert ingredients into Ingredient table
  static async insertIngredients(client, ingredients, recipeId) {
    const promises = ingredients.map((ingredient) =>
      client.query(
        `INSERT INTO "IngredientRecipe" ("Ingredient_recipe", "PoidIngredient_recipe", "Unite", "FRK_recipe")
         VALUES ($1, $2, $3, $4)`,
        [ingredient.ingredient, ingredient.poidIngredient, ingredient.unite, recipeId]
      )
    );
    await Promise.all(promises);
  }

  // Insert reviews into Review_recipe table
  static async insertReviews(client, reviews, recipeId) {
    const promises = reviews.map((review) =>
      client.query(
        `INSERT INTO "ReviewRecipe" ("Detail_Review_recipe", "Rate_Review_recipe", "FRK_recipe")
         VALUES ($1, $2, $3)`,
        [review.detailReview, review.rateReview, recipeId]
      )
    );
    await Promise.all(promises);
  }

  // Insert steps into Step_recipe table
  static async insertSteps(client, steps, recipeId) {
    const promises = steps.map((step) =>
      client.query(
        `INSERT INTO "StepRecipe" ("Detail_Step_recipe", "Image_Step_recipe", "Time_Step_recipe", "FRK_recipe")
         VALUES ($1, $2, $3, $4)`,
        [step.detailStep, step.imageStep, step.timeStep, recipeId]
      )
    );
    await Promise.all(promises);
  }


  static async getRecipesByConditions(conditions, callback) {
    const client = await pool.connect(); // Getting a client from the pool
    try {
      let query = `
        SELECT 
          "Recipe".*, 
          "DetailRecipe".*, 
          "IngredientRecipe".*, 
          "StepRecipe".*, 
          "ReviewRecipe".*
        FROM "Recipe"
        LEFT JOIN "DetailRecipe" ON "Recipe"."Id_recipe" = "DetailRecipe"."FRK_recipe"
        LEFT JOIN "IngredientRecipe" ON "Recipe"."Id_recipe" = "IngredientRecipe"."FRK_detail_recipe"
        LEFT JOIN "StepRecipe" ON "Recipe"."Id_recipe" = "StepRecipe"."FRK_recipe"
        LEFT JOIN "ReviewRecipe" ON "Recipe"."Id_recipe" = "ReviewRecipe"."FRK_recipe"`;

      let params = [];
      let whereClauseAdded = false;

      // Check if searchText is provided
      if (conditions.searchText) {
        query += ` WHERE (
          "Recipe"."Nom_Recipe" ILIKE $1 OR
          "DetailRecipe"."Dt_recipe" ILIKE $1 OR
          "IngredientRecipe"."Ingredient_recipe" ILIKE $1 OR
          "StepRecipe"."Detail_step_recipe" ILIKE $1 OR
          "ReviewRecipe"."Detail_review_recipe" ILIKE $1
        )`;
        params.push(`%${conditions.searchText}%`);
        whereClauseAdded = true;
      }

      // Add other conditions dynamically
      for (const key in conditions) {
        if (key !== "searchText") {
          if (!whereClauseAdded) {
            query += " WHERE";
            whereClauseAdded = true;
          } else {
            query += " AND";
          }
          query += ` "${key}" ILIKE $${params.length + 1}`;
          params.push(`%${conditions[key]}%`);
        }
      }

      // Execute the query
      const result = await client.query(query, params);

      // Process the rows to remove duplicates
      const recipeSet = new Set();
      result.rows.forEach((row) => {
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

      // Return the results
      callback(null, uniqueRecipes);
    } catch (err) {
      console.error("Error getting recipes by conditions:", err);
      callback(err, null);
    } finally {
      // Close the database connection
      client.release();  // Release the client back to the pool
    }
  }

  static async getFullRecipeById(id, callback) {
    const client = await pool.connect(); // Getting a client from the pool
    try {
      const sql = `
        SELECT 
          "Recipe".*, 
          "User".*, 
          "DetailRecipe".*, 
          "IngredientRecipe".*, 
          "StepRecipe".*, 
          "ReviewRecipe".* 
        FROM "Recipe"
        LEFT JOIN "User" ON "Recipe"."Frk_user" = "User"."Id_user"
        LEFT JOIN "DetailRecipe" ON "Recipe"."Id_recipe" = "DetailRecipe"."FRK_recipe"
        LEFT JOIN "IngredientRecipe" ON "Recipe"."Id_recipe" = "IngredientRecipe"."FRK_detail_recipe"
        LEFT JOIN "StepRecipe" ON "Recipe"."Id_recipe" = "StepRecipe"."FRK_recipe"
        LEFT JOIN "ReviewRecipe" ON "Recipe"."Id_recipe" = "ReviewRecipe"."FRK_recipe"
        WHERE "Recipe"."Id_recipe" = $1
      `;
  
      const result = await client.query(sql, [id]);
  
      if (result.rows.length === 0) {
        callback(null, null); // Recipe not found
        return;
      }
  
      const row = result.rows[0];
  
      // Create instances for the user, recipe, and detail
      const user = new UserModel(
        row.Id_user,
        row.username,
        row.Firstname_user,
        row.Lastname_user,
        row.Birthday_user,
        row.Email_user,
        row.Phonenumber_user,
        row.Icon_user,
        row.password,
        row.Grade_user,
        row.Status_user,
        row.Url_image
      );
  
      const recipe = new Recipe(
        row.Id_recipe,
        row.Nom_Recipe,
        row.Icon_recipe,
        row.Fav_recipe,
        row.unique_key_recipe,
        row.Frk_user
      );
  
      const detail_recipe = new DetailRecipeModel(
        row.Id_detail_recipe,
        row.Dt_recipe,
        row.Dt_recipe_time,
        row.Rate_recipe,
        row.Level_recipe,
        row.Calories_recipe,
        row.FRK_recipe
      );
  
      // Create sets to ensure uniqueness for ingredients, reviews, and steps
      const ingredientSet = new Set();
      const reviewSet = new Set();
      const stepSet = new Set();
  
      result.rows.forEach((row) => {
        // Ensure uniqueness for each entity type
        ingredientSet.add(
          JSON.stringify({
            id: row.Id_Ingredient_recipe,
            ingredient: row.Ingredient_recipe,
            poidIngredient: row.PoidIngredient_recipe_recipe,
            unite: row.unit,
            recipeId: row.FRK_recipe,
          })
        );
  
        reviewSet.add(
          JSON.stringify({
            id: row.Id_review_recipe,
            detailReview: row.Detail_review_recipe,
            rateReview: row.Rate_review_recipe,
            recipeId: row.FRK_recipe,
          })
        );
  
        stepSet.add(
          JSON.stringify({
            id: row.Id_Step_recipe,
            detailStep: row.Detail_step_recipe,
            imageStep: row.Image_step_recipe,
            timeStep: row.Time_step_recipe,
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
    } catch (err) {
      console.error("Error full retrieving recipe by id: " + id, err);
      callback(err, null);
    } finally {
      // Release the PostgreSQL client back to the pool
      client.release();
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


  static async updateRecipeImage(unique, imagebyte, callback = () => { }) {
    const client = await pool.connect();  // Get a client from the pool

    try {
      // Retrieve the current image path from the Recipe table
      const res = await client.query(
        `SELECT "Icon_recipe" FROM "Recipe" WHERE "unique_key_recipe" = $1`,
        [unique]
      );

      if (res.rows.length === 0) {
        return callback(new Error("Recipe not found"));
      }

      const oldPath = res.rows[0].Icon_recipe;

      // Update the Recipe table with the new image byte data
      const updateRes = await client.query(
        `UPDATE "Recipe" SET "Icon_recipe" = $1 WHERE "unique_key_recipe" = $2`,
        [imagebyte, unique]
      );

      if (updateRes.rowCount === 0) {
        return callback(null, null); // Recipe not found or not updated
      }

      console.log("Old Path: ", oldPath);

      // Delete the old image if it exists
      if (oldPath) {
        RecipeService.deleteImage(oldPath, (err, message) => {
          if (err) {
            console.error("Error deleting old image:", err);
            return callback(err);
          }

          console.log(message);
          callback(null, imagebyte);  // Return the updated image byte data
        });
      } else {
        callback(null, imagebyte);  // No old image to delete, return updated data
      }
    } catch (err) {
      console.error("Error updating recipe image:", err);
      callback(err);
    } finally {
      client.release();  // Release the client back to the pool
    }
  }

  static async getAllRecipes(callback) {
    const client = await pool.connect();  // Get a client from the pool

    try {
      const res = await client.query('SELECT * FROM "Recipe"');

      const recipes = res.rows.map((row) => {
        return new Recipe(
          row.Id_recipe,           // Adjust field names as per your PostgreSQL schema
          row.Nom_recipe,          // Adjust field names as per your PostgreSQL schema
          row.Icon_recipe,
          row.Fav_recipe,
          row.unique_key_recipe,
          row.Frk_user
        );
      });

      callback(null, recipes);
    } catch (err) {
      console.error("Error getting all recipes:", err);
      callback(err, null);
    } finally {
      client.release();  // Release the client back to the pool
    }
  }

  static async getUserByRecipeId(recipeId, callback) {
    const client = await pool.connect();  // Get a client from the pool

    try {
      const res = await client.query(
        'SELECT "Frk_user" FROM "Recipe" WHERE "Id_recipe" = $1', 
        [recipeId]
      );

      if (res.rows.length === 0) {
        callback(null, null);  // Recipe not found
        return;
      }

      const userId = res.rows[0].frk_user;
      UserModel.getUserById(userId, callback);  // Use the UserModel to get the user by userId
    } catch (err) {
      console.error('Error retrieving user by recipe ID:', err);
      callback(err, null);
    } finally {
      client.release();  // Release the client back to the pool
    }
  }

  // Get all recipes by user ID
  static async getRecipesByUserId(userId, callback) {
    const client = await pool.connect();  // Get a client from the pool

    try {
      const res = await client.query(
        'SELECT * FROM "Recipe" WHERE "Frk_user" = $1', 
        [userId]
      );

      const recipes = res.rows.map((row) => {
        return new Recipe(
          row.Id_recipe,           // Adjust field names as per your PostgreSQL schema
          row.Nom_recipe,          // Adjust field names as per your PostgreSQL schema
          row.Icon_recipe,
          row.Fav_recipe,
          row.unique_key_recipe,
          row.Frk_user
        );
      });

      callback(null, recipes);
    } catch (err) {
      console.error('Error getting recipes by user ID:', err);
      callback(err, null);
    } finally {
      client.release();  // Release the client back to the pool
    }
  }


  static async getRecipesByUsernameUser(username, callback) {
    const client = await pool.connect(); // Getting a client from the pool
    try {
      console.log(username);
  
      // Get the user by username
      const userResult = await client.query(
        'SELECT * FROM "User" WHERE "username" = $1',
        [username]
      );
  
      if (userResult.rows.length === 0) {
        callback(null, null); // user not found
        return;
      }
  
      const user = userResult.rows[0];
      const id = user.Id_user;
      console.log(id);
  
      // Get the recipes by user ID
      const recipeResult = await client.query(
        'SELECT * FROM "Recipe" WHERE "Frk_user" = $1',
        [id]
      );
  
      const recipes = recipeResult.rows.map((row) => {
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
    } catch (err) {
      console.error("Error getting recipes by username:", err);
      callback(err, null);
    } finally {
      // Release the client back to the pool
      client.release();
    }
  }
  

  static async searchRecipes(Nom_Recipe, callback) {
    const client = await pool.connect(); // Getting a client from the pool
    try {
      const fuzzyTerm = `%${Nom_Recipe}%`;
  
      // Query to search for recipes by name
      const result = await client.query(
        'SELECT * FROM "Recipe" WHERE "Nom_Recipe" ILIKE $1',
        [fuzzyTerm]
      );
  
      const recipes = result.rows.map((row) => {
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
    } catch (err) {
      console.error("Error searching recipes:", err);
      callback(err, null);
    } finally {
      // Release the client back to the pool
      client.release();
    }
  }
  

  static async updateRecipeWithDetails(recipeData, callback) {
    const client = await pool.connect(); // Getting a client from the pool
    try {
      await client.query("BEGIN"); // Start the transaction
  
      const { recipe, detail_recipe, ingredients, reviews, steps } = recipeData;
  
      // Update Recipe
      await client.query(
        `UPDATE "Recipe" 
         SET "Nom_Recipe" = $1, "Fav_recipe" = $2
         WHERE "unique_key_recipe" = $3`,
        [recipe.name, recipe.fav, recipe.unique_key]
      );
  
      const uniqueKey = recipe.unique_key;
  
      // Retrieve the recipe ID using the unique_key_recipe
      const recipeResult = await client.query(
        `SELECT "Id_recipe" FROM "Recipe" WHERE "unique_key_recipe" = $1`,
        [uniqueKey]
      );
  
      if (recipeResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return callback(new Error("Recipe not found"));
      }
  
      const recipeId = recipeResult.rows[0].Id_recipe;
  
      // Update Detail_recipe
      await client.query(
        `UPDATE "DetailRecipe"
         SET "Dt_recipe" = $1, "Dt_recipe_time" = $2, "Rate_recipe" = $3, 
             "Level_recipe" = $4, "Calories_recipe" = $5
         WHERE "FRK_recipe" = $6`,
        [
          detail_recipe.detail,
          detail_recipe.time,
          detail_recipe.rate,
          detail_recipe.level,
          detail_recipe.calories,
          recipeId,
        ]
      );
  
      // Update ingredients
      await Recipe.updateIngredients(client, ingredients, recipeId);
  
      // Update steps
      await Recipe.updateSteps(client, steps, recipeId);
  
      // Commit transaction
      await client.query("COMMIT");
  
      console.log("Recipe updated successfully with unique key:", uniqueKey);
      callback(null, uniqueKey);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error updating recipe:", err);
      callback(err);
    } finally {
      // Release the client back to the pool
      client.release();
    }
  }
  
  static async updateIngredients(client, ingredients, recipeId) {
    try {
      // Delete existing ingredients
      await client.query(
        `DELETE FROM "IngredientRecipe" WHERE "FRK_recipe" = $1`,
        [recipeId]
      );
  
      // Insert new ingredients
      await Recipe.insertIngredients(client, ingredients, recipeId);
    } catch (err) {
      console.error("Error updating ingredients:", err);
      throw err;
    }
  }
  
  static async updateSteps(client, steps, recipeId) {
    try {
      // Delete existing steps
      await client.query(
        `DELETE FROM "StepRecipe" WHERE "FRK_recipe" = $1`,
        [recipeId]
      );
  
      // Insert new steps
      await Recipe.insertSteps(client, steps, recipeId);
    } catch (err) {
      console.error("Error updating steps:", err);
      throw err;
    }
  }
  

  static async deleteRecipe(recipeId, callback) {
    const client = await pool.connect(); // Getting a client from the pool
    try {
      // Start a transaction
      await client.query("BEGIN");
  
      // Delete recipe
      const result = await client.query(
        `DELETE FROM "Recipe" WHERE "Id_recipe" = $1`,
        [recipeId]
      );
  
      if (result.rowCount === 0) {
        await client.query("ROLLBACK");
        return callback(null, false); // Recipe not found or not deleted
      }
  
      // Commit transaction
      await client.query("COMMIT");
  
      callback(null, true); // Recipe deleted successfully
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error deleting recipe:", err);
      callback(err);
    } finally {
      // Release the client back to the pool
      client.release();
    }
  }
  

  // Add a method to get the User associated with this Recipe
  getUser(callback) {
    UserModel.getUserById(this.userId, callback);
  }

  // Add more methods as needed
}

module.exports = Recipe;
