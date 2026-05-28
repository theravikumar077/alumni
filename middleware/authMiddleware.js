const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT secret - normally in .env, using default fallback for ease of local run
const JWT_SECRET = process.env.JWT_SECRET || "alumnihubsecretkey123456789";

const protect = async (req, res, next) => {
  let token;

  // Check Cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Check Authorization Header
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, token missing" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from DB
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found with this token" });
    }

    next();
  } catch (error) {
    console.error("JWT verify error:", error.message);
    return res.status(401).json({ success: false, message: "Not authorized, token invalid or expired" });
  }
};

// Role authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : "none"}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize, JWT_SECRET };
