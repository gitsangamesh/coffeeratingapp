const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// SQLite database
const dbPath = path.join(__dirname, "coffee.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database error:", err.message);
    } else {
        console.log("SQLite database connected");
    }
});

// Create table
db.run(`
    CREATE TABLE IF NOT EXISTS coffees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        votes INTEGER DEFAULT 0
    )
`);

// Insert sample coffees only if table is empty
db.get("SELECT COUNT(*) AS count FROM coffees", (err, row) => {

    if (err) {
        console.error(err);
        return;
    }

    if (row.count === 0) {

        const coffees = [
            [
                "Classic Espresso",
                "Strong and rich espresso blend"
            ],
            [
                "Cappuccino Blend",
                "Smooth coffee with creamy flavor"
            ],
            [
                "Mocha Delight",
                "Coffee with delicious chocolate flavor"
            ],
            [
                "Cold Brew",
                "Smooth and refreshing cold coffee"
            ],
            [
                "Caramel Latte",
                "Sweet coffee with caramel flavor"
            ],
            [
                "Hazelnut Coffee",
                "Aromatic coffee with hazelnut flavor"
            ]
        ];

        const stmt = db.prepare(
            "INSERT INTO coffees (name, description) VALUES (?, ?)"
        );

        coffees.forEach((coffee) => {
            stmt.run(coffee[0], coffee[1]);
        });

        stmt.finalize();

        console.log("Sample coffees inserted");
    }
});

// GET all coffees
app.get("/api/coffees", (req, res) => {

    db.all(
        "SELECT * FROM coffees ORDER BY votes DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: "Database error"
                });
            }

            res.json(rows);
        }
    );
});

// POST vote
app.post("/api/coffees/:id/vote", (req, res) => {

    const coffeeId = req.params.id;

    db.run(
        `
        UPDATE coffees
        SET votes = votes + 1
        WHERE id = ?
        `,
        [coffeeId],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Database error"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Coffee not found"
                });
            }

            // Return updated coffee
            db.get(
                "SELECT * FROM coffees WHERE id = ?",
                [coffeeId],
                (err, coffee) => {

                    if (err) {
                        return res.status(500).json({
                            error: "Database error"
                        });
                    }

                    res.json(coffee);
                }
            );
        }
    );
});

// Leaderboard
app.get("/api/leaderboard", (req, res) => {

    db.all(
        `
        SELECT *
        FROM coffees
        ORDER BY votes DESC
        LIMIT 5
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: "Database error"
                });
            }

            res.json(rows);
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Coffee Rating App running at http://localhost:${PORT}`);
});