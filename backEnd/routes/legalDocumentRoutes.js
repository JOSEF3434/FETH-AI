const express = require("express");
const LegalDocument = require("../models/LegalDocument");
const multer = require("multer");
const { uploadLegalDocument, getLegalDocuments, downloadDocument } = require("../controllers/legalDocumentController");

const router = express.Router();

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
router.post("/upload", upload.single("file"), uploadLegalDocument);
router.get("/", getLegalDocuments);

router.get('/download/:filename', downloadDocument);


router.delete('/:id', async (req, res) => {
  try {
    const document = await LegalDocument.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
