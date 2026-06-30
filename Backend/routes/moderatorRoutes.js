const express = require("express");
const auth = require("../middleware/auth");
const moderatorOnly = require("../middleware/moderatorOnly");
const router = express.Router();
const db = require("../config/db");


/* =======================
   GET ALL PENDING
======================= */
router.get("/pending", auth,moderatorOnly,  (req, res) => {

    db.query(
        "SELECT * FROM solutions WHERE LOWER(status) = 'pending'",
        (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        }
    );
});


/* =======================
   APPROVE
======================= */
router.put("/approve/:id", auth, moderatorOnly, (req, res) => {

    db.query(
        "UPDATE solutions SET status='Approved' WHERE id=?",
        [req.params.id],
        err => {
            if (err) return res.status(500).json(err);
            res.json({ success: true });
        }
    );
});


/* =======================
   REJECT
======================= */
router.put("/reject/:id", auth,moderatorOnly,  (req, res) => {

    db.query(
        "UPDATE solutions SET status='Rejected', reject_reason=? WHERE id=?",
        [req.body.reason, req.params.id],
        err => {
            if (err) return res.status(500).json(err);
            res.json({ success: true });
        }
    );
});


/* =======================
   FILTERED SOLUTIONS
======================= */
router.get("/solutions", auth,moderatorOnly,  (req, res) => {

    const { status, area, from, to } = req.query;

    let sql = "SELECT * FROM solutions WHERE 1=1";
    let params = [];

    if (status) {
        sql += " AND status = ?";
        params.push(status);
    }

    if (area) {
        sql += " AND area LIKE ?";
        params.push(`%${area}%`);
    }

    if (from && to) {
        sql += " AND DATE(created_at) BETWEEN ? AND ?";
        params.push(from, to);
    }

    sql += " ORDER BY created_at DESC";

    db.query(sql, params, (err, results) => {
        if (err)
            return res.status(500).json({ message: "DB Error" });

        res.json(results);
    });
});


module.exports = router;