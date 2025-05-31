// models/ChatMessage.js
const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Only for 1-on-1 chats
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null }, // For group chats
    message: { type: String, trim: true },
    fileUrl: { type: String }, // Handles all file types (image, audio, video, etc.)
    messageType: { type: String, enum: ["text", "image", "audio", "video", "file"], required: true },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Track who has seen the message
    isGroupChat: { type: Boolean, default: false },
    isLastMessage: { type: Boolean, default: false },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
