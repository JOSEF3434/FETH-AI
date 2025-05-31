// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  getUserPayments
} = require("../controllers/paymentController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Protected routes
router.use(authMiddleware);

router.post("/initialize", initializePayment);
router.get("/history", getUserPayments);

// Webhook route (no auth)
router.post("/verify", verifyPayment);

module.exports = router;