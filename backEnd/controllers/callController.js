const Call = require("../models/Call");

// Create a call entry
exports.startCall = async (req, res) => {
  try {
    const { callerId, receiverId, callType } = req.body;

    const call = new Call({ callerId, receiverId, callType });
    await call.save();

    res.status(201).json(call);
  } catch (error) {
    res.status(500).json({ message: "Error starting call", error });
  }
};

// End a call and update status
exports.endCall = async (req, res) => {
  try {
    const { callId, duration } = req.body;
    await Call.findByIdAndUpdate(callId, { status: "ended", duration });

    res.json({ message: "Call ended successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error ending call", error });
  }
};

// Get user call history
exports.getCallHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const calls = await Call.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });

    res.json(calls);
  } catch (error) {
    res.status(500).json({ message: "Error fetching call history", error });
  }
};
