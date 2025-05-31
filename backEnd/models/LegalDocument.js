const mongoose = require("mongoose");

const LegalDocumentSchema = new mongoose.Schema({
  uploaderName: { type: String, required: true },
  uploaderEmail: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LegalDocument", LegalDocumentSchema);

