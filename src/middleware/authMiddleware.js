const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token failed" });
  }
};

const adminOnly = (req, res, next) => {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com").toLowerCase();
  if (!req.user || req.user.email.toLowerCase() !== adminEmail) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { protect, adminOnly };
