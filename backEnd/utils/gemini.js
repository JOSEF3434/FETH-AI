// Updated ./utils/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define AI models - using current model names
const legalModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash", // Updated to latest model name
  generationConfig: {
    temperature: 0.5,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 4096,
  }
});

const matchingModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash", // Updated to latest model name
  systemInstruction: "You are an expert legal matchmaker that analyzes lawyer profiles and user needs to find the best matches.",
  generationConfig: {
    temperature: 0.3,
    topP: 0.9,
    topK: 20,
    maxOutputTokens: 2048,
  }
});

module.exports = { legalModel, matchingModel };