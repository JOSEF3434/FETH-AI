const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getUserAppointments,
  getLawyerAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getAllLawyers,
  getAvailableSlots,
  getTodaysAppointments,
  getPastAppointments,
  completeAppointment,
  checkUserAvailability,
  getAppointmentsByStatus,
  getAllAppointments,
  checkAvailability,
  getUpcomingAppointments,
  getAppointmentById
} = require("../controllers/appointmentController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Protected routes - all routes require authentication
router.use(authMiddleware);

// 1. Static routes (no parameters)
router.get("/all", getAllAppointments);
router.get("/today/all", getTodaysAppointments);
router.get("/past/all", getPastAppointments);
router.get("/upcoming", getUpcomingAppointments);
router.get("/lawyers/list", getAllLawyers);
router.get("/user", getUserAppointments); // User-specific appointments
router.get("/lawyer/all", getLawyerAppointments); // Lawyer-specific appointments

// 2. Action routes (specific actions on appointments)
router.put("/:id/cancel", cancelAppointment);
router.put("/:id/complete", completeAppointment);
router.put("/:id/status", updateAppointmentStatus);

// 3. Availability check routes
router.post("/check-availability", checkAvailability);
router.get("/user-availability/:userId", checkUserAvailability);
router.get("/slots/:lawyerLicenseNumber", getAvailableSlots);

// 4. General parameterized routes (should come last)
router.get("/:id", getAppointmentById); // Single appointment by ID
router.post("/", createAppointment);
router.get("/Status", getAppointmentsByStatus); // Filtered by status (must be last)

module.exports = router;