
const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

router.post("/login", async (req, res) => {

    try {
        const { user, password } = req.body;

        // 🔥 Step 1: Call external API
        const response = await axios.post(
            "https://apihub.nhpc.in:8443/erp-auth",
            { user, password },
            // {timeout:1000}
        );

        console.log("External API Response:", response.data);

        if (!response.data.success) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 🔥 Step 2: Get role from local DB
        const [rows] = await db.promise().query(
            "SELECT role FROM users WHERE employee_id = ?",
            [user]
        );

        let roles = ["employee"];  // default

        if (rows.length > 0) {
            roles = rows.map(r => r.role);
        } else {
            // insert default employee role
            await db.promise().query(
                "INSERT INTO users (employee_id, role) VALUES (?, 'employee')",
                [user]
            );
        }

        // 🔥 Step 3: Create JWT
        const token = jwt.sign(
            { userId: user, roles },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        // 🔥 Step 4: Send response
        res.json({
            success: true,
            token,
            userId: user,
            roles
        });

    } catch (err) {
        console.log("Login error:", err.message);
        res.status(500).json({ message: "Login failed" });
    }
});

module.exports = router;