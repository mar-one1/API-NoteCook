let DataTypes, Model;

try {
  // Try to import Sequelize components
  const sequelizeImport = require('sequelize');
  DataTypes = sequelizeImport.DataTypes;
  Model = sequelizeImport.Model;
} catch (error) {
  console.error('Error importing Sequelize:', error.message);
  // Create mock classes if import fails
  DataTypes = {
    INTEGER: 'INTEGER',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    TEXT: 'TEXT',
    DATE: 'DATE'
  };
  Model = class MockModel {};
}

// Import the sequelize connection (which may be real or a mock)
const sequelize = require('../Model/connection');

// Define the Recipe model with explicit table name
class Recipe extends Model {}
Recipe.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fav: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
  // Define other columns in your Recipe table
}, { 
  sequelize, 
  modelName: 'Recipe',
  tableName: 'Recipes', // Explicitly define the table name
});

// Define class methods for CRUD operations
class RecipeService {
  // Create a new recipe
  static async createRecipe(name, icon, fav, userId) {
    try {
      const recipe = await Recipe.create({ name, icon, fav, userId });
      return recipe;
    } catch (error) {
      throw new Error('Unable to create recipe');
    }
  }

  // Get all recipes
  static async getAllRecipes() {
    try {
      const recipes = await Recipe.findAll();
      return recipes;
    } catch (error) {
      throw new Error('Unable to fetch recipes');
    }
  }

  // Get a recipe by ID
  static async getRecipeById(id) {
    try {
      const recipe = await Recipe.findByPk(id);
      if (!recipe) {
        throw new Error('Recipe not found');
      }
      return recipe;
    } catch (error) {
      throw new Error('Unable to fetch recipe');
    }
  }

  // Update a recipe
  static async updateRecipe(id, name, icon, fav, userId) {
    try {
      const recipe = await Recipe.findByPk(id);
      if (!recipe) {
        throw new Error('Recipe not found');
      }
      recipe.name = name;
      recipe.icon = icon;
      recipe.fav = fav;
      recipe.userId = userId;
      await recipe.save();
      return recipe;
    } catch (error) {
      throw new Error('Unable to update recipe');
    }
  }

  // Delete a recipe
  static async deleteRecipe(id) {
    try {
      const recipe = await Recipe.findByPk(id);
      if (!recipe) {
        throw new Error('Recipe not found');
      }
      await recipe.destroy();
      return;
    } catch (error) {
      throw new Error('Unable to delete recipe');
    }
  }

  static async getRecipesByConditions(conditions, callback) {
    try {
      const { Op } = require('sequelize');
      const { Recipe, Detail_recipe, Ingredient_recipe, Step_recipe, Review_recipe } = require('../Model/Recipe'); // Import your Sequelize models
  
      // Initialize an empty object to hold the conditions for the WHERE clause
      const whereConditions = {};
  
      // Add additional conditions from the input object to the whereConditions object
      for (const key in conditions) {
        if (key !== 'searchText') {
          // Exclude the searchText key and add the condition to whereConditions
          whereConditions[key] = conditions[key];
        }
      }
  
      // Construct the Sequelize query
      const recipes = await Recipe.findAll({
        include: [
          { model: Detail_recipe },
          { model: Ingredient_recipe },
          { model: Step_recipe },
          { model: Review_recipe }
        ],
        where: {
          [Op.and]: [
            whereConditions,
            {
              [Op.or]: [
                { name: { [Op.like]: `%${conditions.searchText}%` } },
                { '$Detail_recipe.description$': { [Op.like]: `%${conditions.searchText}%` } },
                { '$Ingredient_recipe.ingredientName$': { [Op.like]: `%${conditions.searchText}%` } },
                { '$Step_recipe.stepDescription$': { [Op.like]: `%${conditions.searchText}%` } },
                { '$Review_recipe.reviewDescription$': { [Op.like]: `%${conditions.searchText}%` } }
              ]
            }
          ]
        }
      });
  
      // Process the results if needed
      const uniqueRecipes = new Set();
      recipes.forEach(recipe => {
        uniqueRecipes.add(JSON.stringify({
          id: recipe.id,
          name: recipe.name,
          icon: recipe.icon,
          fav: recipe.fav,
          userId: recipe.userId
        }));
      });
  
      // Convert the set back to an array of recipes
      const uniqueRecipesArray = Array.from(uniqueRecipes).map(JSON.parse);
  
      // Invoke the callback with the result
      callback(null, { recipes: uniqueRecipesArray });
    } catch (error) {
      // Handle any errors
      console.error(error);
      callback(error);
    }
  }
}

module.exports = { Recipe, RecipeService };
