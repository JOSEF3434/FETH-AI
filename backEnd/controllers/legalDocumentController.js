const LegalDocument = require("../models/LegalDocument");
const express = require('express');
const router = express.Router();
const path = require('path');

// Upload File Handler
exports.uploadLegalDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { uploaderName, uploaderEmail } = req.body;
    const filePath = `/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype;

    const document = new LegalDocument({
      uploaderName,
      uploaderEmail,
      filePath,
      fileType,
    });

    await document.save();
    res.status(201).json({ message: "File uploaded successfully", document });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Uploaded Documents
exports.getLegalDocuments = async (req, res) => {
  try {
    const documents = await LegalDocument.find();
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadDocument = async (filePath) => {
  try {
    const filename = filePath.split('/').pop();
    const response = await fetch(`${API_URL}/api/download/${filename}`);
    if (!response.ok) throw new Error('Download failed');
    window.open(response.url, '_blank');
  } catch (err) {
    alert('Failed to download document: ' + err.message);
  }
};