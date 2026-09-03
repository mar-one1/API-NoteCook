const pool = require("../data/database");
const Recipe = require("../Model/Recipe"); // Import the Recipe model

class StepRecipe {
  constructor(id, detailStep, imageStep, timeStep, recipeId) {
    this.id = id;
    this.detailStep = detailStep;
    this.imageStep = imageStep;
    this.timeStep = timeStep;
    this.recipeId = recipeId;
  }

  static createStepRecipe(detailStep, imageStep, timeStep, recipeId, callback) {
    const query = `
      INSERT INTO "StepRecipe" ("Detail_step_recipe", "Image_step_recipe", "Time_step_recipe", "FRK_recipe")
      VALUES ($1, $2, $3, $4)
      RETURNING "Id_step_recipe", "Detail_step_recipe", "Image_step_recipe", "Time_step_recipe", "FRK_recipe"
    `;
    const values = [detailStep, imageStep, timeStep, recipeId];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      const row = result.rows[0];
      const newStepRecipe = new StepRecipe(
        row.id_step_recipe,
        row.detail_step_recipe,
        row.image_step_recipe,
        row.time_step_recipe,
        row.frk_recipe
      );
      callback(null, newStepRecipe);
    });
  }

  static getAllStepRecipes(callback) {
    const query = 'SELECT * FROM "StepRecipe"';

    pool.query(query, (err, result) => {
      if (err) {
        callback(err, null);
        return;
      }
      const stepRecipes = result.rows.map((row) => {
        return new StepRecipe(
          row.Id_step_recipe,
          row.Detail_step_recipe,
          row.Image_step_recipe,
          row.Time_step_recipe,
          row.FRK_recipe
        );
      });
      callback(null, stepRecipes);
    });
  }

  static getStepsByRecipeId(recipeId, callback) {
    const query = 'SELECT * FROM "StepRecipe" WHERE "FRK_recipe" = $1';
    const values = [recipeId];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err, null);
        return;
      }
      const steps = result.rows.map((row) => {
        return new StepRecipe(
          row.Id_step_recipe,
          row.Detail_step_recipe,
          row.Image_step_recipe,
          row.Time_step_recipe,
          row.FRK_recipe
        );
      });
      callback(null, steps);
    });
  }

  static updateStepRecipe(stepId, detailStep, imageStep, timeStep, recipeId, callback) {
    const query = `
      UPDATE "StepRecipe"
      SET "Detail_step_recipe" = $1, "Image_step_recipe" = $2, "Time_step_recipe" = $3, "FRK_recipe" = $4
      WHERE "Id_step_recipe" = $"5"
      RETURNING "Id_step_recipe", "Detail_step_recipe", "Image_step_recipe", "Time_step_recipe", "FRK_recipe"
    `;
    const values = [detailStep, imageStep, timeStep, recipeId, stepId];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      if (result.rowCount === 0) {
        callback(null, null); // Step recipe not found
        return;
      }
      const row = result.rows[0];
      const updatedStepRecipe = new StepRecipe(
        row.Id_step_recipe,
        row.Detail_step_recipe,
        row.Image_step_recipe,
        row.Time_step_recipe,
        row.FRK_recipe
      );
      callback(null, updatedStepRecipe);
    });
  }

  static deleteStepRecipe(stepId, callback) {
    const query = 'DELETE FROM "StepRecipe" WHERE "Id_step_recipe" = $1';
    const values = [stepId];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      const isDeleted = result.rowCount > 0; // True if a row was deleted, false otherwise
      callback(null, isDeleted);
    });
  }


  static async updateStepImage(unique, imagebyte, callback = () => { }) {
    try {
      const res = await pool.query(
        `SELECT "Image_step_recipe" FROM "StepRecipe" WHERE "Image_step_recipe" = $1`,
        [unique]
      );

      if (res.rows.length === 0) {
        return callback(new Error("Step not found"));
      }

      const oldPath = res.rows[0].Icon_recipe;
      const updateRes = await pool.query(
        `UPDATE "StepRecipe" SET "Image_step_recipe" = $1 WHERE "Image_step_recipe" = $2`,
        [imagebyte, unique]
      );

      if (updateRes.rowCount === 0) {
        return callback(null, null); // Recipe not found or not updated
      }

      console.log("Old Path: ", oldPath);
      // Skip update if oldPath is base64 string
      if (oldPath && oldPath.startsWith('data:')) {
        console.log("Old path is base64 data, skipping image update.");
        return callback(null, imagebyte);
      }

      if (oldPath) {
        StepRecipe.deleteimage(oldPath, (err, message) => {
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
    }
  }
  // New method to update step image and delete old one from Cloudinary
  static async updateStepImage(stepId, imageUrl, publicId) {
    try {

      // 1. Get old image public_id
      const res = await pool.query(
        `SELECT cloudinary_image_public_id
       FROM "StepRecipe"
       WHERE "Id_step_recipe" = $1`,
        [stepId]
      );

      if (res.rows.length === 0) {
        throw new Error("Step not found");
      }

      const oldPublicId = res.rows[0].cloudinary_image_public_id;

      // 2. Update DB
      const updateRes = await pool.query(
        `UPDATE "StepRecipe"
       SET "Image_step_recipe" = $1,
           cloudinary_image_public_id = $2
       WHERE "Id_step_recipe" = $3
       RETURNING *`,
        [imageUrl, publicId, stepId]
      );

      // 3. Delete old image from Cloudinary
      if (oldPublicId) {
        const cloudinary = require("../config/cloudinary");

        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
        });
      }

      return updateRes.rows[0];

    } catch (err) {
      console.error("Error updating step image:", err);
      throw err;
    }
  }


  static async updateStepVideo(stepId, videoUrl, publicId) {
    try {

      // get old video public_id
      const res = await pool.query(
        `SELECT cloudinary_video_public_id
       FROM "StepRecipe"
       WHERE "Id_step_recipe" = $1`,
        [stepId]
      );

      if (res.rows.length === 0) {
        throw new Error("Step not found");
      }

      const oldPublicId = res.rows[0].cloudinary_video_public_id;

      // update DB
      const updateRes = await pool.query(
        `UPDATE "StepRecipe"
       SET "Video_step_recipe" = $1,
           cloudinary_video_public_id = $2
       WHERE "Id_step_recipe" = $3
       RETURNING *`,
        [videoUrl, publicId, stepId]
      );

      // delete old video from Cloudinary
      if (oldPublicId) {
        const cloudinary = require("../config/cloudinary");

        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "video", // 🔥 IMPORTANT
        });
      }

      return updateRes.rows[0];

    } catch (err) {
      console.error("Error updating step video:", err);
      throw err;
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
      console.error("Error deleting image step: " + filePathToDelete, err);
      callback(err);  // Pass error to the callback
    }
  }
}

module.exports = StepRecipe;
