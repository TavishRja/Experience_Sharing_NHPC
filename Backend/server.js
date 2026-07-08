require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const draftRoutes = require("./routes/draftRoutes");
const solutionRoutes = require("./routes/solutionRoutes");
const moderatorRoutes = require("./routes/moderatorRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const frontendPath = path.join(__dirname, "..", "frontend");
const uploadsPath = path.join(__dirname, "uploads");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(frontendPath));
app.use("/uploads", express.static(uploadsPath));

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "home.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/solutions", draftRoutes);
app.use("/api/solutions", solutionRoutes);
app.use("/api/moderator", moderatorRoutes);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
