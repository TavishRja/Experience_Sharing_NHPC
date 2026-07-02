require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function initializeDatabase() {
    const migrations = [
        `CREATE TABLE IF NOT EXISTS solutions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255),
            area VARCHAR(100),
            description TEXT,
            employee VARCHAR(50),
            status VARCHAR(20),
            image VARCHAR(255),
            pdf_file VARCHAR(255),
            reject_reason VARCHAR(255),
            views INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id VARCHAR(50) UNIQUE NOT NULL,
            role VARCHAR(50) DEFAULT 'employee',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS solution_reactions (
            solution_id INT NOT NULL,
            employee_id VARCHAR(50) NOT NULL,
            type VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (solution_id, employee_id)
        )`
    ];

    for (const sql of migrations) {
        await db.promise().query(sql);
    }
}

db.connect(err => {
    if (err) {
        console.log("DB Error:", err);
        return;
    }

    console.log("MySQL Connected");
    initializeDatabase()
        .then(() => console.log("Database ready"))
        .catch(error => console.log("DB Migration Error:", error));
});

module.exports = db;