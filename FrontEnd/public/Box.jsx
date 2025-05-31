// routes/chatRoutes.js 
const express = require("express");
const multer = require("multer");
const path = require("path");
const { sendMessage, markAsSeen,getMessages, getAllUsers, getLastMessage, unseenCount } = require("../controllers/chatController");
const router = express.Router();

// Ensure uploads folder exists
const fs = require("fs");
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


router.get("/unseenCount/:userId/:friendId", unseenCount);

// Get last message between two users
router.get("/lastMessage/:senderId/:receiverId",getLastMessage);

// Get user by ID
router.get("/users/:id", getAllUsers);

module.exports = router;

// controllers/chatController.js
const mongoose = require("mongoose");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;  // Get sender & receiver from URL
    const { message, fileUrl, messageType } = req.body;

    if (!senderId || !receiverId || (!message && !fileUrl)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newMessage = new ChatMessage({
      sender: senderId,
      receiver: receiverId,
      message,
      fileUrl,
      messageType,
    });

    await newMessage.save();
    req.io.emit("newMessage", newMessage);
    return res.status(201).json(newMessage);

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get chat messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await ChatMessage.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark message as seen
exports.markAsSeen = async (req, res) => {
  try {
      const { userId, friendId, markAll } = req.body;
      
      if (markAll) {
          // Mark all messages from this conversation as seen
          await ChatMessage.updateMany(
              { 
                  $or: [
                      { sender: friendId, receiver: userId },
                      { sender: userId, receiver: friendId }
                  ],
                  seenBy: { $ne: userId } 
              },
              { $push: { seenBy: userId } }
          );
      }
      
      // Emit event to notify the other user
      req.io.to(friendId).emit('messagesSeen', { 
          userId: userId,
          timestamp: new Date() 
      });
      
      res.status(200).json({ success: true });
  } catch (error) {
      console.error("Error marking messages as seen:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};

exports.getuserbyid = async (req, res) => {
  try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ message: "Invalid user ID format" });
      }

      const user = await User.findById(id);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
  } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email profilePicture"); // Fetch users with selected fields
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.unseenCount = async (req, res) => {
  try {
      const { userId, friendId } = req.params;

      const unseenMessages = await ChatMessage.countDocuments({
          receiver: userId,
          sender: friendId,
          seenBy: { $ne: userId },
      });

      res.status(200).json({ unseenCount: unseenMessages });
  } catch (error) {
      console.error("Error fetching unseen messages:", error);
      res.status(500).json({ error: "Internal server error" });
  }}

// Add to chatController.js
exports.getLastMessage = async (req, res) => {
  try {
      const { senderId, receiverId } = req.params;
      
      const lastMessage = await ChatMessage.findOne({
          $or: [
              { sender: senderId, receiver: receiverId },
              { sender: receiverId, receiver: senderId }
          ]
      }).sort({ createdAt: -1 }).limit(1);
      
      res.status(200).json(lastMessage || null);
  } catch (error) {
      console.error("Error fetching last message:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};
