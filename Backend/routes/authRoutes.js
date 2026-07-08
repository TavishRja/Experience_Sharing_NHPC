
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

async function validateEmployeeWithDatabase(user) {
    const [rows] = await db.promise().query(
        "SELECT role FROM users WHERE employee_id = ? LIMIT 1",
        [user]
    );

    if (rows.length === 0) {
        return { success: false, data: null, message: "User not found in database" };
    }

    const dbUser = rows[0];

    return {
        success: true,
        data: {
            roles: dbUser.role ? [dbUser.role] : ["employee"]
        }
    };
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
            const response = await axios.post(apiUrl, payload, { timeout: 8000 });
            const data = response?.data;

            console.log("Auth API response for payload:", JSON.stringify(payload), "status:", response.status, "=>", data);

            const isSuccess = data?.success === true || data?.authenticated === true || data?.status === "success";

            if (isSuccess) {
                return { success: true, data };
            }

            lastError = new Error(data?.message || data?.error || "API returned unsuccessful response");
        } catch (err) {
            console.log("Auth API attempt failed for payload:", JSON.stringify(payload), "=>", err.message);
            if (err.response) {
                // Log response details for debugging (400/4xx/5xx)
                try {
                    console.log("Auth API error response status:", err.response.status);
                    console.log("Auth API error response data:", JSON.stringify(err.response.data));
                    lastError = new Error(`Status ${err.response.status}: ${JSON.stringify(err.response.data)}`);
                } catch (e) {
                    console.log("Error stringifying error response:", e.message);
                    lastError = err;
                }
            } else {
                lastError = err;
            }
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

        let roles = ["employee"];
        let apiResult = { success: false, data: null, message: "Invalid credentials" };

        if (demoUser && normalizedPassword === demoUser.password) {
            roles = demoUser.roles;
            apiResult = { success: true, data: { roles } };
        } else {
            const dbResult = await validateEmployeeWithDatabase(normalizedUser);

            if (dbResult.success) {
                apiResult = dbResult;
            } else {
                apiResult = await validateEmployeeWithApi(normalizedUser, normalizedPassword);
            }
        }

        if (!apiResult.success) {
            return res.status(401).json({
                message: apiResult.message || "Invalid credentials"
            });
        }

        roles = extractRoles(apiResult.data, roles);

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
