const { Pool } = require('pg'); // Import PostgreSQL pool

class ReviewRecipe {
  constructor(id, detailReview, rateReview, recipeId) {
    this.id = id;
    this.detailReview = detailReview;
    this.rateReview = rateReview;
    this.recipeId = recipeId;
  }

  // PostgreSQL connection pool
  static pool = new Pool({
    connectionString: process.env.POSTGRES_URL_LOCAL, // Your PostgreSQL connection string
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Create a new review recipe
  static async createReviewRecipe(detailReview, rateReview, recipeId, callback) {
    try {
      const client = await ReviewRecipe.pool.connect();
      const result = await client.query(
        'INSERT INTO reviewrecipes (comment, rating, recipe_id) VALUES ($1, $2, $3) RETURNING *',
        [detailReview, rateReview, recipeId]
      );

      const newReviewRecipe = new ReviewRecipe(
        result.rows[0].id_review_recipe,
        result.rows[0].comment,
        result.rows[0].rating,
        result.rows[0].recipe_id
      );

      callback(null, newReviewRecipe);
      client.release();
    } catch (err) {
      console.error('Error creating review recipe:', err);
      callback(err, null);
    }
  }

  // Get all review recipes
  static async getAllReviewRecipes(callback) {
    try {
      const client = await ReviewRecipe.pool.connect();
      const result = await client.query('SELECT * FROM reviewrecipes');
      const reviewRecipes = result.rows.map((row) => {
        return new ReviewRecipe(
          row.id_review_recipe,
          row.comment,
          row.rating,
          row.recipe_id
        );
      });

      callback(null, reviewRecipes);
      client.release();
    } catch (err) {
      console.error('Error getting all review recipes:', err);
      callback(err, null);
    }
  }

  // Get reviews by recipe ID
  static async getReviewsByRecipeId(recipeId, callback) {
    try {
      const client = await ReviewRecipe.pool.connect();
      const result = await client.query(
        'SELECT * FROM reviewrecipes WHERE recipe_id = $1',
        [recipeId]
      );

      const reviews = result.rows.map((row) => {
        return new ReviewRecipe(
          row.id_review_recipe,
          row.comment,
          row.rating,
          row.recipe_id
        );
      });

      callback(null, reviews);
      client.release();
    } catch (err) {
      console.error('Error getting reviews by recipe ID:', err);
      callback(err, null);
    }
  }

  // Update a review recipe
  static async updateReviewRecipe(reviewId, detailReview, rateReview, recipeId, callback) {
    try {
      const client = await ReviewRecipe.pool.connect();
      const result = await client.query(
        'UPDATE reviewrecipes SET comment = $1, rating = $2, recipe_id = $3 WHERE id_review_recipe = $4 RETURNING *',
        [detailReview, rateReview, recipeId, reviewId]
      );

      if (result.rowCount === 0) {
        callback(null, null); // Review recipe not found or not updated
        client.release();
        return;
      }

      const updatedReviewRecipe = new ReviewRecipe(
        result.rows[0].id_review_recipe,
        result.rows[0].comment,
        result.rows[0].rating,
        result.rows[0].recipe_id
      );

      callback(null, updatedReviewRecipe);
      client.release();
    } catch (err) {
      console.error('Error updating review recipe:', err);
      callback(err, null);
    }
  }

  // Delete a review recipe
  static async deleteReviewRecipe(reviewId, callback) {
    try {
      const client = await ReviewRecipe.pool.connect();
      const result = await client.query(
        'DELETE FROM reviewrecipes WHERE id_review_recipe = $1',
        [reviewId]
      );

      if (result.rowCount === 0) {
        callback(null, false); // Review recipe not found or not deleted
        client.release();
        return;
      }

      callback(null, true); // Review recipe deleted successfully
      client.release();
    } catch (err) {
      console.error('Error deleting review recipe:', err);
      callback(err, null);
    }
  }
}

module.exports = ReviewRecipe;
