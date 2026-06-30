const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const db = require("../config/db");
const upload = require("../middleware/upload");
const generatePdfThumbnail = require("../utils/pdfThumbnail");
const path = require("path");


/* =======================
   CONFIRM DRAFT → PENDING
======================= */

router.put(
    "/:id/confirm", auth,
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "pdf", maxCount: 1 }
    ]),
    async (req, res) => {

        try {
            const id = req.params.id;
            const { title, area, description } = req.body;

            const imageFile = req.files?.image
                ? req.files.image[0].filename
                : null;

            const pdfFile = req.files?.pdf
                ? req.files.pdf[0].filename
                : null;

            if (!pdfFile) {
                return res.status(400).json({ message: "PDF is required" });
            }

            let finalImage = imageFile;

            // If no image → generate thumbnail from PDF
            if (!imageFile && pdfFile) {
                finalImage = await generatePdfThumbnail(
                    path.join("uploads", pdfFile)
                );
            }

            db.query(
                `UPDATE solutions 
                 SET title=?, area=?, description=?, image=?, pdf_file=?,
                     status='Pending', updated_at=NOW()
                 WHERE id=? AND status='Draft'`,
                [title, area, description, finalImage, pdfFile, id],
                err => {
                    if (err) {
                        console.log("Confirm Error:", err);
                        return res.status(500).json({ message: "Confirm failed" });
                    }
                    res.json({ success: true });
                }
            );

        } catch (err) {
            console.log("Thumbnail Error:", err);
            res.status(500).json({ message: "Thumbnail failed" });
        }
    }
);


/* =======================
   DIRECT CREATE + CONFIRM
======================= */

router.post(
    "/confirm-new", auth,
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "pdf", maxCount: 1 }
    ]),
    async (req, res) => {

        try {
            const { title, area, description, employee } = req.body;

            let finalImage = null;
            let pdfFile = null;

            if (req.files?.pdf?.length > 0) {

                pdfFile = req.files.pdf[0].filename;

                finalImage = await generatePdfThumbnail(
                    path.join("uploads", pdfFile)
                );

            } else if (req.files?.image?.length > 0) {

                finalImage = req.files.image[0].filename;
            }

            db.query(
                `INSERT INTO solutions 
                 (title, area, description, employee, image, pdf_file, status)
                 VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
                [title, area, description, employee, finalImage, pdfFile],
                (err) => {
                    if (err) {
                        console.log("Insert Error:", err);
                        return res.status(500).json({ message: "Insert failed" });
                    }
                    res.json({ success: true });
                }
            );

        } catch (err) {
            console.log("Confirm New Error:", err);
            res.status(500).json({ message: "Confirm failed" });
        }
    }
);


/* =======================
   EMPLOYEE DASHBOARD
======================= */

router.get("/employee/:emp", auth, (req, res) => {

    const emp = req.params.emp;

    db.query(
        "SELECT * FROM solutions WHERE employee=? AND status!='Draft' ORDER BY created_at DESC",
        [emp],
        (err, results) => {
            if (err)
                return res.status(500).json({ message: "DB Error" });

            res.json(results);
        }
    );
});


/* =======================
   PUBLIC ROUTES
======================= */

// Approved List
router.get("/approved", (req, res) => {

    db.query(
        "SELECT * FROM solutions WHERE status='Approved' ORDER BY created_at DESC",
        (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        }
    );
});




// View Count
router.post("/:id/view", (req, res) => {

    db.query(
        "UPDATE solutions SET views = views + 1 WHERE id=?",
        [req.params.id],
        err => {
            if (err) return res.status(500).json(err);
            res.json({ success: true });
        }
    );
});


router.post("/:id/react", auth, async (req, res) => {

    try {
        const solutionId = req.params.id;
        const employeeId = req.user.userId;
        const { type } = req.body; // like or dislike

        if (!["like", "dislike"].includes(type)) {
            return res.status(400).json({ message: "Invalid reaction type" });
        }

        const [existing] = await db.promise().query(
            "SELECT * FROM solution_reactions WHERE solution_id=? AND employee_id=?",
            [solutionId, employeeId]
        );

        // 🔥 If already reacted
        if (existing.length > 0) {

            if (existing[0].type === type) {
                // Same reaction clicked again → remove it (toggle off)
                await db.promise().query(
                    "DELETE FROM solution_reactions WHERE solution_id=? AND employee_id=?",
                    [solutionId, employeeId]
                );
            } else {
                // Switch reaction
                await db.promise().query(
                    "UPDATE solution_reactions SET type=? WHERE solution_id=? AND employee_id=?",
                    [type, solutionId, employeeId]
                );
            }

        } else {
            // First time reaction
            await db.promise().query(
                "INSERT INTO solution_reactions (solution_id, employee_id, type) VALUES (?, ?, ?)",
                [solutionId, employeeId, type]
            );
        }

        res.json({ success: true });

    } catch (err) {
        console.log("Reaction error:", err);
        res.status(500).json({ message: "Reaction failed" });
    }
});


//count reaction

router.get("/:id", async (req, res) => {

    const solutionId = req.params.id;

    const [solution] = await db.promise().query(
        "SELECT * FROM solutions WHERE id=?",
        [solutionId]
    );

    const [counts] = await db.promise().query(`
        SELECT 
            SUM(type='like') as likes,
            SUM(type='dislike') as dislikes
        FROM solution_reactions
        WHERE solution_id=?
    `, [solutionId]);

    solution[0].likes = counts[0].likes || 0;
    solution[0].dislikes = counts[0].dislikes || 0;

    res.json(solution[0]);
});

// Single Solution
router.get("/:id", (req, res) => {

    db.query(
        "SELECT * FROM solutions WHERE id=?",
        [req.params.id],
        (err, rows) => {
            if (err) return res.status(500).json(err);
            if (!rows.length)
                return res.status(404).json({ message: "Not found" });

            res.json(rows[0]);
        }
    );
});
module.exports = router;