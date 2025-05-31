import { useState, useEffect, useCallback, useMemo} from 'react';
import axios from 'axios';
import { 
  FaSearch, 
  FaChevronDown, 
  FaChevronUp, 
  FaFilter, 
  FaTimes,
  FaSpinner
} from 'react-icons/fa';

// Constants for API configuration
const API_BASE_URL = 'http://localhost:4000/api';
const ENDPOINTS = {
  ALL: '/faqs',
  ANSWERED: '/faqs/answered',
  UNANSWERED: '/faqs/unanswered'
};

const PublicFaqPage = () => {
  // State management
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const [viewMode, setViewMode] = useState('all'); // 'all', 'answered', 'unanswered'
  const [filterOpen, setFilterOpen] = useState(false);

  // Memoized fetch function
  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = ENDPOINTS.ALL;
      if (viewMode === 'answered') endpoint = ENDPOINTS.ANSWERED;
      if (viewMode === 'unanswered') endpoint = ENDPOINTS.UNANSWERED;
      
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      
      if (!response.data?.success) {
        throw new Error('Failed to fetch FAQs');
      }
      
      setFaqs(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Toggle FAQ expansion
  const toggleFaq = useCallback((id) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = searchTerm === '' || 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (faq.answer && faq.answer.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => 
    ['All', ...new Set(faqs.map(faq => faq.category))],
    [faqs]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('All');
  }, []);

  // Loading state
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
      <p className="text-gray-600">Loading FAQs...</p>
    </div>
  );

  // Error state
  if (error) return (
    <div className="max-w-2xl mx-auto p-6 bg-red-50 rounded-lg">
      <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading FAQs</h2>
      <p className="text-red-600 mb-4">{error}</p>
      <button 
        onClick={fetchFaqs}
        className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {viewMode === 'answered' ? 'Browse answered questions' : 
           viewMode === 'unanswered' ? 'Questions waiting for answers' : 
           'All community questions'}
        </p>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Controls */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <div className="relative flex-1 mr-2">
            <input
              type="text"
              placeholder="Search FAQs..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search FAQs"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg"
            aria-label="Toggle filters"
          >
            {filterOpen ? <FaTimes /> : <FaFilter />}
          </button>
        </div>

        {/* Mobile Filter Panel */}
        {filterOpen && (
          <div className="md:hidden bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="font-semibold text-lg mb-3">Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">View</label>
                <div className="flex space-x-2">
                  {['all', 'answered', 'unanswered'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1 rounded-lg text-sm ${viewMode === mode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      aria-label={`Show ${mode} questions`}
                    >
                      {mode === 'all' && 'All'}
                      {mode === 'answered' && 'Answered'}
                      {mode === 'unanswered' && 'Unanswered'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="mobile-category" className="block text-gray-700 mb-2">Category</label>
                <select
                  id="mobile-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={resetFilters}
                className="w-full py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                aria-label="Reset filters"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow-sm sticky top-4">
            {/* View Mode Selector */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">View</h3>
              <div className="space-y-2">
                {['all', 'answered', 'unanswered'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      viewMode === mode ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                    aria-label={`Show ${mode} questions`}
                  >
                    {mode === 'all' && 'All Questions'}
                    {mode === 'answered' && 'Answered Questions'}
                    {mode === 'unanswered' && 'Unanswered Questions'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <label htmlFor="search" className="font-semibold text-lg mb-3 block">Search</label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Search FAQs..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search FAQs"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Categories</h3>
              <ul className="space-y-2">
                {categories.map(category => (
                  <li key={category}>
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${
                        selectedCategory === category ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                      aria-label={`Filter by ${category} category`}
                    >
                      {category} ({category === 'All' ? faqs.length : faqs.filter(f => f.category === category).length})
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="w-full py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              aria-label="Reset all filters"
            >
              Reset All Filters
            </button>
          </div>
        </aside>

        {/* FAQ List Content */}
        <main className="md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {viewMode === 'all' && 'All Questions'}
              {viewMode === 'answered' && 'Answered Questions'}
              {viewMode === 'unanswered' && 'Unanswered Questions'}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              <span className="text-gray-500 font-normal ml-2">({filteredFaqs.length} results)</span>
            </h2>
          </div>

          {/* Empty State */}
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 mb-4">
                {viewMode === 'answered' ? 'No answered questions found' :
                 viewMode === 'unanswered' ? 'No unanswered questions at this time' :
                 'No questions found matching your criteria'}
              </p>
              <button 
                onClick={resetFilters}
                className="px-4 py-2 text-blue-600 hover:underline"
                aria-label="Clear all filters"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map(faq => (
                <article 
                  key={faq._id} 
                  className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all ${
                    faq.isFeatured ? 'border-l-4 border-blue-500' : ''
                  } ${!faq.isAnswered ? 'bg-gray-50' : ''}`}
                  aria-expanded={expandedFaqs[faq._id]}
                >
                  <button
                    onClick={() => toggleFaq(faq._id)}
                    className="w-full flex justify-between items-center text-left"
                    aria-label={`Toggle answer for: ${faq.question}`}
                  >
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{faq.question}</h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <time 
                          dateTime={new Date(faq.createdAt).toISOString()}
                          className="text-sm text-gray-500"
                        >
                          {new Date(faq.createdAt).toLocaleDateString()}
                        </time>
                        {faq.isAnswered ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Answered
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Needs Answer
                          </span>
                        )}
                        {faq.isFeatured && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    {expandedFaqs[faq._id] ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </button>
                  {expandedFaqs[faq._id] && (
                    <div className="mt-4 text-gray-600 space-y-3">
                      {faq.isAnswered ? (
                        <>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Answer:</h4>
                            <p>{faq.answer}</p>
                          </div>
                          {faq.answeredBy && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h4 className="font-medium mb-1">Answered by:</h4>
                              <p>{faq.answeredBy.lawyerName}</p>
                              {faq.answeredBy.licenseNumber && (
                                <p className="text-sm">License: {faq.answeredBy.licenseNumber}</p>
                              )}
                              {faq.answeredBy.phone && (
                                <p className="text-sm">Phone: {faq.answeredBy.phone}</p>
                              )}
                              <time 
                                dateTime={new Date(faq.answeredBy.answeredAt).toISOString()}
                                className="text-xs text-gray-500 mt-1 block"
                              >
                                Answered on: {new Date(faq.answeredBy.answeredAt).toLocaleDateString()}
                              </time>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
                          <p>This question hasn't been answered yet.</p>
                          {faq.askedBy && (
                            <p className="text-sm mt-2">
                              Asked by: {faq.askedBy.name} ({faq.askedBy.email})
                            </p>
                          )}
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {faq.category}
                        </span>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PublicFaqPage;