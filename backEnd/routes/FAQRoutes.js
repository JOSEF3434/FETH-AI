// routes/faqRoutes.js
const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQModel');

// Public question submission
router.post('/ask', async (req, res) => {
  try {
    const { question, category, name, email } = req.body;
    
    const faq = new FAQ({
      question,
      category,
      askedBy: { name, email }
    });

    const newFAQ = await faq.save();
    res.status(201).json({ 
      success: true, 
      data: newFAQ,
      message: 'Question submitted successfully' 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// Lawyer answer submission
router.patch('/answer/:id', async (req, res) => {
  try {
    const { answer, lawyerName, lawyerEmail, licenseNumber } = req.body;
    
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      {
        answer,
        isAnswered: true,
        answeredBy: {
          lawyerName,
          lawyerEmail,
          licenseNumber,
          answeredAt: Date.now()
        }
      },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found' 
      });
    }

    res.json({ 
      success: true, 
      data: faq,
      message: 'Answer submitted successfully' 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// Get unanswered questions (for lawyers)
router.get('/unanswered', async (req, res) => {
  try {
    const faqs = await FAQ.find({ isAnswered: false })
                         .sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      data: faqs 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// Get answered questions (for public)
router.get('/answered', async (req, res) => {
  try {
    const faqs = await FAQ.find({ isAnswered: true })
                         .sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      data: faqs 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// Get all FAQs
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find()
                         .sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      data: faqs 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

module.exports = router;