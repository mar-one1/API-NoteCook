const pool = require("../../data/database");

class IngredientRecipe {
  constructor(id, recipeId, listIngredients) {
    this.id = id;               // المفتاح الأساسي ديال السجل
    this.recipeId = recipeId;   // المفتاح الخارجي للـ recipe
    this.listIngredients = listIngredients; // مصفوفة ديال IDs ديال المكونات
  }

  /**
   * إنشاء رابط جديد بوصفة وحقل list_ingredients كـ array
   * @param {number} recipeId
   * @param {number[]} listIngredients
   * @returns {Promise<IngredientRecipe>}
   */
  static async create(recipeId, listIngredients) {
    try {
      const res = await pool.query(
        `INSERT INTO ingredient_recipe ("Frk_idRecipe", list_ingredients)
         VALUES ($1, $2) RETURNING *`,
        [recipeId, listIngredients]
      );
      const row = res.rows[0];
      return new IngredientRecipe(row.id, row.Frk_idRecipe, row.list_ingredients);
    } catch (err) {
      throw err;
    }
  }

  /**
   * الحصول على جميع السجلات في جدول ingredient_recipe
   * @returns {Promise<IngredientRecipe[]>}
   */
  static async getAll() {
    try {
      const res = await pool.query(`SELECT * FROM ingredient_recipe`);
      return res.rows.map(row => new IngredientRecipe(row.id, row.Frk_idRecipe, row.list_ingredients));
    } catch (err) {
      throw err;
    }
  }

  /**
   * الحصول على سجل واحد بناءً على recipeId
   * @param {number} recipeId
   * @returns {Promise<IngredientRecipe|null>}
   */
  static async getByRecipeId(recipeId) {
    try {
      const res = await pool.query(
        `SELECT * FROM ingredient_recipe WHERE "Frk_idRecipe" = $1`,
        [recipeId]
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return new IngredientRecipe(row.id, row.Frk_idRecipe, row.list_ingredients);
    } catch (err) {
      throw err;
    }
  }

  /**
   * تحديث حقل list_ingredients لوصفة معينة
   * @param {number} recipeId
   * @param {number[]} newListIngredients
   * @returns {Promise<IngredientRecipe|null>}
   */
  static async updateList(recipeId, newListIngredients) {
    try {
      const res = await pool.query(
        `UPDATE ingredient_recipe
         SET list_ingredients = $1
         WHERE "Frk_idRecipe" = $2
         RETURNING *`,
        [newListIngredients, recipeId]
      );
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return new IngredientRecipe(row.id, row.Frk_idRecipe, row.list_ingredients);
    } catch (err) {
      throw err;
    }
  }

  /**
   * حذف سجل الربط لوصفة معينة
   * @param {number} recipeId
   * @returns {Promise<{ message: string }>}
   */
  static async deleteByRecipeId(recipeId) {
    try {
      await pool.query(
        `DELETE FROM ingredient_recipe WHERE "Frk_idRecipe" = $1`,
        [recipeId]
      );
      return { message: "Deleted successfully" };
    } catch (err) {
      throw err;
    }
  }
}

module.exports = IngredientRecipe;
