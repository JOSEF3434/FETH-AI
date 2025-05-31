const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: [true, 'Question is required'] 
  },
  answer: { 
    type: String,
    default: ''
  },
  category: { 
    type: String, 
    default: 'General'
  },
  isAnswered: {
    type: Boolean,
    default: false // Default is false when question is created
  },
  answeredBy: {
    lawyerName: String,
    lawyerEmail: String,
    licenseNumber: String,
    phone: String, // Added phone field
    answeredAt: Date
  },
  askedBy: {
    name: String,
    email: String,
    phone: String // Added phone field for asker
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save hook to automatically set isAnswered
faqSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Automatically set isAnswered if answer exists and isn't empty
  if (this.answer && this.answer.trim().length > 0 && !this.isAnswered) {
    this.isAnswered = true;
    if (!this.answeredBy.answeredAt) {
      this.answeredBy.answeredAt = new Date();
    }
  }
  
  // If answer is removed, mark as unanswered
  if ((!this.answer || this.answer.trim().length === 0) && this.isAnswered) {
    this.isAnswered = false;
    this.answeredBy = {};
  }
  
  next();
});

// Add static methods for querying
faqSchema.statics.getAnswered = function() {
  return this.find({ isAnswered: true }).sort({ createdAt: -1 });
};

faqSchema.statics.getUnanswered = function() {
  return this.find({ isAnswered: false }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('FAQ', faqSchema);