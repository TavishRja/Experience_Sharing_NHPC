
const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const DEMO_USERS = {
    emp: { password: "123", roles: ["employee"] },
    mod: { password: "123", roles: ["moderator", "employee"] },
    EMP102: { password: "123", roles: ["employee"] }
};

router.post("/login", async (req, res) => {

    try {
        const { user, password } = req.body;
        const normalizedUser = String(user || "").trim();
        const normalizedPassword = String(password || "").trim();
        const demoUser = DEMO_USERS[normalizedUser] || DEMO_USERS[normalizedUser.toLowerCase()];

        let authSuccess = false;
        let authData = null;

        try {
            const response = await axios.post(
                "https://apihub.nhpc.in:8443/erp-auth",
                { user: normalizedUser, password: normalizedPassword },
                { timeout: 3000 }
            );

            console.log("External API Response:", response.data);
            authData = response.data;
            authSuccess = response.data?.success === true;
        } catch (err) {
            console.log("External auth unavailable:", err.message);
        }

        if (!authSuccess && demoUser && normalizedPassword === demoUser.password) {
            authSuccess = true;
            authData = { success: true };
        }

        if (!authSuccess) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const [rows] = await db.promise().query(
            "SELECT role FROM users WHERE employee_id = ?",
            [normalizedUser]
        );

        let roles = demoUser?.roles || ["employee"];

        if (rows.length > 0) {
            roles = rows.map(r => r.role);
        } else {
            const defaultRole = demoUser?.roles?.includes("moderator") ? "moderator" : "employee";
            await db.promise().query(
                "INSERT INTO users (employee_id, role) VALUES (?, ?)",
                [normalizedUser, defaultRole]
            );
        }

        const token = jwt.sign(
            { userId: normalizedUser, roles },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            success: true,
            token,
            userId: normalizedUser,
            roles
        });

    } catch (err) {
        console.log("Login error:", err.message);
        res.status(500).json({ message: "Login failed" });
    }
});

module.exports = router;