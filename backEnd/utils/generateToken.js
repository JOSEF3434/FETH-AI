// "./backEnd/generateToken.js"
const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  console.error("🚨 Error: JWT_SECRET is missing in environment variables.");
  throw new Error("JWT_SECRET is missing in environment variables.");
}

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {  // Fix here
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

module.exports = generateToken;
