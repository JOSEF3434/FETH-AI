// "./routes/legalRoutes.js"
const express = require("express");
const {
  insertLegalArticles,
  insertLegalArticless,
  getLegalArticle,
  analyzeQuery,
  getLegalCategories,
  getArticlesByCategory,
  getLegalArticles,
  processLegalQuery
} = require("../controllers/legalController");
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getRecommendedLawyers } = require('../controllers/lawyerController');
const { getAllUsers, countUsersByType } = require("../controllers/userController");

// Legal Articles CRUD
router.post("/articles", 
  protect, 
  authorize('Admin', 'Manager'),
  //upload.single('document'), 
  insertLegalArticles
);

// Public access endpoints
router.get("/categories", getLegalCategories);
router.get("/articles/:type/:subclass", getArticlesByCategory);
router.get("/users",getAllUsers)

// Add this route
router.get("/count-by-type", countUsersByType);

// Legal Analysis
router.post("/analyze", analyzeQuery);
router.post("/query", processLegalQuery);



// Legal Articles CRUD Operations
router.post("/articles/insert", insertLegalArticless); // Insert new legal articles
router.get("/articlesw/:type/:subclass", getLegalArticle); // Get articles by type and subclass
router.post("/articles/search", getLegalArticles); // Search articles

// Lawyer Recommendations
router.post("/recommendations", getRecommendedLawyers);

module.exports = router;