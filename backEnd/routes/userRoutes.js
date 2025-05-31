const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect, authorize } = require("../middleware/authMiddleware");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const {
  signup,
  login,
  changePassword,
  UserupdateUserProfile,
  getAllUsers,
  getAllActiveUsers,
  updateUserState,
  deleteUser
} = require("../controllers/userController");

// Public routes
router.post("/signup", upload.single("profilePicture"), signup);
router.post("/login", login);
// Protected routes
router.use(protect);

router.put("/change-password", changePassword);
router.put("/profile", upload.single("profilePicture"), UserupdateUserProfile);

// Admin-only routes
router.use(authorize('Admin'));

router.get("/", getAllUsers);
router.get("/active", getAllActiveUsers);
router.put("/:id/state", updateUserState);
router.delete("/:id", deleteUser);

module.exports = router;