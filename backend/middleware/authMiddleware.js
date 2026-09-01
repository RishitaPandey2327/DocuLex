const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Ye middleware har protected route se pehle chalega.
// Header me "Authorization: Bearer <token>" check karta hai.
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // password ko response me kabhi mat bhejo, isliye -password
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found, token invalid" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
