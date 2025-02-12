const pool = require("../../data/database");
const Recipe = require("../Model/Recipe"); // Import the Recipe model

class ReviewRecipe {
  constructor(id, detailReview, rateReview, recipeId) {
    this.id = id;
    this.detailReview = detailReview;
    this.rateReview = rateReview;
    this.recipeId = recipeId;
  }

  static createReviewRecipe(detailReview, rateReview, recipeId, callback) {
    const query = `
      INSERT INTO "ReviewRecipe" ("Detail_review_recipe", "Rate_review_recipe", "FRK_recipe")
      VALUES ($1, $2, $3)
      RETURNING "Id_review_recipe", "Detail_review_recipe", "Rate_review_recipe", "FRK_recipe"
    `;
    const values = [detailReview, rateReview, recipeId];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      const row = result.rows[0];
      const newReviewRecipe = new ReviewRecipe(
        row.Id_review_recipe,
        row.Detail_review_recipe,
        row.Rate_review_recipe,
        row.FRK_recipe
      );
      callback(null, newReviewRecipe);
    });
  }

  static getAllReviewRecipes(callback) {
    const query = `SELECT * FROM "ReviewRecipe"`;

    pool.query(query, (err, result) => {
      if (err) {
        callback(err, null);
        return;
      }
      const reviewRecipes = result.rows.map((row) => {
        return new ReviewRecipe(
          row.Id_review_recipe,
          row.Detail_review_recipe,
          row.Rate_review_recipe,
          row.FRK_recipe
        );
      });
      callback(null, reviewRecipes);
    });
  }

  static getReviewsByRecipeId(recipeId, callback) {
    const query = `SELECT * FROM "ReviewRecipe" WHERE "FRK_recipe" = $1`;
    const values = [recipeId];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err, null);
        return;
      }
      const reviews = result.rows.map((row) => {
        return new ReviewRecipe(
          row.Id_review_recipe,
          row.Detail_review_recipe,
          row.Rate_review_recipe,
          row.FRK_recipe
        );
      });
      callback(null, reviews);
    });
  }

  static updateReviewRecipe(reviewId, detailReview, rateReview, recipeId, callback) {
    const query = `
      UPDATE "ReviewRecipe"
      SET "Detail_review_recipe" = $1, "Rate_review_recipe" = $2, "FRK_recipe" = $3
      WHERE "Id_review_recipe" = $4
      RETURNING "Id_review_recipe", "Detail_review_recipe", "Rate_review_recipe", "FRK_recipe"
    `;
    const values = [detailReview, rateReview, recipeId, reviewId];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      if (result.rowCount === 0) {
        callback(null, null); // Review recipe not found
        return;
      }
      const row = result.rows[0];
      const updatedReviewRecipe = new ReviewRecipe(
        row.Id_review_recipe,
        row.Detail_review_recipe,
        row.Rate_review_recipe,
        row.FRK_recipe
      );
      callback(null, updatedReviewRecipe);
    });
  }

  static deleteReviewRecipe(reviewId, callback) {
    const query = `DELETE FROM "ReviewRecipe" WHERE "Id_review_recipe" = $1`;
    const values = [reviewId];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      const isDeleted = result.rowCount > 0; // True if a row was deleted, false otherwise
      callback(null, isDeleted);
    });
  }
}

module.exports = ReviewRecipe;
