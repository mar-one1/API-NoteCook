const db = require("../../database");

class Produit {
  constructor(id, name, weight) {
    this.id = id;
    this.name = name;
    this.weight = weight;
  }

  static createProduit(name, weight, callback) {
    
    db.run(
      'INSERT INTO Produit (Produit, PoidProduit) VALUES (?, ?)',
      [name, weight],
      function (err) {
        if (err) {
          callback(err);
          return;
        }
        const newProduit = new Produit(this.lastID, name, weight);
        callback(null, newProduit);
      }
    );
    
  }

  static getAllProduits(callback) {
    

    db.all('SELECT * FROM Produit', (err, rows) => {
      if (err) {
        
        return callback(err, null);
      }

      const produits = rows.map((row) => {
        return new Produit(row.Id_Produit, row.Produit, row.PoidProduit);
      });

      
      callback(null, produits);
    });
  }


  static getProduitById(id, callback) {
    
    db.get(
      'SELECT * FROM Produit WHERE Id_Produit = ?',
      [id],
      (err, row) => {
        if (err) {
          callback(err, null);
          return;
        }
        if (!row) {
          callback(null, null); // Produit not found
          return;
        }
        const produit = new Produit(row.Id_Produit, row.Produit, row.PoidProduit);
        callback(null, produit);
      }
    );
    
  }

  static updateProduit(id, name, weight, callback) {
    
    db.run(
      'UPDATE Produit SET Produit = ?, PoidProduit = ? WHERE Id_Produit = ?',
      [name, weight, id],
      function (err) {
        if (err) {
          callback(err);
          return;
        }
        if (this.changes === 0) {
          callback(null, null); // Produit not found or not updated
          return;
        }
        const updatedProduit = new Produit(id, name, weight);
        callback(null, updatedProduit);
      }
    );
    
  }

  static deleteProduit(id, callback) {
    
    db.run(
      'DELETE FROM Produit WHERE Id_Produit = ?',
      [id],
      function (err) {
        if (err) {
          callback(err);
          return;
        }
        if (this.changes === 0) {
          callback(null, false); // Produit not found or not deleted
          return;
        }
        callback(null, true); // Produit deleted successfully
      }
    );
    
  }

  // ... (Other methods)

  // Add more methods as needed
}

module.exports = Produit;