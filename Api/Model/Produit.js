const pool = require("../../data/database");

class Produit {
  constructor(id, name, weight) {
    this.id = id;
    this.name = name;
    this.weight = weight;
  }

  static createProduit(name, weight, callback) {
    const query = `
      INSERT INTO "Produit" ("Produit", "PoidProduit")
      VALUES ($1, $2)
      RETURNING "Id_Produit", "Produit", "PoidProduit"
    `;
    const values = [name, weight];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      const row = result.rows[0];
      const newProduit = new Produit(row.Id_Produit, row.Produit, row.PoidProduit);
      callback(null, newProduit);
    });
  }

  static getAllProduits(callback) {
    const query = `SELECT * FROM "Produit"`;

    pool.query(query, (err, result) => {
      if (err) {
        callback(err, null);
        return;
      }
      const produits = result.rows.map((row) => {
        return new Produit(row.Id_Produit, row.Produit, row.PoidProduit);
      });
      callback(null, produits);
    });
  }

  static getProduitById(id, callback) {
    const query = `SELECT * FROM "Produit" WHERE "Id_Produit" = $1`;
    const values = [id];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err, null);
        return;
      }
      if (result.rows.length === 0) {
        callback(null, null); // Produit not found
        return;
      }
      const row = result.rows[0];
      const produit = new Produit(row.Id_Produit, row.Produit, row.PoidProduit);
      callback(null, produit);
    });
  }

  static updateProduit(id, name, weight, callback) {
    const query = `
      UPDATE "Produit"
      SET "Produit" = $1, "PoidProduit" = $2
      WHERE "Id_Produit" = $3
      RETURNING "Id_Produit", "Produit", "PoidProduit"
    `;
    const values = [name, weight, id];

    pool.query(query, values, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      if (result.rowCount === 0) {
        callback(null, null); // Produit not found or not updated
        return;
      }
      const row = result.rows[0];
      const updatedProduit = new Produit(row.Id_Produit, row.Produit, row.PoidProduit);
      callback(null, updatedProduit);
    });
  }

  static deleteProduit(id, callback) {
    const query = `DELETE FROM "Produit" WHERE "Id_Produit" = $1`;
    const values = [id];

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

module.exports = Produit;
