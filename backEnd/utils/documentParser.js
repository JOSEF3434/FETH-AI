const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { promisify } = require('util');
const fs = require('fs');

// Extract articles from uploaded document
exports.extractArticlesFromDocument = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  let text;

  try {
    if (ext === '.pdf') {
      const dataBuffer = await readFile(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      throw new Error('Unsupported file format. Only PDF and DOCX are supported.');
    }

    // Parse text to extract articles
    return parseLegalArticles(text);
  } catch (err) {
    console.error('Error parsing document:', err);
    throw err;
  }
};

// Parse text into article objects
function parseLegalArticles(text) {
  // This is a simplified parser - you'll need to customize based on your document structure
  const articles = [];
  const articleRegex = /(Article|Art\.?)\s*(\d+)[\s:\-]*([^\n]*)\n([\s\S]*?)(?=\n(Article|Art\.?)\s*\d+|$)/gi;
  
  let match;
  while ((match = articleRegex.exec(text)) !== null) {
    articles.push({
      article_number: match[2].trim(),
      title: match[3].trim(),
      description: match[4].trim()
    });
  }

  return articles;
}