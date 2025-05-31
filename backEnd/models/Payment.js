// models/Payment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lawyer",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  chapaTransactionId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "successful", "failed"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    default: "chapa"
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  verificationData: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);
