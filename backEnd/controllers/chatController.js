// controllers/chatController.js
const mongoose = require("mongoose");
const User = require("../models/User");
const ChatMessage = require("../models/ChatMessage");
const Lawyer = require("../models/lawyerModel");

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
    const { messageId, userId } = req.body;
    const message = await ChatMessage.findById(messageId);

    if (!message) return res.status(404).json({ error: "Message not found" });

    if (!message.seenBy.includes(userId)) {
      message.seenBy.push(userId);
      await message.save();
    }

    req.io.emit("messageSeen", { messageId, userId });

    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("Error marking message as seen:", error);
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

// In controllers/chatController.js
exports.getChatData = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get all users and lawyers
    const [users, lawyers] = await Promise.all([
      User.find({ _id: { $ne: userId }}, "name email profilePicture"),
      Lawyer.find({}, "firstName lastName profilePicture status")
    ]);

    // Combine and format contacts
    const contacts = [
      ...users.map(u => ({ 
        ...u.toObject(), 
        isLawyer: false, 
        name: u.name 
      })),
      ...lawyers.map(l => ({ 
        ...l.toObject(), 
        isLawyer: true, 
        name: `${l.firstName} ${l.lastName}`,
        _id: l._id
      }))
    ];

    // Get counts and last messages for all contacts at once
    const chatData = await Promise.all(contacts.map(async contact => {
      const unseenCount = await ChatMessage.countDocuments({
        receiver: userId,
        sender: contact._id,
        seenBy: { $ne: userId }
      });

      const lastMessage = await ChatMessage.findOne({
        $or: [
          { sender: userId, receiver: contact._id },
          { sender: contact._id, receiver: userId }
        ]
      }).sort({ createdAt: -1 });

      return {
        ...contact,
        unseenCount,
        lastMessage: lastMessage?.message || "No messages yet",
        lastMessageTime: lastMessage?.createdAt || new Date(0)
      };
    }));

    res.status(200).json(chatData);
  } catch (error) {
    console.error("Error getting chat data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// controllers/messageController.js
exports.getUnseenMessageCount = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const unseenCount = await Message.countDocuments({
      sender: senderId,
      receiver: receiverId,
      seen: false,
    });

    res.status(200).json({ count: unseenCount });
  } catch (error) {
    console.error("Error in getUnseenMessageCount:", error);
    res.status(500).json({ error: "Server error" });
  }
};
