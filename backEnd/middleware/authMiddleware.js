const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Lawyer = require("../models/lawyerModel"); // import Lawyer model
const multer = require("multer");
const path = require("path");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ error: "Not authorized, invalid token" });
    }
  } else {
    return res.status(401).json({ error: "No token, authorization denied" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        error: `User role ${req.user.userType} is not authorized to access this route`
      });
    }
    next();
  };
};

// In your authMiddleware (from your code):
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      error: "No token provided",
      details: "Authorization header must be in format: Bearer <token>"
    });
  }

  const token = authHeader.split(" ")[1].trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.userType === "Lawyer") {
      user = await Lawyer.findById(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      name: user.name,
      userType: decoded.userType || user.userType
    };

    next();
  } catch (err) {
    return res.status(401).json({ 
      error: "Invalid token",
      details: err.message
    });
  }
};

const protectLawyer = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const lawyerId = decoded.id || decoded.lawyerId; // ✅ fix here

      const lawyer = await Lawyer.findById(lawyerId);
      if (!lawyer) {
        return res.status(401).json({ error: "Not authorized, lawyer not found" });
      }

      req.user = {
        _id: lawyer._id,
        email: lawyer.email,
        name: lawyer.name,
        userType: "Lawyer"
      };

      next();
    } catch (err) {
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ error: "No token provided" });
  }
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

module.exports = {
  upload,
  protect,
  authorize,
  authMiddleware,protectLawyer,
};
