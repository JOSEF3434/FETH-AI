require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const axios = require('axios');
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const Payment = require('./models/Payment');
require("./db"); 

const aiRoute = require("./routes/aiRoute")
const faqRoutes = require('./routes/FAQRoutes')
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const contactRoutes = require('./routes/contact');
const callRoutes = require("./routes/callRoutes");
const legalRoutes = require("./routes/legalRoutes");
const lawyerRoutes = require('./routes/lawyerRoutes');
const paymentRoutes = require("./routes/paymentRoutes");
const customerRoutes = require('./routes/customerRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const lawyerappointmentsRoutes = require('./routes/LawyerAppointmentRoutes');
const adminMessageRouter = require('./routes/adminMessageRouter');
const legalDocumentRoutes = require("./routes/legalDocumentRoutes");
const multer = require("multer");
 
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const originalExt = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${originalExt}`);
  },
});

const upload = multer({
  storage,
});

// Middleware for file uploads
const uploadMiddleware = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "barCertificate", maxCount: 1 },
  { name: "additionalCertifications", maxCount: 1 },
]);

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
      "image/jpeg", "image/png", "image/gif",
      "video/mp4", "video/mov", "video/avi",
      "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
  } else {
      cb(new Error("Unsupported file format"), false);
  }
};

app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  next();
});
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads")); 
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", aiRoute);
app.use("/api", chatRoutes);
app.use('/api/faqs', faqRoutes);
app.use("/api/call", callRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/legal", legalRoutes);
app.use('/api/contact', contactRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/messages', adminMessageRouter);
app.use('/api/appointments', appointmentRoutes);
app.use("/api/legal-documents", legalDocumentRoutes); 
app.use("/api/lawyers", uploadMiddleware, lawyerRoutes); 
app.use('/api/lawyerappointments', lawyerappointmentsRoutes);

const activeUsers = new Map(); // Store active users

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("userOnline", (userId) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} is online`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove the user from active users
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
  });
});

// WebRTC Signaling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("call-user", ({ receiverId, offer }) => {
    io.to(receiverId).emit("incoming-call", { callerId: socket.id, offer });
  });

  socket.on("answer-call", ({ callerId, answer }) => {
    io.to(callerId).emit("call-answered", { answer });
  });

  socket.on("reject-call", ({ callerId }) => {
    io.to(callerId).emit("call-rejected");
  });

  socket.on("end-call", ({ receiverId }) => {
    io.to(receiverId).emit("end-call");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// API to store call history
app.post("/api/call-history", async (req, res) => {
  try {
    const call = new CallHistory(req.body);
    await call.save();
    res.status(201).json({ message: "Call history saved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment Checker Configuration
const CHAPA_API_KEY = process.env.CHAPA_API_KEY;
const CHAPA_VERIFICATION_URL = 'https://api.chapa.co/v1/transaction/verify/';

// Function to verify payment with Chapa
async function verifyChapaPayment(transactionReference) {
  try {
    const response = await axios.get(`${CHAPA_VERIFICATION_URL}${transactionReference}`, {
      headers: {
        'Authorization': `Bearer ${CHAPA_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error verifying Chapa payment:', error.message);
    if (error.response) {
      console.error('Chapa API response:', error.response.data);
    }
    return null;
  }
}

// Function to check and update payment status
async function checkAndUpdatePayments() {
  try {
    // Find all pending payments
    const pendingPayments = await Payment.find({ paymentStatus: 'pending' });
    
    if (pendingPayments.length === 0) {
      //console.log('No pending payments found.');
      return;
    }
    
    console.log(`Found ${pendingPayments.length} pending payments. Checking status...`);
    
    for (const payment of pendingPayments) {
      try {
        // Verify payment with Chapa
        const verificationData = await verifyChapaPayment(payment.chapaTransactionId);
        
        let newStatus = 'failed';
        let appointmentStatus = 'Pending';
        
        if (verificationData && verificationData.status === 'success') {
          newStatus = 'successful';
          appointmentStatus = 'Confirmed';
          console.log(`Payment ${payment._id} verified successfully.`);
        } else {
          console.log(`Payment ${payment._id} verification failed or still pending.`);
        }
        
        // Update payment status
        await Payment.findByIdAndUpdate(
          payment._id,
          {
            paymentStatus: newStatus,
            verificationData: verificationData || null
          },
          { new: true }
        );
        
        // Update associated appointment
        await Appointment.findByIdAndUpdate(
          payment.appointmentId,
          {
            paymentStatus: newStatus === 'successful' ? 'paid' : 'failed',
            status: appointmentStatus
          }
        );
        
        console.log(`Updated payment ${payment._id} to status: ${newStatus}`);
        
      } catch (error) {
        console.error(`Error processing payment ${payment._id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in payment check job:', error.message);
  }
}

// Start the payment checker when the server starts
function startPaymentChecker() {
  // Run immediately on startup
  checkAndUpdatePayments();
  
  // Then run every 10 seconds
  const interval = setInterval(checkAndUpdatePayments, 10000);
  
  // For clean shutdown
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('Payment checker stopped.');
    process.exit();
  });
}

const PORT = process.env.PORT || 4000;

server.listen(PORT, async () => {
  try {
    console.log(`Server running on port ${PORT}`);
    
    // Start the payment checker after server starts
    startPaymentChecker();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});