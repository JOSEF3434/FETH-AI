const express = require("express");
const { createReport, getReports, updateReport, deleteReport } = require("../controllers/reportController");

const router = express.Router();

router.post("/", createReport);         // Create a report
router.get("/", getReports);            // Retrieve all reports
router.put("/:reportId", updateReport); // Update report status
router.delete("/:reportId", deleteReport); // Delete report

module.exports = router;
