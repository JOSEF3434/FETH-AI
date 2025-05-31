// routes/chatRoutes.js 
const express = require("express");
const multer = require("multer");
const path = require("path");
const { sendMessage, markAsSeen,getMessages, getAllUsers, getUnseenMessageCount, getChatData } = require("../controllers/chatController");
const router = express.Router();

// Ensure uploads folder exists
const fs = require("fs");
const { getActiveApprovedLawyers, getLawyerDetails } = require("../controllers/lawyerController");
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });
router.post("/messages/:senderId/:receiverId", sendMessage);
router.get("/messages/:senderId/:receiverId", getMessages);
router.post("/messages/seen", markAsSeen);//messages
router.post("/upload", upload.single("file"), (req, res) => {
  res.json({ fileUrl: `http://localhost:4000/uploads/${req.file.filename}` });
});

// routes/messageRoutes.js
router.get('/unseenCount/:senderId/:receiverId', getUnseenMessageCount);

// Get user by ID
router.get("/users/:id", getAllUsers);
router.get("/lawyer/list", getActiveApprovedLawyers); // Get all lawyers by id  
router.get("/lawyer/:id", getLawyerDetails);  // Get Lawyer detail by id
router.get("/data/:userId", getChatData);
  
module.exports = router;
