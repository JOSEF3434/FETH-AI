// server/routes/aiRoute.js

const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/ask-legal", async (req, res) => {
  const { question } = req.body;
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(question);
  const response = await result.response;
  res.json({ answer: response.text() });
});

module.exports = router;