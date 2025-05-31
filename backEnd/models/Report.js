const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedUserEmail: { type: String, required: true },
    reportedUserType: { type: String, required: true, enum: ["User", "Lawyer", "Admin"] },
    caseDescription: { type: String, required: true },
    status: { type: String, default: "Pending", enum: ["Pending", "Reviewed", "Resolved"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
