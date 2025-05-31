const mongoose = require("mongoose");

const CallHistorySchema = new mongoose.Schema({
  callerId: String,
  receiverId: String,
  status: String,
  timestamp: Date,
});

module.exports = mongoose.model("CallHistory", CallHistorySchema);
