const sqlite3 = require('sqlite3').verbose();
const Recipe = require('../Model/Recipe'); // Import the Recipe model

class ReviewRecipe {
  constructor(id, detailReview, rateReview, recipeId) {
    this.id = id;
    this.detailReview = detailReview;
    this.rateReview = rateReview;
    this.recipeId = recipeId;
  }

  static createReviewRecipe(detailReview, rateReview, recipeId, callback) {
    const db = new sqlite3.Database('DB_Notebook.db');
    db.run(
      'INSERT INTO Review_recipe (Detail_review_recipe, Rate_review_recipe, FRK_recipe) VALUES (?, ?, ?)',
      [detailReview, rateReview, recipeId],
      function (err) {
        if (err) {
          callback(err);
          return;
        }
        const newReviewRecipe = new ReviewRecipe(
          this.lastID,
          detailReview,
          rateReview,
          recipeId
        );
        callback(null, newReviewRecipe);
      }
    );
    db.close();
  }

  static getAllReviewRecipes(callback) {
    const db = new sqlite3.Database('DB_Notebook.db');
    db.all('SELECT * FROM Review_recipe', (err, rows) => {
      if (err) {
        callback(err, null);
        return;
      }
      const reviewRecipes = rows.map((row) => {
        return new ReviewRecipe(
          row.Id_Review_recipe,
          row.Detail_Review_recipe,
          row.Rate_Review_recipe,
          row.FRK_recipe
        );
      });
      callback(null, reviewRecipes);
    });
    db.close();
  }





  static getReviewsByRecipeId(recipeId, callback) {
    const db = new sqlite3.Database('DB_Notebook.db');
    db.all(
      'SELECT * FROM Review_recipe WHERE FRK_recipe = ?',
      [recipeId],
      (err, rows) => {
        if (err) {
          callback(err, null);
          return;
        }
        const reviews = rows.map((row) => {
          return new ReviewRecipe(
            row.Id_Review_recipe,
            row.Detail_Review_recipe,
            row.Rate_Review_recipe,
            row.FRK_recipe
          );
        });
        callback(null, reviews);
      }
    );
    db.close();
  }

static updateReviewRecipe(reviewId, detailReview, rateReview, recipeId, callback) {
  const db = new sqlite3.Database('DB_Notebook.db');
  db.run(
    'UPDATE Review_recipe SET Detail_review_recipe = ?, Rate_review_recipe = ?, FRK_recipe = ? WHERE Id_review_recipe = ?',
    [detailReview, rateReview, recipeId, reviewId],
    function (err) {
      if (err) {
        callback(err);
        return;
      }
      if (this.changes === 0) {
        callback(null, null); // Review recipe not found or not updated
        return;
      }
      const updatedReviewRecipe = new ReviewRecipe(
        reviewId,
        detailReview,
        rateReview,
        recipeId
      );
      callback(null, updatedReviewRecipe);
    }
  );
  db.close();
}

static deleteReviewRecipe(reviewId, callback) {
  const db = new sqlite3.Database('DB_Notebook.db');
  db.run(
    'DELETE FROM Review_recipe WHERE Id_review_recipe = ?',
    [reviewId],
    function (err) {
      if (err) {
        callback(err);
        return;
      }
      if (this.changes === 0) {
        callback(null, false); // Review recipe not found or not deleted
        return;
      }
      callback(null, true); // Review recipe deleted successfully
    }
  );
  db.close();
}
}

module.exports = ReviewRecipe;
