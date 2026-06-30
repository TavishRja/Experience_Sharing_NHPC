require("dotenv").config();
const express = require("express");
const cors = require("cors");

const draftRoutes = require("./routes/draftRoutes");
const solutionRoutes = require("./routes/solutionRoutes");
const moderatorRoutes = require("./routes/moderatorRoutes");
const authRoutes = require("./routes/authRoutes");


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

/* =======================
Home route
======================= */
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/home.html");
});


/* =======================
TEST
======================= */
app.get("/", (req, res) => {
    res.send("NHPC Backend Running 🚀");
});
app.use("/api/auth", authRoutes);
app.use("/api/solutions", draftRoutes);
app.use("/api/solutions", solutionRoutes);
app.use("/api/moderator", moderatorRoutes);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
