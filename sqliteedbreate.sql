-- SQLite
-- Create the User table
/*CREATE TABLE User (
    Id_user INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    Firstname_user TEXT,
    Lastname_user TEXT,
    Birthday_user TEXT,
    Email_user TEXT,
    Phonenumber_user TEXT,
    Icon_user INTEGER,
    Password_user TEXT,
    Grade_user INTEGER,
    Status_user INTEGER,
    CONSTRAINT unique_username UNIQUE (username)
);

-- Create the Recipe table
CREATE TABLE Recipe (
    Id_recipe INTEGER PRIMARY KEY AUTOINCREMENT,
    Icon_recipe INTEGER,
    Fav_recipe INTEGER,
    Nom_recipe TEXT,
    Frk_user INTEGER,
    FOREIGN KEY (Frk_user) REFERENCES User(Id_user) ON DELETE CASCADE
);

-- Create the DetailRecipe table
CREATE TABLE DetailRecipe (
    Id_detail_recipe INTEGER PRIMARY KEY AUTOINCREMENT,
    Dt_recipe TEXT,
    Dt_recipe_time TEXT,
    Rate_recipe INTEGER,
    Level_recipe INTEGER,
    Calories_recipe INTEGER,
    FRK_recipe INTEGER,
    FOREIGN KEY (FRK_recipe) REFERENCES Recipe(Id_recipe) ON DELETE CASCADE
);

-- Create the ReviewRecipe table
CREATE TABLE ReviewRecipe (
    Id_review_recipe INTEGER PRIMARY KEY AUTOINCREMENT,
    Detail_review_recipe TEXT,
    Rate_review_recipe INTEGER,
    FRK_recipe INTEGER,
    FOREIGN KEY (FRK_recipe) REFERENCES Recipe(Id_recipe) ON DELETE CASCADE
);

-- Create the IngredientRecipe table
CREATE TABLE IngredientRecipe (
    Id_ingredient_recipe INTEGER PRIMARY KEY AUTOINCREMENT,
    Ingredient_recipe TEXT,
    PoidIngredient_recipe REAL,
    unit TEXT,
    FRK_detail_recipe INTEGER,
    FOREIGN KEY (FRK_detail_recipe) REFERENCES DetailRecipe(Id_detail_recipe) ON DELETE CASCADE
);

-- Create the StepRecipe table
CREATE TABLE StepRecipe (
    Id_step_recipe INTEGER PRIMARY KEY AUTOINCREMENT,
    Detail_step_recipe TEXT,
    Image_step_recipe TEXT,
    Time_step_recipe TEXT,
    FRK_recipe INTEGER,
    FOREIGN KEY (FRK_recipe) REFERENCES Recipe(Id_recipe) ON DELETE CASCADE
);

-- Create the Produit table
CREATE TABLE Produit (
    Id_Produit INTEGER PRIMARY KEY AUTOINCREMENT,
    Produit TEXT,
    PoidProduit TEXT
);
*/
-- Create the FavoriteUserRecipe table
/*CREATE TABLE FavoriteUserRecipe (
    favRecipe_id INTEGER PRIMARY KEY,
    FRK_user INTEGER,
    FRK_recipe INTEGER,
    FOREIGN KEY (FRK_user) REFERENCES User(Id_user),
    FOREIGN KEY (FRK_recipe) REFERENCES Recipe(Id_recipe)
);*/
-- SQLite
-- Create the User table
-- SQLite
-- Create the User table
CREATE TABLE IF NOT EXISTS "User" (
    "Id_user" INTEGER PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "Firstname_user" TEXT,
    "Lastname_user" TEXT,
    "Icon_user" TEXT,
    "password" TEXT NOT NULL,
    "Birthday_user" TEXT,
    "Phonenumber_user" TEXT,
    "Email_user" TEXT,
    "Status_user" TEXT,
    "Grade_user" TEXT,
    "Url_image" TEXT,
    CONSTRAINT unique_username UNIQUE (username)
);
-- Create the Recipe table
CREATE TABLE IF NOT EXISTS "Recipe" (
    "Id_recipe" INTEGER PRIMARY KEY AUTOINCREMENT,
    "Icon_recipe" INTEGER,
    "Fav_recipe" INTEGER,
    "Nom_recipe" TEXT NOT NULL,
    "unique_key_recipe" TEXT,
    "Frk_user" INTEGER,
    "Frk_categorie" INTEGER,
    FOREIGN KEY ("Frk_user") REFERENCES "User" ("Id_user") ON DELETE CASCADE
);
-- Create the DetailRecipe table
CREATE TABLE IF NOT EXISTS "Detail_recipe" (
    "Id_detail_recipe" INTEGER PRIMARY KEY AUTOINCREMENT,
    "Dt_recipe" TEXT,
    "Dt_recipe_time" TEXT,
    "Rate_recipe" INTEGER,
    "Level_recipe" INTEGER,
    "Calories_recipe" INTEGER,
    "FRK_recipe" INTEGER,
    FOREIGN KEY ("FRK_recipe") REFERENCES "Recipe"("Id_recipe") ON DELETE CASCADE
);
-- Create the ReviewRecipe table
CREATE TABLE IF NOT EXISTS "Review_recipe" (
    "Id_review_recipe" INTEGER PRIMARY KEY AUTOINCREMENT,
    "Detail_review_recipe" TEXT,
    "Rate_review_recipe" INTEGER,
    "FRK_recipe" INTEGER,
    FOREIGN KEY ("FRK_recipe") REFERENCES "Recipe"("Id_recipe") ON DELETE CASCADE
);
-- Create the IngredientRecipe table
CREATE TABLE IF NOT EXISTS "ingredient_recipe" (
    "Id_ingredient_recipe" INTEGER PRIMARY KEY AUTOINCREMENT,
    "Ingredient_recipe" TEXT,
    "PoidIngredient_recipe" REAL,
    "unit" TEXT,
    "FRK_detail_recipe" INTEGER,
    FOREIGN KEY ("FRK_detail_recipe") REFERENCES "DetailRecipe"("Id_detail_recipe") ON DELETE CASCADE
);
-- Create the StepRecipe table
CREATE TABLE IF NOT EXISTS "Step_recipe" (
    "Id_step_recipe" INTEGER PRIMARY KEY AUTOINCREMENT,
    "Detail_step_recipe" TEXT,
    "Image_step_recipe" TEXT,
    "Time_step_recipe" TEXT,
    "FRK_recipe" INTEGER,
    FOREIGN KEY ("FRK_recipe") REFERENCES "Recipe"("Id_recipe") ON DELETE CASCADE
);
-- Create the Produit table
CREATE TABLE IF NOT EXISTS "Produit" (
    "Id_Produit" INTEGER PRIMARY KEY AUTOINCREMENT,
    "Produit" TEXT,
    "PoidProduit" TEXT
);
-- Create the FavoriteUserRecipe table
CREATE TABLE IF NOT EXISTS "FavoriteUserRecipe" (
    "favRecipe_id" INTEGER PRIMARY KEY,
    "FRK_user" INTEGER,
    "FRK_recipe" INTEGER,
    FOREIGN KEY ("FRK_user") REFERENCES "User"("Id_user"),
    FOREIGN KEY ("FRK_recipe") REFERENCES "Recipe"("Id_recipe")
);
  -- Create the message table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" INTEGER PRIMARY KEY,
    "recipeId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Categorie_recipe" (
    "Id_Categorie_recipe" INTEGER PRIMARY KEY,
    "Icon_Categorie_recipe" TEXT,
    "Icon_Path_Categorie_recipe" TEXT,
    "Detail_Categorie_recipe" TEXT
);

/*
--sql
-- Insert 100 rows into the Recipe table
INSERT INTO Recipe (Icon, Favorite, Name, User_ID, Category_ID)
VALUES
  (123, 1, 'Spaghetti Bolognese', 2, 5),
  (456, 0, 'Chocolate Cake', 3, 4),
  (789, 1, 'Chicken Curry', 1, 7),
  (321, 0, 'Caesar Salad', 2, 2),
  (654, 1, 'Tiramisu', 3, 4),
  -- Add 95 more rows with random data
  (111, 1, 'Lasagna', 4, 5),
  (222, 0, 'Apple Pie', 2, 3),
  (333, 1, 'Beef Stroganoff', 1, 5),
  (444, 0, 'Greek Salad', 3, 2),
  (555, 1, 'Mango Sorbet', 4, 4),
  (666, 1, 'Chicken Alfredo', 1, 6),
  (777, 0, 'Strawberry Shortcake', 2, 3),
  (888, 1, 'Tomato Soup', 3, 7),
  (999, 0, 'Cheeseburger', 4, 1),
  (1010, 1, 'Pasta Primavera', 1, 5),
  -- Continue with more rows...
  -- (You can generate random data for the remaining rows.)
  -- ...
  ;

  INSERT INTO Detail_Recipe (Detail, Level, Time, Rate, Calories, Recipe_ID)
VALUES
  ('Cook pasta until al dente', 2, 20, 4, 300, 1),
  ('Preheat oven to 350°F', 1, 10, 5, 150, 2),
  ('Simmer chicken in sauce', 3, 30, 4, 400, 3),
  ('Toss lettuce with dressing', 1, 5, 4, 100, 4),
  ('Mix mascarpone and sugar', 2, 15, 5, 250, 5),
  -- Add more rows with data for other recipes
  ;


INSERT INTO Ingredients_Recipe (Ingredient, Weight, Detail_Recipe_ID)
VALUES
  ('Pasta', '200g', 1),
  ('Olive Oil', '2 tbsp', 2),
  ('Chicken Thighs', '400g', 3),
  ('Lettuce', '150g', 4),
  ('Mascarpone Cheese', '250g', 5),
  -- Add more rows with data for other recipes
  ;


INSERT INTO Step_Recipe (Detail, Image, Time, Recipe_ID)
VALUES
  ('Boil water for pasta', '123', '5 min', 1),
  ('Grease baking pan', '456', '3 min', 2),
  ('Stir in tomato sauce', '789', '8 min', 3),
  ('Toss lettuce with dressing', '321', '5 min', 4),
  ('Layer cheese mixture and ladyfingers', '654', '10 min', 5),
  -- Add more rows with data for other recipes
  ;

INSERT INTO Review_Recipe (Review, Rate, Detail_Recipe_ID)
VALUES
  ('Delicious! Will make it again.', 5, 1),
  ('Perfect cake, my family loved it.', 5, 2),
  ('The curry was too spicy for me.', 3, 3),
  ('Great salad recipe!', 4, 4),
  ('Superb dessert, a must-try.', 5, 5),
  -- Add more rows with data for other recipes
  ;

*/

