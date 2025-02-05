const { Pool } = require("pg");
const UserModel = require("./User");
const DetailRecipeModel = require("./Detail_recipe");
const IngredientModel = require("./Ingredient");
const ReviewModel = require("./Review_recipe");
const StepModel = require("./Step_recipe");


class Recipe {
  constructor(id, name, icon, fav, unique_key, userId) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.fav = fav;
    this.unique_key = unique_key;
    this.userId = userId;
  }

  static pool = new Pool({
    connectionString: process.env.POSTGRES_URL_LOCAL, // Your PostgreSQL connection string
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  static async createRecipe(name, icon, fav, unique_key, userId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO recipes (name, icon, fav, unique_key, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, icon, fav, unique_key, userId]
      );
      return new Recipe(
        result.rows[0].id_recipe,
        result.rows[0].name,
        result.rows[0].icon,
        result.rows[0].fav,
        result.rows[0].unique_key,
        result.rows[0].user_id
      );
    } catch (err) {
      console.error("Error creating recipe:", err);
      throw err;
    } finally {
      client.release();
    }
  }

  static async getRecipeById(id) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM recipes WHERE id_recipe = $1`,
        [id]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return new Recipe(row.id_recipe, row.name, row.icon, row.fav, row.unique_key, row.user_id);
    } catch (err) {
      console.error("Error fetching recipe by ID:", err);
      throw err;
    } finally {
      client.release();
    }
  }

  static async getAllFullRecipesByUsername(username) {
    const client = await this.pool.connect();
    try {
      const user = await UserModel.getUserByUsername(username);
      if (!user) return null;
      const userId = user.id_user;

      const sql = `
        SELECT r.*, dr.*, ir.*, sr.*, rr.*
        FROM recipes r
        LEFT JOIN detailrecipes dr ON r.id_recipe = dr.recipe_id
        LEFT JOIN ingredientrecipes ir ON dr.id_detail_recipe = ir.detail_recipe_id
        LEFT JOIN steprecipes sr ON r.id_recipe = sr.recipe_id
        LEFT JOIN reviewrecipes rr ON r.id_recipe = rr.recipe_id
        WHERE r.user_id = $1
      `;

      const result = await client.query(sql, [userId]);
      return result.rows;
    } catch (err) {
      console.error("Error retrieving recipes by username:", err);
      throw err;
    } finally {
      client.release();
    }
  }

  static async getRecipesByUsernameUser(username) {
    const client = await this.pool.connect();
    try {
      console.log("Fetching user by username:", username);

      // Fetch user ID by username
      const userResult = await client.query(
        "SELECT id_user FROM users WHERE username = $1",
        [username]
      );

      if (userResult.rows.length === 0) {
        return null; // User not found
      }

      const userId = userResult.rows[0].id_user;
      console.log("User ID:", userId);

      // Fetch recipes by user ID
      const recipeResult = await client.query(
        "SELECT * FROM recipes WHERE user_id = $1",
        [userId]
      );

      const recipes = recipeResult.rows.map((row) => ({
        id: row.id_recipe,
        name: row.name,
        icon: row.icon,
        fav: row.fav,
        uniqueKey: row.unique_key,
        userId: row.user_id,
      }));

      return recipes; // Return the recipes
    } catch (err) {
      console.error("Error fetching recipes by username:", err);
      throw err; // Throw error to be handled in the route handler
    } finally {
      await client.release(); // Release the connection
    }
  }



  static async insertRecipeWithDetails(recipeData) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const { recipe, detail_recipe, ingredients, reviews, steps } = recipeData;

      const recipeResult = await client.query(
        `INSERT INTO recipes (name, icon, fav, unique_key, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id_recipe`,
        [recipe.name, recipe.icon, recipe.fav, recipe.unique_key, recipe.userId]
      );
      const recipeId = recipeResult.rows[0].id_recipe;

      await client.query(
        `INSERT INTO detailrecipes (description, level, preparation_time, rating, calories, recipe_id) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          detail_recipe.description,
          detail_recipe.level,
          detail_recipe.preparation_time,
          detail_recipe.rating,
          detail_recipe.calories,
          recipeId,
        ]
      );

      for (const ingredient of ingredients) {
        await client.query(
          `INSERT INTO ingredientrecipes (name, quantity, unit, detail_recipe_id) VALUES ($1, $2, $3, (SELECT id_detail_recipe FROM detailrecipes WHERE recipe_id = $4))`,
          [ingredient.name, ingredient.quantity, ingredient.unit, recipeId]
        );
      }

      for (const step of steps) {
        await client.query(
          `INSERT INTO steprecipes (description, image, time, recipe_id) VALUES ($1, $2, $3, $4)`,
          [step.description, step.image, step.time, recipeId]
        );
      }

      await client.query("COMMIT");
      return recipeId;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error inserting recipe with details:", err);
      throw err;
    } finally {
      client.release();
    }
  }

  static async getRecipesByConditions(conditions, callback) {
    const client = await this.pool.connect();
    try {
      let query = `
        SELECT 
          recipes.*, 
          detailrecipes.*, 
          ingredientrecipes.*, 
          steprecipes.*, 
          reviewrecipes.*
        FROM recipes
        LEFT JOIN detailrecipes ON recipes.id_recipe = detailrecipes.recipe_id
        LEFT JOIN ingredientrecipes ON recipes.id_recipe = ingredientrecipes.detail_recipe_id
        LEFT JOIN steprecipes ON recipes.id_recipe = steprecipes.recipe_id
        LEFT JOIN reviewrecipes ON recipes.id_recipe = reviewrecipes.recipe_id`;

      let params = [];
      let whereClauseAdded = false;

      // Check if searchText is provided
      if (conditions.searchText) {
        const searchPattern = `%${conditions.searchText}%`;  // Create search pattern with wildcards

        // If searchText is provided, the WHERE clause needs to start here
        query += ` WHERE (
          recipes.name ILIKE ? AND
          detailrecipes.description ILIKE ? AND
          ingredientrecipes.name ILIKE ? AND
          steprecipes.description ILIKE ? AND
          reviewrecipes.comment ILIKE ?
        )`;  // Use OR to search across multiple columns

        // Add search parameters for the LIKE conditions
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        whereClauseAdded = true;  // Mark WHERE clause as added
      }

      // Add additional conditions (if any)
      for (const [key, value] of Object.entries(conditions)) {
        if (key !== "searchText") {
          // Add AND if it's the second condition or later
          if (!whereClauseAdded) {
            query += " WHERE";  // If no WHERE clause yet, start it here
            whereClauseAdded = true;
          } else {
            query += " AND";  // Add AND for subsequent conditions
          }
          query += ` ${key} LIKE ?`;  // Add the dynamic condition
          params.push(`%${value}%`);
        }
      }

      // Execute the query
      const { rows } = await client.query(query, params);

      // Use a Set to filter duplicate recipes based on a unique identifier
      const recipeSet = new Set();
      rows.forEach((row) => {
        const recipe = {
          id: row.id_recipe,
          name: row.name,
          icon: row.icon,
          fav: row.fav,
          unique_key: row.unique_key,
          userId: row.user_id,
        };
        // Use JSON.stringify to compare recipe objects as strings and filter duplicates
        recipeSet.add(JSON.stringify(recipe));
      });

      // Convert the set back to an array of unique recipes
      const uniqueRecipes = Array.from(recipeSet).map(JSON.parse);

      callback(null, uniqueRecipes);
    } catch (err) {
      console.error("Error getting recipes by conditions:", err);
      callback(err, null);
    } finally {
      client.release(); // Ensure the database connection is released after query execution
    }
  }



  static async getFullRecipeById(id) {
    const client = await this.pool.connect();
    try {
      const sql = `
        SELECT 
          recipes.id_recipe, recipes.icon AS recipe_icon, recipes.fav, recipes.name AS recipe_name, recipes.unique_key, recipes.user_id,
          users.id_user, users.username, users.firstname, users.lastname, users.birthday, users.email, users.phone_number, 
          users.icon AS user_icon, users.grade, users.status, users.url_image,
          detailrecipes.id_detail_recipe, detailrecipes.description AS detail_description, detailrecipes.level, 
          detailrecipes.preparation_time, detailrecipes.rating AS detail_rating, detailrecipes.calories,
          ingredientrecipes.id_ingredient_recipe, ingredientrecipes.name AS ingredient_name, ingredientrecipes.quantity, ingredientrecipes.unit,
          steprecipes.id_step_recipe, steprecipes.description AS step_description, steprecipes.image AS step_image, steprecipes.time AS step_time,
          reviewrecipes.id_review_recipe, reviewrecipes.comment AS review_comment, reviewrecipes.rating AS review_rating
        FROM recipes
        LEFT JOIN users ON recipes.user_id = users.id_user
        LEFT JOIN detailrecipes ON recipes.id_recipe = detailrecipes.recipe_id
        LEFT JOIN ingredientrecipes ON detailrecipes.id_detail_recipe = ingredientrecipes.detail_recipe_id
        LEFT JOIN steprecipes ON recipes.id_recipe = steprecipes.recipe_id
        LEFT JOIN reviewrecipes ON recipes.id_recipe = reviewrecipes.recipe_id
        WHERE recipes.id_recipe = $1
      `;

      const result = await client.query(sql, [id]);
      const rows = result.rows;

      if (!rows || rows.length === 0) {
        return null; // Recipe not found
      }

      // Build user data
      const user = {
        id: rows[0].id_user,
        username: rows[0].username,
        firstName: rows[0].firstname,
        lastName: rows[0].lastname,
        birthday: rows[0].birthday,
        email: rows[0].email,
        phoneNumber: rows[0].phone_number,
        icon: rows[0].user_icon,
        grade: rows[0].grade,
        status: rows[0].status,
        urlImage: rows[0].url_image,
      };

      // Build main recipe data
      const recipe = {
        id: rows[0].id_recipe,
        name: rows[0].recipe_name,
        icon: rows[0].recipe_icon,
        favorite: rows[0].fav,
        uniqueKey: rows[0].unique_key,
        userId: rows[0].user_id,
      };

      // Build detailed recipe data
      const detailRecipe = {
        id: rows[0].id_detail_recipe,
        description: rows[0].detail_description,
        level: rows[0].level,
        preparationTime: rows[0].preparation_time,
        rating: rows[0].detail_rating,
        calories: rows[0].calories,
      };

      // Use Sets to ensure uniqueness
      const ingredientSet = new Set();
      const reviewSet = new Set();
      const stepSet = new Set();

      rows.forEach((row) => {
        // Add unique ingredients
        if (row.id_ingredient_recipe) {
          ingredientSet.add(
            JSON.stringify({
              id: row.id_ingredient_recipe,
              name: row.ingredient_name,
              quantity: row.quantity,
              unit: row.unit,
            })
          );
        }

        // Add unique reviews
        if (row.id_review_recipe) {
          reviewSet.add(
            JSON.stringify({
              id: row.id_review_recipe,
              comment: row.review_comment,
              rating: row.review_rating,
            })
          );
        }

        // Add unique steps
        if (row.id_step_recipe) {
          stepSet.add(
            JSON.stringify({
              id: row.id_step_recipe,
              description: row.step_description,
              image: row.step_image,
              time: row.step_time,
            })
          );
        }
      });

      // Convert Sets to Arrays
      const ingredients = Array.from(ingredientSet).map(JSON.parse);
      const reviews = Array.from(reviewSet).map(JSON.parse);
      const steps = Array.from(stepSet).map(JSON.parse);

      // Return all the data
      return {
        recipe,
        user,
        detailRecipe,
        ingredients,
        reviews,
        steps,
      };
    } catch (err) {
      console.error(`Error retrieving full recipe by ID (${id}):`, err);
      throw err;
    } finally {
      client.release();
    }
  }




  static async deleteImage(pathImage) {
    const filePathToDelete = `./public/data/uploads/${pathImage}`;
    try {
      if (fs.existsSync(filePathToDelete)) {
        fs.unlinkSync(filePathToDelete);
        return 'File deleted successfully.';
      } else {
        throw new Error('File does not exist.');
      }
    } catch (error) {
      throw error;
    }
  }

  static async updateRecipeImage(uniqueKey, imageByte) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `SELECT icon FROM recipes WHERE unique_key = $1`,
        [uniqueKey]
      );
      if (rows.length === 0) throw new Error('Recipe not found');
      const oldPath = rows[0].icon;
      await client.query(
        `UPDATE recipes SET icon = $1 WHERE unique_key = $2`,
        [imageByte, uniqueKey]
      );
      await client.query('COMMIT');
      await RecipeModel.deleteImage(oldPath);
      return imageByte;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAllRecipes() {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM recipes');
      return rows;
    } finally {
      client.release();
    }
  }

  static async getUserByRecipeId(recipeId) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(
        'SELECT user_id FROM recipes WHERE id_recipe = $1',
        [recipeId]
      );
      if (rows.length === 0) return null;
      return rows[0];
    } finally {
      client.release();
    }
  }

  static async getRecipesByUserId(userId) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(
        'SELECT * FROM recipes WHERE user_id = $1',
        [userId]
      );
      return rows;
    } finally {
      client.release();
    }
  }

  static async searchRecipes(name) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query(
        'SELECT * FROM recipes WHERE name ILIKE $1',
        [`%${name}%`]
      );
      return rows;
    } finally {
      client.release();
    }
  }

  static async deleteRecipe(recipeId) {
    const client = await this.pool.connect();
    try {
      await client.query('DELETE FROM recipes WHERE id_recipe = $1', [recipeId]);
      return true;
    } finally {
      client.release();
    }
  }
}


module.exports = Recipe;
