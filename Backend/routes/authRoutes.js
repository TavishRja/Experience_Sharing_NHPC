
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

function getEmployeeAuthApiUrl() {
    return process.env.EMPLOYEE_AUTH_API_URL || process.env.DB_AUTH_API_URL || process.env.AUTH_API_URL || null;
}

function getAuthPayloads(user, password) {
    return [
        { id: user, password },
        { employee_id: user, password },
        { employeeId: user, password },
        { user, password },
        { userId: user, password },
        { username: user, password },
        { empId: user, password },
        { employee: user, password },
        { login: { id: user, password } },
        { credentials: { id: user, password } }
    ];
}

function extractRoles(data, fallbackRoles) {
    if (Array.isArray(data?.roles)) return data.roles;
    if (typeof data?.role === "string") return [data.role];
    if (Array.isArray(data?.data?.roles)) return data.data.roles;
    if (typeof data?.data?.role === "string") return [data.data.role];
    return fallbackRoles;
}

async function validateEmployeeWithApi(user, password) {
    const apiUrl = getEmployeeAuthApiUrl();

    if (!apiUrl) {
        return { success: false, data: null, message: "No auth API configured" };
    }

    const payloads = getAuthPayloads(user, password);
    let lastError = null;

    for (const payload of payloads) {
        try {
            const response = await axios.post(apiUrl, payload, { timeout: 5000 });
            const data = response?.data;

            console.log("Auth API response for payload:", JSON.stringify(payload), "=>", data);

            const isSuccess = data?.success === true || data?.authenticated === true || data?.status === "success";

            if (isSuccess) {
                return { success: true, data };
            }

            lastError = new Error(data?.message || data?.error || "API returned unsuccessful response");
        } catch (err) {
            console.log("Auth API attempt failed for payload:", JSON.stringify(payload), "=>", err.message);
            lastError = err;
        }
    }

    if (lastError) {
        console.log("Employee auth API failed:", lastError.message);
    }

    return { success: false, data: null, message: lastError?.message || "Authentication failed" };
}

router.post("/login", async (req, res) => {

    try {
        const { user, password } = req.body;
        const normalizedUser = String(user || "").trim();
        const normalizedPassword = String(password || "").trim();
        const demoUser = DEMO_USERS[normalizedUser] || DEMO_USERS[normalizedUser.toLowerCase()];

        let authSuccess = false;
        let authData = null;
        let roles = ["employee"];
        let apiResult = { success: false, data: null, message: "Invalid credentials" };

        if (demoUser && normalizedPassword === demoUser.password) {
            authSuccess = true;
            authData = { success: true };
            roles = demoUser.roles;
        } else {
            apiResult = await validateEmployeeWithApi(normalizedUser, normalizedPassword);
            if (apiResult.success) {
                authSuccess = true;
                authData = apiResult.data;
                roles = extractRoles(apiResult.data, ["employee"]);
            }
        }

        if (!authSuccess) {
            return res.status(401).json({
                message: apiResult.message || "Invalid credentials"
            });
        }

        const [rows] = await db.promise().query(
            "SELECT role FROM users WHERE employee_id = ?",
            [normalizedUser]
        );

        if (rows.length > 0) {
            roles = rows.map(r => r.role);
        } else {
            const defaultRole = roles.includes("moderator") ? "moderator" : "employee";
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