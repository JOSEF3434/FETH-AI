const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true 
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  lawyerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lawyer', 
    required: true 
  },
  lawyerName: {
    type: String,
    required: true
  },
  lawyerEmail: {
    type: String,
    required: true
  },
  lawyerphone: { 
    type: Number, 
    required: true 
  },
  lawyerLicenseNumber: { 
    type: String, 
    required: true 
  },
  appointmentDateTime: { 
    type: Date, 
    required: true 
  },
  reason: { 
    type: String, 
    required: true,
    trim: true
  },
  status: { 
    type: String, 
    enum: ["Pending", "Confirmed", "Cancelled", "Completed"], 
    default: "Pending" 
  },
  notes: { 
    type: String, 
    trim: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
    paymentStatus: {
    type: String,
    enum: ["unpaid", "pending", "paid", "failed"],
    default: "unpaid"
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", AppointmentSchema);
