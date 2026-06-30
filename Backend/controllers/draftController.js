const db = require("../config/db");

// CREATE DRAFT
exports.createDraft = (req, res) => {

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
};


// GET DRAFT BY ID
exports.getDraftById = (req, res) => {

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
};


// UPDATE DRAFT
exports.updateDraft = (req, res) => {

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
};


// SUBMIT DRAFT
exports.submitDraft = (req, res) => {

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
};


// GET EMPLOYEE DRAFTS
exports.getEmployeeDrafts = (req, res) => {

    const emp = req.params.emp;

    db.query(
        "SELECT * FROM solutions WHERE employee=? AND status='Draft' ORDER BY updated_at DESC",
        [emp],
        (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        }
    );
};