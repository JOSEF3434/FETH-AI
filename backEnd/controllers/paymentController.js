// controllers/paymentController.js
const axios = require("axios");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const Lawyer = require("../models/lawyerModel");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");

const CHAPA_API_KEY = process.env.CHAPA_API_KEY;
const CHAPA_BASE_URL = "https://api.chapa.co/v1";

// Initialize payment
exports.initializePayment = async (req, res) => {
 try {
    if (!CHAPA_API_KEY) {
      return res.status(500).json({ error: "Payment service not configured" });
    }
    const { appointmentId } = req.body;
    const userId = req.user._id;

    // Validate appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate("lawyerId", "consultationFee")
      .populate("userId", "email firstName lastName");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check if appointment belongs to user
    if (!appointment.userId.equals(userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Check if appointment is confirmed
    if (appointment.status !== "Confirmed") {
      return res.status(400).json({ 
        error: "Payment can only be made for confirmed appointments" 
      });
    }

    // Check if already paid
    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({ error: "Appointment already paid" });
    }

    // Calculate amount (using lawyer's consultation fee)
    const amount = appointment.lawyerId.consultationFee;

    // Create Chapa payment request
    const txRef = `appt-${appointmentId}-${uuidv4()}`;
    const callbackUrl = `${process.env.FRONTEND_URL}/payment/verify/${txRef}`;
    const returnUrl = `${process.env.FRONTEND_URL}/appointments/${appointmentId}`;

    const paymentData = {
      amount: amount.toString(),
      currency: "ETB",
      email: appointment.userId.email,
      first_name: appointment.userId.firstName,
      last_name: appointment.userId.lastName,
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
      customization: {
        title: "Legal ",
        description: `Payme`
      }
    };

    const response = await axios.post(
      `${CHAPA_BASE_URL}/transaction/initialize`,
      paymentData,
      {
       headers: {
  Authorization: `Bearer ${CHAPA_API_KEY}`,
  "Content-Type": "application/json"
}
      }
    );

    // Create payment record
    const payment = new Payment({
      appointmentId,
      userId,
      lawyerId: appointment.lawyerId,
      amount,
      chapaTransactionId: txRef,
      paymentStatus: "pending"
    });

    await payment.save();

    // Update appointment payment status
    appointment.paymentStatus = "pending";
    appointment.paymentId = payment._id;
    await appointment.save();

    res.status(200).json({
      paymentUrl: response.data.data.checkout_url,
      paymentId: payment._id
    });

  } catch (error) {
    console.error("Payment initialization error:", error);
    res.status(500).json({ 
      error: "Failed to initialize payment",
      details: error.response?.data || error.message
    });
  }
};

// Verify payment (webhook)
exports.verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.body;

    // Verify with Chapa
    const response = await axios.get(
      `${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_API_KEY}`
        }
      }
    );

    const paymentData = response.data.data;

    // Find payment record
    const payment = await Payment.findOne({ chapaTransactionId: tx_ref });
    if (!payment) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    // Update payment status
    payment.paymentStatus = paymentData.status === "success" ? "successful" : "failed";
    payment.verificationData = paymentData;
    await payment.save();

    // Update appointment status
    const appointment = await Appointment.findById(payment.appointmentId);
    if (appointment) {
      appointment.paymentStatus = payment.paymentStatus === "successful" ? "paid" : "failed";
      await appointment.save();
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ 
      error: "Failed to verify payment",
      details: error.response?.data || error.message
    });
  }
};

// Get payment history for user
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;

    const payments = await Payment.find({ userId })
      .populate("appointmentId")
      .populate("lawyerId", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};

