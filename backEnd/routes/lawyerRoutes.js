//"./routes/lawyerRoutes.js"
const express = require("express");
const {
  lawyerSignup,
  lawyerLogin, 
  getUnapprovedLawyers,
  approveLawyer,
  rejectLawyer,
  countNewLawyers,
  gatAllrejectLawyer,
  toggleLawyerState,
  getApprovedLawyers,
  getActiveApprovedLawyers,
  getRecommendedLawyers,
  getLawyerDetails,
  countApprovedLawyers,
  updateLawyerProfile,
  updateLawyerPassword,
  addRating,
  getRatings,
} = require("../controllers/lawyerController");
const upload = require("../middleware/multerConfig"); 
const { protect } = require("../middleware/authMiddleware");
const { countUsersByType } = require("../controllers/userController");

const router = express.Router();
// Lawyer Signup Route
router.post("/register", lawyerSignup);
router.post('/login', lawyerLogin);
// Retrieve unapproved lawyers
router.get("/unapproved", getUnapprovedLawyers);
// Approve lawyer
router.put("/approve/:id", approveLawyer);
// Reject lawyer (soft delete)
router.put("/reject/:id", rejectLawyer);
// Toggle lawyer activation state
router.put("/toggle-state/:id", toggleLawyerState);
// Retrieve approved lawyers
router.get("/approved", getApprovedLawyers);
// Retrieve all Reject lawyers
router.get("/rejected", gatAllrejectLawyer);
//router.get('/recommended', getRecommendedLawyers);
router.post("/recommendations", getRecommendedLawyers);
// Retrieve active and approved lawyers
router.get("/active-approved", getActiveApprovedLawyers);
// count routes
router.get("/count-approved", countApprovedLawyers);
router.get("/count-new", countNewLawyers);
// Retrieve single lawyer details
router.get("/:id", getLawyerDetails);
// Update lawyer profile
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'barCertificate', maxCount: 1 },
    { name: 'additionalCertifications', maxCount: 1 }
  ]),
  (req, res, next) => {
    console.log('Files received:', req.files);
    console.log('Body received:', req.body);
    next();
  },
  updateLawyerProfile
);
// Update lawyer password (optional)
router.put("/:id/password", protect, updateLawyerPassword);
// In your routes
router.post("/:id/ratings", protect, addRating);
router.get("/:id/ratings", getRatings);

module.exports = router;
