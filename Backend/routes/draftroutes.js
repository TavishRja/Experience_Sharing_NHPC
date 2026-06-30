const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const db = require("../config/db");


// CREATE DRAFT
router.post("/draft",(req, res) => {

    const { title, area, description, employee } = req.body;

    const sql = `
      INSERT INTO solutions
      (title, area, description, employee, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'Draft', NOW(), NOW())
    `;

    db.query(sql, [title, area, description, employee], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ id: result.insertId });
    });
});


// GET DRAFT BY ID
router.get("/draft/:id",auth,  (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM solutions WHERE id=? AND status='Draft'",
        [id],
        (err, rows) => {
            if (err) return res.status(500).json(err);
            if (!rows.length)
                return res.status(404).json({ message: "Draft not found" });

            res.json(rows[0]);
        }
    );
});


// UPDATE DRAFT
router.put("/:id/draft",auth, (req, res) => {

    const { title, area, description } = req.body;
    const id = req.params.id;

    const sql = `
      UPDATE solutions
      SET title=?, area=?, description=?, updated_at=NOW()
      WHERE id=? AND status='Draft'
    `;

    db.query(sql, [title, area, description, id], err => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});


// SUBMIT DRAFT → PENDING
router.put("/:id/submit", auth,(req, res) => {

    const id = req.params.id;

    db.query(
        "UPDATE solutions SET status='Pending', updated_at=NOW() WHERE id=?",
        [id],
        err => {
            if (err)
                return res.status(500).json({ message: "DB Error" });

            res.json({ success: true });
        }
    );
});


// GET EMPLOYEE DRAFTS
router.get("/employee/:emp/drafts", auth,(req, res) => {

    const emp = req.params.emp;

    db.query(
        "SELECT * FROM solutions WHERE employee=? AND status='Draft' ORDER BY updated_at DESC",
        [emp],
        (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        }
    );
});


// DELETE DRAFT
router.delete("/:id/draft", auth,(req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM solutions WHERE id=? AND status='Draft'",
        [id],
        err => {
            if (err)
                return res.status(500).json({ message: "Delete failed" });

            res.json({ success: true });
        }
    );
});

module.exports = router;