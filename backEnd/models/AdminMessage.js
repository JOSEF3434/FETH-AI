const mongoose = require('mongoose');

const AdminMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    reason: { type: String, required: true },
    isSeen: { type: Boolean, required: true, default:false},
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdminMessage', AdminMessageSchema);
