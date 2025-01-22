const postgre = require('../../database');

const bookController = {
    handler: async (req, res) => {
        try {
            switch (req.method) {
                case 'GET':
                    if (req.params.id) {
                        return getById(req, res);
                    }
                    return getAll(req, res);
                case 'POST':
                    return create(req, res);
                case 'PUT':
                    return updateById(req, res);
                case 'DELETE':
                    return deleteById(req, res);
                default:
                    res.status(405).json({ msg: "Method Not Allowed" });
            }
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * FROM books");
            res.json({ msg: "OK", data: rows });
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * FROM books WHERE book_id = $1", [req.params.id]);

            if (rows.length > 0) {
                res.json({ msg: "OK", data: rows });
            } else {
                res.status(404).json({ msg: "Not found" });
            }
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const { name, price } = req.body;

            const sql = 'INSERT INTO books(name, price) VALUES($1, $2) RETURNING *';
            const { rows } = await postgre.query(sql, [name, price]);

            res.status(201).json({ msg: "OK", data: rows[0] });

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    updateById: async (req, res) => {
        try {
            const { name, price } = req.body;

            const sql = 'UPDATE books SET name = $1, price = $2 WHERE book_id = $3 RETURNING *';
            const { rows } = await postgre.query(sql, [name, price, req.params.id]);

            if (rows.length > 0) {
                res.json({ msg: "OK", data: rows[0] });
            } else {
                res.status(404).json({ msg: "Not found" });
            }

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    deleteById: async (req, res) => {
        try {
            const sql = 'DELETE FROM books WHERE book_id = $1 RETURNING *';
            const { rows } = await postgre.query(sql, [req.params.id]);

            if (rows.length > 0) {
                res.json({ msg: "OK", data: rows[0] });
            } else {
                res.status(404).json({ msg: "Not found" });
            }

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
};

module.exports = bookController;
