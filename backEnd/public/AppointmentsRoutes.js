const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getUserAppointments,
  getLawyerAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentById,
  getAllLawyers,
  getAvailableSlots
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");

// User routes
router.post("/", protect, createAppointment);
router.get("/user", protect, getUserAppointments);
router.get("/:id", protect, getAppointmentById);
router.put("/:id/cancel", protect, cancelAppointment);

// Lawyer routes
router.get("/lawyer/all", protect, getLawyerAppointments);
router.put("/:id/status", protect, updateAppointmentStatus);

// Public routes
router.get("/lawyers/list", getAllLawyers);
router.get("/slots/:lawyerId/:date", getAvailableSlots);

module.exports = router;
