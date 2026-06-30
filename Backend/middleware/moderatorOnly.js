function moderatorOnly(req, res, next) {

    if (!req.user.roles.includes("moderator")) {
        return res.status(403).json({ message: "Access denied" });
    }

    next();
}

module.exports = moderatorOnly;