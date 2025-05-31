const Appointment = require("../models/Appointment");
const Lawyer  = require("../models/lawyerModel");
const User = require("../models/User");
const { sendAppointmentEmail } = require('../utils/emailService');

// Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { lawyerLicenseNumber, appointmentDateTime, reason, notes } = req.body;
    const userId = req.user._id; // Get user ID from authenticated user

    // Validate required fields
    if (!lawyerLicenseNumber || !appointmentDateTime || !reason) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    // Parse and validate datetime
    const appointmentTime = new Date(appointmentDateTime);
    if (isNaN(appointmentTime)) {
      return res.status(400).json({ error: "Invalid appointment date and time" });
    }

    // 1. Find lawyer by license number in User collection
    const lawyer = await Lawyer.findOne({
      licenseNumber: lawyerLicenseNumber,
      userType: "Lawyer",
      states: true
    });

    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer not found or inactive" });
    }

    // 2. Check lawyer availability at requested time
    const lawyerConflict = await Appointment.findOne({
      lawyerId: lawyer._id,
      appointmentDateTime: {
        $gte: new Date(appointmentTime.getTime() - 30 * 60 * 1000), // 30 min before
        $lte: new Date(appointmentTime.getTime() + 30 * 60 * 1000)  // 30 min after
      },
      status: { $in: ["Pending", "Confirmed"] }
    });

    if (lawyerConflict) {
      return res.status(409).json({ 
        error: "Lawyer not available at this time",
        conflictingAppointment: {
          id: lawyerConflict._id,
          dateTime: lawyerConflict.appointmentDateTime,
          status: lawyerConflict.status
        }
      });
    }

    // 3. Check user availability (no overlapping appointments)
    const userConflict = await Appointment.findOne({
      userId: userId,
      appointmentDateTime: {
        $gte: new Date(appointmentTime.getTime() - 30 * 60 * 1000),
        $lte: new Date(appointmentTime.getTime() + 30 * 60 * 1000)
      },
      status: { $in: ["Pending", "Confirmed"] }
    });

    if (userConflict) {
      return res.status(409).json({ 
        error: "You already have an appointment at this time",
        yourAppointment: {
          id: userConflict._id,
          dateTime: userConflict.appointmentDateTime,
          with: userConflict.lawyerId
        }
      });
    }

    // Create the appointment if all checks pass
    const newAppointment = new Appointment({
      userId: userId,
      userName: req.user.name,
      userEmail: req.user.email,
      lawyerId: lawyer._id,
      lawyerName: `${lawyer.firstName} ${lawyer.lastName}`,
      lawyerEmail: lawyer.email,
      lawyerphone: lawyer.phone,
      lawyerLicenseNumber,
      appointmentDateTime: appointmentTime,
      reason,
      notes,
      status: "Pending"
    });
    

    const savedAppointment = await newAppointment.save();

    // Send notifications
    try {
      await sendAppointmentEmail(
        req.user.email,
        req.user.name,
        lawyer.email,
        lawyer.name,
        appointmentTime,
        reason,
        "pending"
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the appointment creation if email fails
    }

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: savedAppointment
    });

  } catch (error) {
    console.error("Appointment creation error:", error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validation error",
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: "Invalid data format",
        details: error.message
      });
    }

    res.status(500).json({ 
      error: "Failed to create appointment",
      details: error.message 
    });
  }
};

// Get all appointments for a user
exports.getUserAppointments = async (req, res) => {
  try {
    console.log("🔥 ENTER getUserAppointments");
    console.log("👤 req.user:", req.user);

    const userEmail = req.user.email;

    if (!userEmail) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    const appointments = await Appointment.find({
      userEmail: { $regex: new RegExp(userEmail, "i") },
      status: { $in: ["Pending", "Confirmed"] }
    })
      .populate("lawyerId")
      .sort({ appointmentDateTime: 1 });

    console.log("📦 Appointments found:", appointments);

    if (!appointments.length) {
      return res.status(404).json({ message: "No appointments found" });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error("❌ Error in getUserAppointments:", error.stack);
    res.status(500).json({
      error: "Failed to fetch appointments",
      details: error.message
    });
  }
};

// Get all appointments for a lawyer
exports.getLawyerAppointments = async (req, res) => {
  try {
    const lawyerId = req.user._id;
    
    const appointments = await Appointment.find({ lawyerId })
      .populate('userEmail', 'name email phone')
      .sort({ appointmentDateTime: -1 }); // Newest first

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching lawyer appointments:", error);
    res.status(500).json({ 
      error: "Failed to fetch appointments",
      details: error.message 
    });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id)
      .populate('userId', 'name email')
      .populate('lawyerId', 'name email licenseNumber specialization');

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check permissions
    if (!appointment.userId.equals(userId) && !appointment.lawyerId.equals(userId)) {
      return res.status(403).json({ error: "Not authorized to view this appointment" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
};

// Get all lawyers
exports.getAllLawyers = async (req, res) => {
  try {
    const lawyers = await User.find({ 
      userType: "Lawyer",
      state: "Active"
    }).select('name email licenseNumber specialization');

    res.status(200).json(lawyers);
  } catch (error) {
    console.error("Get lawyers error:", error);
    res.status(500).json({ error: "Failed to fetch lawyers" });
  }
};

// In getAvailableSlots controller:
exports.getAvailableSlots = async (req, res) => {
  try {
    const { lawyerLicenseNumber } = req.params;
    const { dateTime } = req.query; // Now getting datetime as query parameter
    
    if (!lawyerLicenseNumber) {
      return res.status(400).json({ error: "Lawyer license number is required" });
    }

    // Find lawyer by license number
    const lawyer = await User.findOne({ 
      licenseNumber: lawyerLicenseNumber,
      userType: "Lawyer",
      states: "true"
    });
    
    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer not found or not active" });
    }

    // Get all appointments for this lawyer (regardless of date)
    const existingAppointments = await Appointment.find({
      lawyerId: lawyer._id,
      status: { $in: ["Pending", "Confirmed"] }
    }).sort({ appointmentDateTime: 1 });

    // If no datetime provided, return all appointments
    if (!dateTime) {
      return res.status(200).json({
        lawyer: {
          licenseNumber: lawyer.licenseNumber,
          name: lawyer.name,
          specialization: lawyer.specialization
        },
        allAppointments: existingAppointments.map(appt => ({
          id: appt._id,
          dateTime: appt.appointmentDateTime,
          status: appt.status,
          reason: appt.reason
        })),
        message: "All appointments retrieved"
      });
    }

    // If datetime provided, check specific availability
    const requestedTime = new Date(dateTime);
    if (isNaN(requestedTime.getTime())) {
      return res.status(400).json({ error: "Invalid date/time format" });
    }

    // Check if the requested time is in lawyer's working hours (9AM-5PM Ethiopia time)
    const ethiopiaHour = requestedTime.getUTCHours() + 3; // UTC+3 for Ethiopia
    if (ethiopiaHour < 9 || ethiopiaHour >= 17) {
      return res.status(200).json({
        available: false,
        reason: "Outside working hours (9AM-5PM Ethiopia time)"
      });
    }

    // Check for conflicting appointments
    const bufferMinutes = 30; // Time buffer between appointments
    const timeBuffer = bufferMinutes * 60 * 1000; // Convert to milliseconds
    
    const conflict = existingAppointments.find(appt => {
      const apptTime = appt.appointmentDateTime.getTime();
      return Math.abs(apptTime - requestedTime.getTime()) < timeBuffer;
    });

    if (conflict) {
      return res.status(200).json({
        available: false,
        conflictingAppointment: {
          id: conflict._id,
          dateTime: conflict.appointmentDateTime,
          status: conflict.status
        },
        message: "Lawyer is not available at this time"
      });
    }

    res.status(200).json({
      available: true,
      lawyer: {
        licenseNumber: lawyer.licenseNumber,
        name: lawyer.name
      },
      requestedTime: requestedTime.toISOString(),
      message: "Lawyer is available at this time"
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      error: "Failed to check availability",
      details: error.message 
    });
  }
};

exports.checkLawyerAvailability = async (req, res) => {
  try {
    const { licenseNumber } = req.params;
    const { dateTime, duration } = req.query;

    if (!dateTime || !duration) {
      return res.status(400).json({ error: 'Date/time and duration are required' });
    }

    const appointmentTime = new Date(dateTime);
    const endTime = new Date(appointmentTime.getTime() + duration * 60000);

    // Check for existing appointments
    const existingAppointment = await Appointment.findOne({
      lawyerLicenseNumber: licenseNumber,
      appointmentDateTime: {
        $lt: endTime,
        $gt: appointmentTime
      },
      status: { $in: ['Pending', 'Confirmed'] }
    });

    if (existingAppointment) {
      return res.json({
        available: false,
        message: 'Lawyer has an existing appointment during this time',
        suggestedSlots: []
      });
    }

    res.json({
      available: true,
      message: 'Lawyer is available for this time slot',
      suggestedSlots: []
    });
  } catch (error) {
    console.error('Error checking lawyer availability:', error);
    res.status(500).json({ error: 'Failed to check lawyer availability' });
  }
};

// Get today's appointments for logged-in user/lawyer
exports.getTodaysAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;
    
    // Ethiopia is UTC+3
    const ethiopiaOffset = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    
    // Current time in Ethiopia
    const now = new Date();
    const ethiopiaNow = new Date(now.getTime() + ethiopiaOffset);
    
    // Start of today in Ethiopia (00:00:00 UTC+3)
    const startOfDay = new Date(ethiopiaNow);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const ethiopiaStartOfDay = new Date(startOfDay.getTime() - ethiopiaOffset);
    
    // End of today in Ethiopia (23:59:59 UTC+3)
    const endOfDay = new Date(ethiopiaNow);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const ethiopiaEndOfDay = new Date(endOfDay.getTime() - ethiopiaOffset);

    console.log('Ethiopia Today Range:', ethiopiaStartOfDay, 'to', ethiopiaEndOfDay);
    console.log('Now in Ethiopia:', ethiopiaNow);

    let query = {
      appointmentDateTime: { 
        $gte: ethiopiaStartOfDay, 
        $lte: ethiopiaEndOfDay 
      },
      status: { $in: ["Pending", "Confirmed"] }
    };

    // Add user-specific condition
    if (userType === "Lawyer") {
      query.lawyerId = userId;
    } else {
      query.userId = userId;
    }

    const appointments = await Appointment.find(query)
      .populate(userType === "Lawyer" ? 'userId' : 'lawyerId', 'name email')
      .sort({ appointmentDateTime: 1 });

    console.log('Found appointments:', appointments.length, appointments);

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error in getTodaysAppointments:", error.stack);
    res.status(500).json({ 
      error: "Failed to fetch today's appointments",
      details: error.message 
    });
  }
};

// Get past appointments for logged-in user/lawyer
exports.getPastAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;
    
    const now = new Date(); // Current date & time (for accuracy)

    let query = {
      $or: [
        // Past appointments (regardless of status)
        { appointmentDateTime: { $lt: now } },
        // Cancelled/Completed (regardless of date)
        { status: { $in: ["Completed", "Cancelled"] } }
      ]
    };

    // Apply user filtering (lawyer or client)
    if (userType === "Lawyer") {
      query.lawyerId = userId;
    } else {
      query.userId = userId;
    }

    const appointments = await Appointment.find(query)
      .populate(userType === "Lawyer" ? 'userId' : 'lawyerId', 'name email')
      .sort({ appointmentDateTime: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error("Error fetching past/closed appointments:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch past/closed appointments",
      message: error.message
    });
  }
}; 

// Add this new function
exports.completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id)
      .populate('userId', 'name email')
      .populate('lawyerId', 'name email');

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Only lawyer can complete appointments
    if (!appointment.lawyerId.equals(userId)) {
      return res.status(403).json({ error: "Not authorized to complete this appointment" });
    }

    // Check if already completed or cancelled
    if (["Completed", "Cancelled"].includes(appointment.status)) {
      return res.status(400).json({ 
        error: `Appointment is already ${appointment.status.toLowerCase()}`
      });
    }

    // Update status
    appointment.status = "Completed";
    await appointment.save();

    // Send completion emails
    try {
      await sendAppointmentEmail(
        appointment.userId.email,
        appointment.userId.name,
        appointment.lawyerId.email,
        appointment.lawyerId.name,
        appointment.appointmentDateTime,
        appointment.reason,
        "completed"
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    res.status(200).json({
      message: "Appointment marked as completed",
      appointment
    });
  } catch (error) {
    console.error("Complete appointment error:", error);
    res.status(500).json({ error: "Failed to complete appointment" });
  }
};

// Update the existing updateAppointmentStatus function
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // Validate status
    const validStatuses = ["Pending", "Confirmed", "Cancelled", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const appointment = await Appointment.findById(id)
      .populate('userId', 'name email')
      .populate('lawyerId', 'name email');

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check permissions - lawyer has full control
    const isLawyer = appointment.lawyerId._id.equals(userId);
    const isUser = appointment.userId._id.equals(userId);

    if (!isLawyer && !isUser) {
      return res.status(403).json({ error: "Not authorized to update this appointment" });
    }

    // Status transition rules
    if (status === "Confirmed" && !isLawyer) {
      return res.status(403).json({ error: "Only lawyer can confirm appointments" });
    }

    if (status === "Completed" && !isLawyer) {
      return res.status(403).json({ error: "Only lawyer can complete appointments" });
    }

    // Users can only cancel their own appointments
    if (status === "Cancelled" && isUser && 
        ["Completed", "Cancelled"].includes(appointment.status)) {
      return res.status(400).json({ 
        error: "Cannot cancel an already completed or cancelled appointment" 
      });
    }

    // Update status
    appointment.status = status;
    await appointment.save();

    // Send notification emails
    try {
      await sendAppointmentEmail(
        appointment.userId.email,
        appointment.userId.name,
        appointment.lawyerId.email,
        appointment.lawyerId.name,
        appointment.appointmentDateTime,
        appointment.reason,
        status.toLowerCase()
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    res.status(200).json({
      message: "Appointment status updated successfully",
      appointment
    });

  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({ 
      error: "Failed to update appointment",
      details: error.message 
    });
  }
};

// Check user availability
exports.checkUserAvailability = async (req, res) => {
  try {
    const { userId } = req.params;
    const { dateTime, duration } = req.query;

    if (!dateTime || !duration) {
      return res.status(400).json({ error: 'Date/time and duration are required' });
    }

    const appointmentTime = new Date(dateTime);
    const endTime = new Date(appointmentTime.getTime() + duration * 60000);

    // Check for existing appointments
    const existingAppointment = await Appointment.findOne({
      userEmail: userId,
      appointmentDateTime: {
        $lt: endTime,
        $gt: appointmentTime
      },
      status: { $in: ['Pending', 'Confirmed'] }
    });

    if (existingAppointment) {
      return res.json({
        available: false,
        message: 'User has an existing appointment during this time',
        suggestedSlots: []
      });
    }

    res.json({
      available: true,
      message: 'User is available for this time slot',
      suggestedSlots: []
    });
  } catch (error) {
    console.error('Error checking user availability:', error);
    res.status(500).json({ error: 'Failed to check user availability' });
  }
};

// Check availability for both user and lawyer
exports.checkAvailability = async (req, res) => {
  try {
    const { userId, lawyerLicenseNumber, dateTime } = req.body;

    if (!userId || !lawyerLicenseNumber || !dateTime) {
      return res.status(400).json({ 
        error: "Missing required fields",
        available: false 
      });
    }

    // Convert to Date object
    const requestedTime = new Date(dateTime);
    const endTime = new Date(requestedTime.getTime() + 60 * 60 * 1000); // 1 hour later

    // Find lawyer by license number
    const lawyer = await Lawyer.findOne({
      licenseNumber: lawyerLicenseNumber,
      userType: "Lawyer",
      states: true
    });

    if (!lawyer) {
      return res.status(404).json({ 
        error: "Lawyer not found or inactive",
        available: false 
      });
    }

    // Check lawyer availability
    const lawyerConflict = await Appointment.findOne({
      lawyerId: lawyer._id,
      appointmentDateTime: {
        $gte: requestedTime,
        $lt: endTime
      },
      status: { $in: ["Pending", "Confirmed"] }
    });

    if (lawyerConflict) {
      return res.status(200).json({
        available: false,
        message: "Lawyer is not available at this time",
        suggestedSlots: [] // You can implement logic to suggest alternative slots
      });
    }

    // Check user availability
    const userConflict = await Appointment.findOne({
      userEmail: userId,
      appointmentDateTime: {
        $gte: requestedTime,
        $lt: endTime
      },
      status: { $in: ["Pending", "Confirmed"] }
    });

    if (userConflict) {
      return res.status(200).json({
        available: false,
        message: "You already have an appointment at this time",
        suggestedSlots: [] // You can implement logic to suggest alternative slots
      });
    }

    // If no conflicts found, time slot is available
    res.status(200).json({
      available: true,
      message: "Time slot is available",
      timeSlot: {
        start: requestedTime,
        end: endTime
      }
    });

  } catch (error) {
    console.error("Availability check error:", error);
    res.status(500).json({ 
      error: "Failed to check availability",
      available: false 
    });
  }
};

// Get all appointments (without any conditions)
exports.getAllAppointments = async (req, res) => {
  try {
    console.log("Attempting to fetch all appointments..."); // Debug log
    
    const appointments = await Appointment.find({})
      .populate({
        path: 'userEmail',
        select: 'name email phone'
      })
      .populate({
        path: 'lawyerId',
        select: 'name email licenseNumber specialization'
      })
      .sort({ appointmentDateTime: -1 })
      .lean(); // Convert to plain JS objects

    console.log(`Found ${appointments.length} appointments`); // Debug log

    if (!appointments || appointments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No appointments found",
        appointments: []
      });
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });

  } catch (error) {
    console.error("Detailed Error:", error);
    
    // Specific error handling
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid data format",
        message: error.message
      });
    }
    
    if (error.name === 'MongoError') {
      return res.status(503).json({
        success: false,
        error: "Database service unavailable",
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: "Server error occurred while fetching appointments",
      detailedError: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// get appointment by states
exports.getAppointmentsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user._id;
    const userType = req.user.userType;

    // Validate status
    if (!status || !["Pending", "Confirmed", "Cancelled", "Completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid or missing status parameter" });
    }

    let query = { status };

    // Differentiate between user and lawyer views
    if (userType === "Lawyer") {
      query.lawyerId = userId;
    } else {
      query.userEmail = userId;
    }

    const appointments = await Appointment.find(query)
      .populate(userType === "Lawyer" ? 'userEmail' : 'lawyerId', 'name email licenseNumber')
      .sort({ appointmentDateTime: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments by status:", error);
    res.status(500).json({ 
      error: "Failed to fetch appointments",
      details: error.message 
    });
  }
};

// Get upcoming appointments for logged-in user
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    
    // Get appointments that are either:
    // 1. In the future, or
    // 2. Happening now (within the last hour)
    const appointments = await Appointment.find({
      userEmail: userId,
      $or: [
        { 
          appointmentDateTime: { $gte: now },
          status: { $in: ['Pending', 'Confirmed'] }
        },
        {
          appointmentDateTime: { 
            $gte: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
            $lte: now
          },
          status: 'Confirmed'
        }
      ]
    })
    .populate('lawyerId', 'name email licenseNumber specialization')
    .sort({ appointmentDateTime: 1 }); // Sort by soonest first

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch upcoming appointments',
      details: error.message 
    });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log(`Cancelling appointment ${id} for user ${userId}`); // Debug log

    const appointment = await Appointment.findOne({
      _id: id,
      userId: userId // Changed from userEmail to userId for consistency
    });

    if (!appointment) {
      console.log('Appointment not found or not owned by user');
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (['Cancelled', 'Completed'].includes(appointment.status)) {
      return res.status(400).json({ 
        error: `Appointment is already ${appointment.status.toLowerCase()}`
      });
    }

    // Check cancellation window (e.g., not within 1 hour of appointment)
    const now = new Date();
    const timeDifference = appointment.appointmentDateTime - now;
    
    if (timeDifference < 60 * 60 * 1000) {
      return res.status(400).json({ 
        error: "Cannot cancel within 1 hour of appointment time" 
      });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    // Send notification email
    try {
      await sendAppointmentEmail(
        appointment.userEmail,
        appointment.userName,
        appointment.lawyerEmail,
        appointment.lawyerName,
        appointment.appointmentDateTime,
        appointment.reason,
        "cancelled"
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    res.status(200).json({
      message: "Appointment cancelled successfully",
      appointment
    });
  } catch (error) {
    console.error("Cancel appointment error:", error.stack);
    res.status(500).json({ 
      error: "Failed to cancel appointment",
      details: error.message 
    });
  }
};
