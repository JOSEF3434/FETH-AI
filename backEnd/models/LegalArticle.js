//models/LegalArticle.js ⚖️
const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  article_number: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const legalArticleSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["Civil", "Criminal", "Commercial", "Family", "Labor"], 
    required: true 
  },
  subclass: { 
    type: String, 
    required: true,
    index: true 
  },
  articles: [articleSchema],
  documentPath: String, // Store path to uploaded document
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for faster queries
legalArticleSchema.index({ type: 1, subclass: 1 });

// Pre-save hook to validate articles
legalArticleSchema.pre('save', function(next) {
  if (this.articles && this.articles.length > 0) {
    const articleNumbers = this.articles.map(a => a.article_number);
    if (new Set(articleNumbers).size !== articleNumbers.length) {
      throw new Error('Duplicate article numbers are not allowed');
    }
  }
  next();
});

module.exports = mongoose.model("LegalArticle", legalArticleSchema);