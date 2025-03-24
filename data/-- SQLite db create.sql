-- SQLite
-- Create the User table
CREATE TABLE User (
    Id_user INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    Firstname_user TEXT,
    Lastname_user TEXT,
    Birthday_user TEXT,
    Email_user TEXT,
    Phonenumber_user TEXT,
    Icon_user INTEGER,
    Password_user TEXT,
    Grade_user TEXT,
    Status_user TEXT,
    Url_image TEXT,
    CONSTRAINT unique_username UNIQUE (username)
);
-- Create the Recipe table
CREATE TABLE Recipe (
    Id_recipe INTEGER PRIMARY KEY AUTOINCREMENT,
    Icon_recipe INTEGER,
    Fav_recipe INTEGER,
    Nom_recipe TEXT,
    unique_key_recipe TEXT,
    Frk_user INTEGER,
    Frk_categorie INTEGER,
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
-- Create the Ingredient table
CREATE TABLE Ingredients (
    Id_ingredient_recipe INTEGER PRIMARY KEY AUTOINCREMENT,
    Ingredient_recipe TEXT,
    PoidIngredient_recipe REAL,
    unit TEXT,
    FRK_detail_recipe INTEGER,
    FOREIGN KEY (FRK_detail_recipe) REFERENCES DetailRecipe(Id_detail_recipe) ON DELETE CASCADE
);
-- Create the StepRecipe table
CREATE TABLE IngredientRecipe (
    Id_List_Ingredients_recipe integer primary key autoincrement,
    Frk_Ingredient_recipe integer,
    FRK_recipe integer,
    FOREIGN KEY (Frk_Ingredient_recipe) REFERENCES Ingredients(Id_ingredient_recipe) ON DELETE CASCADE,
    FOREIGN KEY (FRK_recipe) REFERENCES Recipe(Id_recipe) ON DELETE CASCADE
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
-- Create the FavoriteUserRecipe table
CREATE TABLE FavoriteUserRecipe (
    favRecipe_id INTEGER PRIMARY KEY,
    FRK_user INTEGER,
    FRK_recipe INTEGER,
    FOREIGN KEY (FRK_user) REFERENCES User(Id_user),
    FOREIGN KEY (FRK_recipe) REFERENCES Recipe(Id_recipe)
);
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
CREATE TABLE IF NOT EXISTS "DetailRecipe" (
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
CREATE TABLE IF NOT EXISTS "ReviewRecipe" (
    "Id_review_recipe" INTEGER PRIMARY KEY AUTOINCREMENT,
    "Detail_review_recipe" TEXT,
    "Rate_review_recipe" INTEGER,
    "FRK_recipe" INTEGER,
    FOREIGN KEY ("FRK_recipe") REFERENCES "Recipe"("Id_recipe") ON DELETE CASCADE
);
-- Create the IngredientRecipe table
CREATE TABLE IF NOT EXISTS "IngredientRecipe" (
    "Id_ingredient_recipe" INTEGER PRIMARY KEY AUTOINCREMENT,
    "Ingredient_recipe" TEXT,
    "PoidIngredient_recipe" REAL,
    "unit" TEXT,
    "FRK_detail_recipe" INTEGER,
    FOREIGN KEY ("FRK_detail_recipe") REFERENCES "DetailRecipe"("Id_detail_recipe") ON DELETE CASCADE
);
-- Create the StepRecipe table
CREATE TABLE IF NOT EXISTS "StepRecipe" (
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



) // PR CREATE TABLE "User" (
    "Id_user" SERIAL PRIMARY KEY,
    "username" TEXT,
    "Firstname_user" TEXT,
    "Lastname_user" TEXT,
    "Icon_user" TEXT,
    "password" TEXT,
    "Birthday_user" TEXT,
    "Phonenumber_user" TEXT,
    "Email_user" TEXT,
    "Status_user" TEXT,
    "Grade_user" TEXT,
    "Url_image" TEXT,
    CONSTRAINT unique_username UNIQUE (username)
);
-- Create the Recipe table
CREATE TABLE "Recipe" (
    "Id_recipe" SERIAL PRIMARY KEY,
    "Icon_recipe" TEXT,
    "Fav_recipe" INTEGER,
    "Nom_Recipe" TEXT,
    "unique_key_recipe" TEXT,
    "Frk_user" INTEGER,
    "Frk_categorie" INTEGER,
    FOREIGN KEY ("Frk_user") REFERENCES "User" ("Id_user") ON DELETE CASCADE
);
-- Create the DetailRecipe table
CREATE TABLE "DetailRecipe" (
    "Id_detail_recipe" SERIAL PRIMARY KEY,
    "Dt_recipe" TEXT,
    "Dt_recipe_time" TEXT,
    "Rate_recipe" INTEGER,
    "Level_recipe" TEXT,
    "Calories_recipe" INTEGER,
    "FRK_recipe" INTEGER,
    FOREIGN KEY ("FRK_recipe") REFERENCES "Recipe"("Id_recipe") ON DELETE CASCADE
);
-- Create the ReviewRecipe table
CREATE TABLE "ReviewRecipe" (
    "Id_review_recipe" SERIAL PRIMARY KEY,
    "Detail_review_recipe" TEXT,
    "Rate_review_recipe" INTEGER,
    "FRK_recipe" INTEGER,
    FOREIGN KEY ("FRK_recipe") REFERENCES "Recipe"("Id_recipe") ON DELETE CASCADE
);
-- Create the IngredientRecipe table
CREATE TABLE "IngredientRecipe" (
    "Id_ingredient_recipe" SERIAL PRIMARY KEY,
    "Ingredient_recipe" TEXT,
    "PoidIngredient_recipe" REAL,
    "unit" TEXT,
    "FRK_detail_recipe" INTEGER,
    FOREIGN KEY ("FRK_detail_recipe") REFERENCES "DetailRecipe"("Id_detail_recipe") ON DELETE CASCADE
);
-- Create the IngredientRecipe table
CREATE TABLE "Ingredients" (
    "Id_List_Ingredients_recipe"  SERIAL primary key ,
    "Frk_Ingredient_recipe" integer,
    "FRK_recipe" integer,
    FOREIGN KEY ("Frk_Ingredient_recipe") REFERENCES "Ingredients"("Id_ingredient_recipe") ON DELETE CASCADE,
    FOREIGN KEY ("FRK_recipe") REFERENCES "Recipe"("Id_recipe") ON DELETE CASCADE
);
-- Create the StepRecipe table
CREATE TABLE "StepRecipe" (
    "Id_step_recipe" SERIAL PRIMARY KEY,
    "Detail_step_recipe" TEXT,
    "Image_step_recipe" TEXT,
    "Time_step_recipe" TEXT,
    "FRK_recipe" INTEGER,
    FOREIGN KEY ("FRK_recipe") REFERENCES "Recipe"("Id_recipe") ON DELETE CASCADE
);
-- Create the Produit table
CREATE TABLE "Produit" (
    "Id_Produit" SERIAL PRIMARY KEY,
    "Produit" TEXT,
    "PoidProduit" TEXT
);
-- Create the FavoriteUserRecipe table
CREATE TABLE "FavoriteUserRecipe" (
    "favRecipe_id" SERIAL PRIMARY KEY,
    "FRK_user" INTEGER,
    "FRK_recipe" INTEGER,
    FOREIGN KEY ("FRK_user") REFERENCES "User"("Id_user"),
    FOREIGN KEY ("FRK_recipe") REFERENCES "Recipe"("Id_recipe")
);
-- Create the message table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" SERIAL PRIMARY KEY,
    "recipeId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);