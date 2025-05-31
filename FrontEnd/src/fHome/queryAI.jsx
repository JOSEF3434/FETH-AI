import axios from "axios"; //📁
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiX, FiSearch, FiUser, FiBookOpen, FiAward } from "react-icons/fi";

const Query = () => {
  const [type, setType] = useState("");
  const [subclass, setSubclass] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isSubclassDropdownOpen, setIsSubclassDropdownOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [isResponseBoardOpen, setIsResponseBoardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [isLocationDetected, setIsLocationDetected] = useState(false);
  const [language, setLanguage] = useState('en'); // Added language state

  const typeDropdownRef = useRef(null);
  const subclassDropdownRef = useRef(null);

  const legalTypes = ["Civil cases", "Criminal Matters"];
  const civilSubclasses = [
    "Succession law",
    "Tort law",
    "Property law",
    "Contract law",
    "Family law",
  ];
  const criminalSubclasses = [
    "Crimes against the state",
    "Crimes against life",
    "Crimes against person",
    "Crimes against property",
    "Petty offences",
  ];

  // UI content based on language
  const uiContent = {
    en: {
      title: "FETH AI Legal Assistant",
      subtitle: "Get instant legal guidance and connect with qualified lawyers",
      legalTypePlaceholder: "Select legal type",
      subclassPlaceholder: "Select subclass",
      issueLabel: "Describe your legal issue",
      issuePlaceholder: "Example: I need help with a divorce case involving child custody...",
      getHelp: "Get Help",
      analyzing: "Analyzing...",
      legalAssistance: "Legal Assistance",
      aiAnalysis: "AI Legal Analysis",
      relevantProvisions: "Relevant Legal Provisions",
      recommendedLawyers: "Recommended Lawyers",
      startNew: "Start new query",
      needHelp: "Need more help? Contact support",
      describeIssue: "Describe your legal issue",
      selectCategory: "Select a legal category",
      personalizedAdvice: "Get personalized legal advice and connect with qualified lawyers",
      beginWith: "Begin by selecting the type of legal matter you need help with"
    },
    am: {
      title: "FETH AI የህግ ረዳት",
      subtitle: "ፈጣን የህግ ምክር እና ብቁ የህግ ባለሙያዎችን ያግኙ",
      legalTypePlaceholder: "የህግ አይነት ይምረጡ",
      subclassPlaceholder: "ንዑስ ክፍል ይምረጡ",
      issueLabel: "የህግ ጉዳይዎን ይግለጹ",
      issuePlaceholder: "ምሳሌ፡ ስለ ልጅ ቤት በሚሆን የፍቺ ጉዳይ እርዳታ ያስፈልገኛል...",
      getHelp: "እርዳታ ያግኙ",
      analyzing: "በመተንተን ላይ...",
      legalAssistance: "የህግ እርዳታ",
      aiAnalysis: "የ AI የህግ ትንተና",
      relevantProvisions: "የሚመለከቱ የህግ ድንጋጌዎች",
      recommendedLawyers: "የሚመከሩ የህግ ባለሙያዎች",
      startNew: "አዲስ ጥያቄ ይጀምሩ",
      needHelp: "ተጨማሪ እርዳታ ይፈልጋሉ? ከድጋፍ ጋር ይገናኙ",
      describeIssue: "የህግ ጉዳይዎን ይግለጹ",
      selectCategory: "የህግ ክፍል ይምረጡ",
      personalizedAdvice: "ብጁ የህግ ምክር እና ብቁ የህግ ባለሙያዎችን ያግኙ",
      beginWith: "እርዳታ የሚያስፈልግዎትን የህግ ክፍል በመምረጥ ይጀምሩ"
    }
  };

  // Detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
            );
            const city = response.data.results[0]?.address_components.find(
              c => c.types.includes("locality")
            )?.long_name;
            if (city) {
              setLocation(city);
              setIsLocationDetected(true);
            }
          } catch (error) {
            console.error("Location detection failed:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target)
      ) {
        setIsTypeDropdownOpen(false);
      }
      if (
        subclassDropdownRef.current &&
        !subclassDropdownRef.current.contains(event.target)
      ) {
        setIsSubclassDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchClick = async () => {
    if (!searchQuery.trim() || !type || !subclass) {
      alert(language === 'am' ? "እባክዎ ሁሉንም መስኮች ይሙሉ!" : "Please fill all fields!");
      return;
    }

    setIsLoading(true);
    try {
      const [analysisRes, lawyersRes] = await Promise.all([
        axios.post(`http://localhost:4000/api/gemini/analyze`, {
          query: searchQuery,
          type,
          subclass,
          language
        }),
        axios.post("http://localhost:4000/api/lawyers/recommendations", {
          legalIssue: searchQuery,
          preferredLocation: location || null,
          language
        })
      ]);

      setResponse({
        analysis: analysisRes.data.analysis,
        articles: analysisRes.data.applicableArticles || [],
        lawyers: lawyersRes.data.data
      });
      setIsResponseBoardOpen(true);
    } catch (error) {
      console.error("Error:", error);
      alert(language === 'am' ? "ውሂብ ሲጫን ስህተት ተከስቷል። እባክዎ ደግመው ይሞክሩ።" : "Failed to fetch results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeResponseBoard = () => {
    setIsResponseBoardOpen(false);
    setResponse(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Language Toggle */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-l-md ${language === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('am')}
          className={`px-3 py-1 rounded-r-md ${language === 'am' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          አማርኛ
        </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">
          {uiContent[language].title}
        </h1>
        <p className="text-gray-600">
          {uiContent[language].subtitle}
        </p>
      </div>

      {/* Location Indicator */}
      {isLocationDetected && (
        <div className="mb-4 flex items-center text-sm text-gray-600">
          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full mr-2">
            {location}
          </span>
          <span> {language === 'am' ? 'አካባቢዎን አግኝተናል' : "We've detected your location"}</span>
          <button 
            onClick={() => setIsLocationDetected(false)}
            className="ml-2 text-indigo-600 hover:underline"
          >
            {language === 'am' ? 'ቀይር' : 'Change'}
          </button>
        </div>
      )}

      {/* Legal Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative" ref={typeDropdownRef}>
          <button
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
          >
            <span className={type ? "text-gray-900" : "text-gray-500"}>
              {type || uiContent[language].legalTypePlaceholder}
            </span>
            <FiChevronDown className={`transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {isTypeDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200">
              {legalTypes.map((legalType) => (
                <button
                  key={legalType}
                  onClick={() => {
                    setType(legalType);
                    setSubclass("");
                    setIsTypeDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  {legalType}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subclass Selection */}
        {type && (
          <div className="relative" ref={subclassDropdownRef}>
            <button
              onClick={() => setIsSubclassDropdownOpen(!isSubclassDropdownOpen)}
              className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
            >
              <span className={subclass ? "text-gray-900" : "text-gray-500"}>
                {subclass || uiContent[language].subclassPlaceholder}
              </span>
              <FiChevronDown className={`transition-transform ${isSubclassDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {isSubclassDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                {(type === "Civil cases" ? civilSubclasses : criminalSubclasses).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      setSubclass(sub);
                      setIsSubclassDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Input */}
      {type && subclass && (
        <div className="mb-6">
          <label htmlFor="legalQuery" className="block text-sm font-medium text-gray-700 mb-2">
            {uiContent[language].issueLabel}
          </label>
          <div className="relative">
            <textarea
              id="legalQuery"
              placeholder={uiContent[language].issuePlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={3}
            />
            <button
              onClick={handleSearchClick}
              disabled={isLoading || !searchQuery.trim()}
              className={`absolute right-2 bottom-2 flex items-center px-4 py-2 rounded-lg ${isLoading || !searchQuery.trim() ? "bg-gray-300" : "bg-indigo-600 hover:bg-indigo-700"} text-white transition-colors`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {uiContent[language].analyzing}
                </>
              ) : (
                <>
                  <FiSearch className="mr-2" />
                  {uiContent[language].getHelp}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Response Panel */}
      {isResponseBoardOpen && response && (
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {uiContent[language].legalAssistance}
            </h2>
            <button
              onClick={closeResponseBoard}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* AI Analysis Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-2 rounded-full mr-3">
                <FiBookOpen className="text-indigo-600" size={18} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {uiContent[language].aiAnalysis}
              </h3>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formatAnalysis(response.analysis) }} />
            </div>
          </div>

          {/* Relevant Articles Section */}
          {response.articles && response.articles.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <FiAward className="text-indigo-600" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {uiContent[language].relevantProvisions}
                </h3>
              </div>
              <div className="grid gap-3">
                {response.articles.map((article, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-medium text-indigo-700 mb-1">
                      {language === 'am' ? `አንቀጽ ${article.article_number}` : `Article ${article.article_number}`}: {article.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === 'am' ? article.description_am || article.description : article.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Lawyers Section */}
          {response.lawyers && response.lawyers.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <FiUser className="text-indigo-600" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {uiContent[language].recommendedLawyers}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {response.lawyers.map((lawyer) => (
                  <div key={lawyer._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                          <span className="text-indigo-700 font-semibold text-lg">
                            {lawyer.firstName.charAt(0)}{lawyer.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {lawyer.firstName} {lawyer.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {lawyer.specialization.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">
                            {language === 'am' ? 'ልምድ' : 'Experience'}:
                          </span>
                          {lawyer.yearsOfExperience} {language === 'am' ? 'ዓመታት' : 'years'}
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">
                            {language === 'am' ? 'ትምህርት' : 'Education'}:
                          </span>
                          {lawyer.lawDegree} {language === 'am' ? 'ከ' : 'from'} {lawyer.universityName}
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">
                            {language === 'am' ? 'አካባቢ' : 'Location'}:
                          </span>
                          {lawyer.city}, {lawyer.region}
                        </div>
                        {lawyer.matchScore && (
                          <div className="pt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{language === 'am' ? 'የሚመለከት ነጥብ' : 'Match Score'}</span>
                              <span>{lawyer.matchScore}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{ width: `${lawyer.matchScore}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="font-semibold text-indigo-700">
                          ETB {lawyer.consultationFee}/hr
                        </span>
                        <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors">
                          {language === 'am' ? 'ያግኙ' : 'Contact'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
            <button 
              onClick={() => {
                setSearchQuery("");
                closeResponseBoard();
              }}
              className="text-indigo-600 hover:underline"
            >
              {uiContent[language].startNew}
            </button>
            <Link 
              to="/help" 
              className="text-sm text-gray-600 hover:text-indigo-600"
            >
              {uiContent[language].needHelp}
            </Link>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isResponseBoardOpen && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <FiBookOpen className="text-indigo-600" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {type ? uiContent[language].describeIssue : uiContent[language].selectCategory}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {type ? uiContent[language].personalizedAdvice : uiContent[language].beginWith}
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to format Gemini's analysis response
const formatAnalysis = (text) => {
  if (!text) return '';
  
  // Convert markdown-like formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/^### (.*$)/gm, '<h3>$1</h3>') // Headers
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^- (.*$)/gm, '<li>$1</li>') // Lists
    .replace(/\n/g, '<br>'); // Line breaks
};

export default Query;