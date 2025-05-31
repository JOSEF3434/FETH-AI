//controllers/legalController.js 
const path = require('path');
const fs = require('fs').promises;
const Lawyer = require("../models/lawyerModel");
const LegalArticle = require("../models/LegalArticle");
const { legalModel, matchingModel } = require('../utils/gemini');
const { extractArticlesFromDocument } = require('../utils/documentParser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Add retry utility function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Add cache implementation
const responseCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Add cache helper functions
const getCachedResponse = (key) => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedResponse = (key, data) => {
  responseCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Enhanced retry with better rate limit handling
const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && retries < maxRetries) {
        const retryAfter = error.errorDetails?.[2]?.retryDelay || delay;
        console.log(`Rate limited. Retrying in ${retryAfter} seconds... (Attempt ${retries + 1}/${maxRetries})`);
        await sleep(parseInt(retryAfter) * 1000 || delay);
        delay *= 2;
        retries++;
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
};

// Enhanced fallback response generator
const generateFallbackResponse = async (query, type, subclass) => {
  try {
    // Try to get relevant articles from database as fallback
    const relevantArticles = await LegalArticle.find({
      type,
      subclass,
      'articles.description': { $regex: new RegExp(query.split(' ').slice(0, 3).join('|'), 'i') }
    }).limit(3);

    if (relevantArticles.length > 0) {
      return {
        analysis: `Based on our database, here are some relevant legal provisions for your query about ${type} (${subclass}):`,
        applicableArticles: relevantArticles.flatMap(article => article.articles),
        nextSteps: [
          "For a more detailed analysis, please try again in a few minutes",
          "Consider consulting with a lawyer for specific legal advice",
          "Review the provided legal provisions for general guidance"
        ],
        isDatabaseFallback: true
      };
    }
  } catch (error) {
    console.error("Error fetching fallback articles:", error);
  }

  return {
    analysis: `Due to high demand, we're currently unable to process your query about ${type} (${subclass}). Please try again in a few minutes.`,
    applicableArticles: [],
    nextSteps: [
      "Try again in a few minutes",
      "Contact our support team if the issue persists",
      "Consider consulting with a lawyer directly for immediate assistance"
    ],
    isDatabaseFallback: false
  };
};

// Enhanced insert with document upload
exports.insertLegalArticles = async (req, res) => {
  try {
    const { type, subclass } = req.body;
    const file = req.file;

    if (!type || !subclass) {
      return res.status(400).json({ 
        error: "Type and subclass are required" 
      });
    }

    // If file is uploaded, extract articles
    let articles = [];
    if (file) {
      try {
        articles = await extractArticlesFromDocument(file.path);
        if (articles.length === 0) {
          return res.status(400).json({ 
            error: "No articles could be extracted from the document" 
          });
        }
      } catch (err) {
        return res.status(400).json({ 
          error: "Failed to process document", 
          details: err.message 
        });
      }
    } else if (req.body.articles) {
      // Manual article input
      articles = req.body.articles;
    } else {
      return res.status(400).json({ 
        error: "Either upload a document or provide articles array" 
      });
    }

    // Create or update legal article
    const legalArticle = await LegalArticle.findOneAndUpdate(
      { type, subclass },
      { 
        $set: { type, subclass },
        $push: { articles: { $each: articles } },
        ...(file && { documentPath: file.path })
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: "Legal articles saved successfully",
      data: {
        type: legalArticle.type,
        subclass: legalArticle.subclass,
        articleCount: legalArticle.articles.length,
        documentPath: legalArticle.documentPath
      }
    });
  } catch (error) {
    console.error("Error inserting legal articles:", error);
    res.status(500).json({ 
      error: "Internal server error",
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// Get all types and subclasses
exports.getLegalCategories = async (req, res) => {
  try {
    const categories = await LegalArticle.aggregate([
      {
        $group: {
          _id: "$type",
          subclasses: { $addToSet: "$subclass" }
        }
      },
      {
        $project: {
          type: "$_id",
          subclasses: 1,
          _id: 0
        }
      }
    ]);

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch categories" 
    });
  }
};

// Get articles by type and subclass
exports.getArticlesByCategory = async (req, res) => {
  try {
    const { type, subclass } = req.params;
    const { page = 1, limit = 1000 } = req.query;

    const legalArticle = await LegalArticle.findOne({ type, subclass })
      .select('articles')
      .slice('articles', [(page - 1) * limit, limit * 1]);

    if (!legalArticle || !legalArticle.articles.length) {
      return res.status(404).json({ 
        success: false, 
        message: "No articles found" 
      });
    }

    res.json({ 
      success: true, 
      data: legalArticle.articles,
      pagination: {
        page: page * 1,
        limit: limit * 1,
        total: legalArticle.articles.length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch articles" 
    });
  }
};

// Enhanced legal document processing
exports.processLegalQuery = async (req, res) => {
  try {
    const { type, subclass, query, location, language = 'en' } = req.body;

    // Validate input
    if (!type || !subclass || !query) {
      return res.status(400).json({
        success: false,
        error: "Type, subclass, and query are required fields"
      });
    }

    // 1. Process legal documents
    const legalDocPath = path.join(__dirname, `../legaldocuments/${type.toLowerCase()}/${subclass.toLowerCase().replace(/\s+/g, '_')}.docx`);

    let legalContent = '';
    try {
      legalContent = await fs.readFile(legalDocPath, 'utf-8');
    } catch (err) {
      console.warn(`Legal document not found at ${legalDocPath}`);
    }

    // 2. Generate AI response with legal context
    const legalPrompt = `
      You are an expert ${type} lawyer specializing in ${subclass}.
      User query: "${query}"
      Location: ${location || 'not specified'}
      
      ${legalContent ? `Reference document content:\n${legalContent.substring(0, 5000)}` : ''}
      
      Provide:
      1. Concise legal analysis (${language === 'am' ? 'in Amharic' : 'in English'})
      2. Relevant articles/laws from the document
      3. Next steps for the user
      
      Format response as JSON with:
      {
        analysis: string,
        relevantArticles: {article: string, description: string}[],
        nextSteps: string[]
      }
    `;

    const legalResult = await legalModel.generateContent(legalPrompt);
    const legalResponse = await legalResult.response;
    const legalText = legalResponse.text();

    // Parse AI response
    const jsonStart = legalText.indexOf('{');
    const jsonEnd = legalText.lastIndexOf('}') + 1;
    const legalAnalysis = JSON.parse(legalText.slice(jsonStart, jsonEnd));

    // 3. Find matching lawyers
    const lawyers = await Lawyer.find({
      specialization: new RegExp(subclass, 'i'),
      ...(location && {
        $or: [
          { city: new RegExp(location, 'i') },
          { region: new RegExp(location, 'i') }
        ]
      }),
      approved: "approved",
      states: true
    }).limit(50);

    // AI-powered lawyer matching
    const matchPrompt = `
      Legal issue: ${query}
      Subspecialty: ${subclass}
      Location preference: ${location || 'any'}
      
      Lawyer profiles (JSON array):
      ${JSON.stringify(lawyers.map(l => ({
      id: l._id,
      name: `${l.firstName} ${l.lastName}`,
      specialization: l.specialization,
      experience: l.yearsOfExperience,
      location: `${l.city}, ${l.region}`,
      rate: l.consultationFee,
      languages: l.languagesSpoken,
      rating: l.rating || 4 // Default rating if not available
    })))}
      
      Select top 3 lawyers considering:
      1. Specialization match
      2. Experience
      3. Location proximity
      4. Cost effectiveness
      5. Language compatibility
      
      Return JSON with:
      {
        recommendedLawyers: {
          id: string,
          matchScore: number (1-100),
          reason: string
        }[]
      }
    `;

    const matchResult = await matchingModel.generateContent(matchPrompt);
    const matchResponse = await matchResult.response;
    const matchText = matchResponse.text();

    const matchJsonStart = matchText.indexOf('{');
    const matchJsonEnd = matchText.lastIndexOf('}') + 1;
    const lawyerMatches = JSON.parse(matchText.slice(matchJsonStart, matchJsonEnd));

    // Combine results with full lawyer details
    const recommendedLawyers = lawyerMatches.recommendedLawyers.map(match => {
      const lawyer = lawyers.find(l => l._id.toString() === match.id);
      return {
        ...lawyer.toObject(),
        matchScore: match.matchScore,
        matchReason: match.reason
      };
    });

    res.json({
      success: true,
      legalAnalysis,
      recommendedLawyers
    });

  } catch (error) {
    console.error("Legal query processing error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process legal query",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Insert legal articles (No subarticle splitting)
exports.insertLegalArticless = async (req, res) => {
  try {
    // 1. Validate request body structure
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: "Request body must be a JSON object",
        example: {
          type: "Civil cases",
          subclass: "Contract Law",
          articles: [{
            article_number: "706",
            title: "Probatory value",
            description: "(1) The record of marriage..."
          }]
        }
      });
    }

    // 2. Destructure and validate required fields
    const { type, subclass, articles } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({
        error: "Missing or invalid 'type' field",
        validTypes: ["Civil cases", "Criminal Matters"]
      });
    }

    if (!subclass || typeof subclass !== 'string') {
      return res.status(400).json({
        error: "Missing or invalid 'subclass' field",
        example: "Contract Law"
      });
    }

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({
        error: "Missing or empty 'articles' array",
        example: [{
          article_number: "706",
          title: "Probatory value",
          description: "(1) The record of marriage..."
        }]
      });
    }

    // 3. Validate each article structure
    const invalidArticles = [];
    articles.forEach((article, index) => {
      if (!article.article_number || typeof article.article_number !== 'string') {
        invalidArticles.push(`Article ${index}: Missing article_number`);
      }
      if (article.title && typeof article.title !== 'string') {
        invalidArticles.push(`Article ${index}: Title must be string`);
      }
      if (!article.description || typeof article.description !== 'string') {
        invalidArticles.push(`Article ${index}: Missing description`);
      }
    });

    if (invalidArticles.length > 0) {
      return res.status(400).json({
        error: "Invalid article format",
        details: invalidArticles,
        exampleArticle: {
          article_number: "706",
          title: "Probatory value",
          description: "(1) The record of marriage..."
        }
      });
    }

    // 4. Check for duplicate article numbers in request
    const articleNumbers = articles.map(a => a.article_number);
    const duplicateNumbers = articleNumbers.filter((num, index) =>
      articleNumbers.indexOf(num) !== index
    );

    if (duplicateNumbers.length > 0) {
      return res.status(400).json({
        error: "Duplicate article numbers in request",
        duplicates: [...new Set(duplicateNumbers)]
      });
    }

    // 5. Check for existing article numbers in database
    const existingArticles = await LegalArticle.aggregate([
      { $unwind: "$articles" },
      {
        $match: {
          "articles.article_number": { $in: articleNumbers }
        }
      },
      {
        $project: {
          "articles.article_number": 1,
          "subclass": 1
        }
      }
    ]);

    if (existingArticles.length > 0) {
      return res.status(409).json({
        error: "Some article numbers already exist",
        conflicts: existingArticles.map(item => ({
          article_number: item.articles.article_number,
          existing_in: item.subclass
        }))
      });
    }

    // 6. Check document size (MongoDB has 16MB limit)
    const docSize = Buffer.byteLength(JSON.stringify(req.body));
    if (docSize > 15 * 1024 * 1024) { // 15MB safety margin
      return res.status(413).json({
        error: "Document too large",
        size: `${(docSize / (1024 * 1024)).toFixed(2)}MB`,
        suggestion: "Split into batches of 100-200 articles per request"
      });
    }

    // 7. Insert data with batch processing
    const BATCH_SIZE = 100;
    let insertedCount = 0;
    const errors = [];

    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      const batch = articles.slice(i, i + BATCH_SIZE);

      try {
        const result = await LegalArticle.findOneAndUpdate(
          { type, subclass },
          { $push: { articles: { $each: batch } } },
          { upsert: true, new: true }
        );
        insertedCount += batch.length;
      } catch (batchError) {
        errors.push({
          batch: i / BATCH_SIZE + 1,
          error: batchError.message,
          failedArticles: batch.map(a => a.article_number)
        });
      }
    }

    // 8. Return appropriate response
    if (errors.length > 0) {
      return res.status(207).json({ // 207 Multi-Status
        message: "Partial success",
        inserted: insertedCount,
        failed: articles.length - insertedCount,
        errors,
        suggestion: errors.length === 1 ?
          "Retry the failed batch" :
          "Some batches failed, please review errors"
      });
    }

    res.status(201).json({
      success: true,
      message: "All articles inserted successfully",
      type,
      subclass,
      count: insertedCount,
      firstArticle: articles[0].article_number,
      lastArticle: articles[articles.length - 1].article_number
    });

  } catch (error) {
    console.error("Insertion error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : null,
      support: "contact-support@legalapi.com"
    });
  }
};

// Get articles by type and subclass
exports.getLegalArticle = async (req, res) => {
  try {
    let { type, subclass } = req.params;

    // Ensure type matches database format (Convert "Civil cases" -> "Civil" and "Criminal Matters" -> "Criminal")
    if (type === "Civil cases") {
      type = "Civil";
    } else if (type === "Criminal Matters") {
      type = "Criminal";
    }

    // Find articles matching type and subclass
    const legalArticles = await LegalArticle.find({ type, subclass });

    if (!legalArticles || legalArticles.length === 0) {
      return res.status(404).json({ message: "No articles found" });
    }

    // Extract all articles from the matching documents
    let allArticles = [];
    legalArticles.forEach(doc => {
      allArticles = [...allArticles, ...doc.articles];
    });

    res.json({ type, subclass, articles: allArticles });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving legal articles", error });
  }
};

exports.getLegalArticles = async (req, res) => {
  try {
    const { query } = req.body;

    const prompt = `As a legal expert, provide 3 concise, authoritative articles about "${query}". 
                  Format as JSON: { articles: [{ title, summary, keyPoints[] }] }`;

    const result = await legalModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse and clean the response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const articles = JSON.parse(text.slice(jsonStart, jsonEnd));

    res.json({ success: true, articles });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate articles',
      details: err.message
    });
  }
};

// 🔹 Function to extract article numbers from Gemini's response
function extractArticles(text) {
  const articleRegex = /Article\s(\d+)/gi;
  const matches = [...text.matchAll(articleRegex)];
  return matches.map(match => `Article ${match[1]}`);
}
// Function to ensure sample articles exist
const ensureSampleArticles = async () => {
  try {
    const existingArticles = await LegalArticle.findOne({ 
      type: "Civil", 
      subclass: "Family law" 
    });

  } catch (error) {
    console.error("Error adding sample articles:", error);
  }
};

// Call this function when the server starts
ensureSampleArticles();

// Modify the analyzeQuery function
exports.analyzeQuery = async (req, res) => {
  const { query, type, subclass, language } = req.body;

  try {
    if (!query || !type || !subclass) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields." 
      });
    }

    // Generate cache key
    const cacheKey = `${type}-${subclass}-${query}-${language}`;
    
    // Check cache first
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      console.log("Serving from cache");
      return res.json({
        success: true,
        ...cachedResponse,
        isCached: true
      });
    }

    // First try to get relevant articles from database
    const relevantArticles = await LegalArticle.find({
      type: type === "Civil cases" ? "Civil" : type,
      subclass,
      'articles.description': { $regex: new RegExp(query.split(' ').slice(0, 3).join('|'), 'i') }
    }).limit(3);

    let analysis = '';
    let applicableArticles = [];

    if (relevantArticles.length > 0) {
      // Use database articles for analysis
      applicableArticles = relevantArticles.flatMap(article => article.articles);
      analysis = `Based on Ethiopian law, here are the relevant provisions for your query about ${subclass}:\n\n`;
      analysis += applicableArticles.map(article => 
        `Article ${article.article_number}: ${article.description}`
      ).join('\n\n');
    } else {
      // Fallback to Gemini AI
      const prompt = `
        As an Ethiopian legal expert in ${type} (${subclass}), analyze:
        "${query}"

        Respond in ${language === 'am' ? 'Amharic' : 'English'} with:
        1. Relevant laws (cite articles)
        2. Required evidence
        3. Legal procedures
        4. Potential challenges
      `;

      console.log("🔹 Sending prompt to Gemini:", prompt);

      try {
        const result = await retryWithBackoff(async () => {
          return await legalModel.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
          });
        });

        if (!result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error("Invalid response structure from Gemini API");
        }

        analysis = result.response.candidates[0].content.parts[0].text;
        applicableArticles = extractArticles(analysis);
      } catch (apiError) {
        console.error("API Error after retries:", apiError);
        analysis = `Due to high demand, we're currently unable to process your query about ${type} (${subclass}). Please try again in a few minutes.`;
      }
    }

    const response = {
      analysis,
      applicableArticles,
      isFallback: !relevantArticles.length,
      isDatabaseFallback: relevantArticles.length > 0
    };

    // Cache the response
    setCachedResponse(cacheKey, response);

    return res.json({
      success: true,
      ...response
    });

  } catch (error) {
    console.error("🚨 Error in analyzeQuery:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process query",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
