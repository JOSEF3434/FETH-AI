const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    balance: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
