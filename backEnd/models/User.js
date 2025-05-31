    // models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" }, // Relative path
  userType: { type: String, enum: ["User", "Manager", "Admin"], default: "User" },
  state: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model("Users", UserSchema);

