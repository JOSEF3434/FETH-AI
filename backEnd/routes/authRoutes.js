// "./backEnd/routes/authRoutes.js"

const express = require("express");
const {
  forgotPassword,
  resetPassword
} = require("../controllers/userController");
const { signup, login,AllUser,updateUserProfile } = require("../controllers/authController");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth API is working!" });
}); 

router.post("/signup", upload.single("profilePicture"), signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Get all users
router.get("/AllUsers",AllUser);

// Update user profile (Protected route)
router.put("/update/:id", upload.single("profilePicture"), updateUserProfile);

module.exports = router;
