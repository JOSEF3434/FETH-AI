import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiChevronDown,
  FiX,
  FiSearch,
  FiUser,
  FiBookOpen,
  FiAward,
  FiMapPin,
} from "react-icons/fi";

const Query = () => {
  const [type, setType] = useState("");
  const [subclass, setSubclass] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isSubclassDropdownOpen, setIsSubclassDropdownOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [isResponseBoardOpen, setIsResponseBoardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(""); // Changed from null to empty string
  const [language, setLanguage] = useState("en");

  const typeDropdownRef = useRef(null);
  const subclassDropdownRef = useRef(null);

  const legalTypes = ["Civil cases", "Criminal Matters"];
  const civilSubclasses = [
    "Succession law",
    "Tort law",
    "Property law",
    "Agency Contract",
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
      issuePlaceholder:
        "Example: I need help with a divorce case involving child custody...",
      locationLabel: "Your location (city or region)",
      locationPlaceholder: "Example: Addis Ababa or Amhara",
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
      personalizedAdvice:
        "Get personalized legal advice and connect with qualified lawyers",
      beginWith:
        "Begin by selecting the type of legal matter you need help with",
    },
    am: {
      title: "FETH AI የህግ ረዳት",
      subtitle: "ፈጣን የህግ ምክር እና ብቁ የህግ ባለሙያዎችን ያግኙ",
      legalTypePlaceholder: "የህግ አይነት ይምረጡ",
      subclassPlaceholder: "ንዑስ ክፍል ይምረጡ",
      issueLabel: "የህግ ጉዳይዎን ይግለጹ",
      issuePlaceholder: "ምሳሌ፡ ስለ ልጅ ቤት በሚሆን የፍቺ ጉዳይ እርዳታ ያስፈልገኛል...",
      locationLabel: "አካባቢዎ (ከተማ ወይም ክልል)",
      locationPlaceholder: "ምሳሌ፡ አዲስ አበባ ወይም አማራ",
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
      beginWith: "እርዳታ የሚያስፈልግዎትን የህግ ክፍል በመምረጥ ይጀምሩ",
    },
  };

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
      alert(
        language === "am" ? "እባክዎ ሁሉንም መስኮች ይሙሉ!" : "Please fill all fields!"
      );
      return;
    }

    setIsLoading(true);
    try {
      const [analysisRes, lawyersRes] = await Promise.all([
        axios.post("http://localhost:4000/api/legal/analyze", {
          query: searchQuery,
          type,
          subclass,
          language,
        }),
        axios.post(
          "http://localhost:4000/api/legal/recommendations",
          {
            query: searchQuery,
            preferredLocation: location,
            language,
            type,
            subclass,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        ),
      ]);

      if (!analysisRes.data?.success) {
        throw new Error(analysisRes.data?.error || "Request failed");
      }

      setResponse({
        analysis: analysisRes.data.analysis,
        articles: analysisRes.data.applicableArticles || [],
        lawyers: lawyersRes.data?.data || [],
        isFallback: analysisRes.data.isFallback || false,
        isCached: analysisRes.data.isCached || false,
        isDatabaseFallback: analysisRes.data.isDatabaseFallback || false,
      });
      setIsResponseBoardOpen(true);
    } catch (error) {
      console.error("Search error:", {
        error: error.response?.data || error.message,
        config: error.config,
      });
      console.error("Search error:", error);
      let errorMessage =
        language === "am"
          ? "ያልተጠበቀ ስህተት ተከስቷል"
          : "An unexpected error occurred";

      if (error.response?.status === 404) {
        errorMessage =
          language === "am"
            ? "የህግ ትንታኔ አገልግሎት አሁን አይገኝም"
            : "Legal analysis service is currently unavailable";
      } else if (error.response?.status === 500) {
        errorMessage =
          language === "am"
            ? "የሰርቨር ስህተት፣ እባክዎ ቆይተው ይሞክሩ"
            : "Server error, please try again later";
      }

      alert(`${language === "am" ? "ስህተት" : "Error"}: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const closeResponseBoard = () => {
    setIsResponseBoardOpen(false);
    setResponse(null);
  };

  return (<>
    <div className="max-w-4xl mb-6 mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Language Toggle - Improved styling */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setLanguage("en")}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
              language === "en"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("am")}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
              language === "am"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            አማርኛ
          </button>
        </div>
      </div>

      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-3">
          {uiContent[language].title}
        </h1>
        <p className="text-gray-600 text-lg">{uiContent[language].subtitle}</p>
      </div>

      {/* Selection Cards - Improved layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Legal Type Dropdown */}
        <div className="relative" ref={typeDropdownRef}>
          <button
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <span
              className={type ? "text-gray-900 font-medium" : "text-gray-500"}
            >
              {type || uiContent[language].legalTypePlaceholder}
            </span>
            <FiChevronDown
              className={`text-gray-500 transition-transform ${
                isTypeDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isTypeDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 divide-y divide-gray-100">
              {legalTypes.map((legalType) => (
                <button
                  key={legalType}
                  onClick={() => {
                    setType(legalType);
                    setSubclass("");
                    setIsTypeDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  {legalType}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subclass Dropdown */}
        {type && (
          <div className="relative" ref={subclassDropdownRef}>
            <button
              onClick={() => setIsSubclassDropdownOpen(!isSubclassDropdownOpen)}
              className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <span
                className={
                  subclass ? "text-gray-900 font-medium" : "text-gray-500"
                }
              >
                {subclass || uiContent[language].subclassPlaceholder}
              </span>
              <FiChevronDown
                className={`text-gray-500 transition-transform ${
                  isSubclassDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isSubclassDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {(type === "Civil cases"
                  ? civilSubclasses
                  : criminalSubclasses
                ).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      setSubclass(sub);
                      setIsSubclassDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location Input - Enhanced styling */}
      {type && subclass && (
        <div className="mb-6">
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {uiContent[language].locationLabel}
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="location"
              type="text"
              placeholder={uiContent[language].locationPlaceholder}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md border"
            />
          </div>
        </div>
      )}

      {/* Search Input - Improved design */}
      {type && subclass && (
        <div className="mb-8">
          <label
            htmlFor="legalQuery"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {uiContent[language].issueLabel}
          </label>
          <div className="relative">
            <textarea
              id="legalQuery"
              placeholder={uiContent[language].issuePlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              rows={4}
            />
            <button
              onClick={handleSearchClick}
              disabled={isLoading || !searchQuery.trim()}
              className={`absolute right-3 bottom-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isLoading || !searchQuery.trim()
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              } transition-colors`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {uiContent[language].analyzing}
                </>
              ) : (
                <>
                  <FiSearch className="-ml-1 mr-2 h-4 w-4" />
                  {uiContent[language].getHelp}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Response Panel - Enhanced styling */}
      {isResponseBoardOpen && response && (
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {uiContent[language].legalAssistance}
            </h2>
            <button
              onClick={closeResponseBoard}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
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
                {response.isCached && (
                  <span className="ml-2 text-sm text-gray-500">
                    (Cached Response)
                  </span>
                )}
              </h3>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
              {response.isFallback ? (
                <div
                  className={`${
                    response.isDatabaseFallback
                      ? "bg-blue-50 border-blue-400"
                      : "bg-yellow-50 border-yellow-400"
                  } border-l-4 p-4`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className={`h-5 w-5 ${
                          response.isDatabaseFallback
                            ? "text-blue-400"
                            : "text-yellow-400"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-sm ${
                          response.isDatabaseFallback
                            ? "text-blue-700"
                            : "text-yellow-700"
                        }`}
                      >
                        {response.analysis}
                      </p>
                      {response.nextSteps && response.nextSteps.length > 0 && (
                        <div className="mt-2">
                          <ul
                            className={`list-disc pl-5 text-sm ${
                              response.isDatabaseFallback
                                ? "text-blue-700"
                                : "text-yellow-700"
                            }`}
                          >
                            {response.nextSteps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: formatAnalysis(response.analysis),
                  }}
                />
              )}
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
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-indigo-700 mb-2">
                      {language === "am"
                        ? `አንቀጽ ${article.article_number}`
                        : `Article ${article.article_number}`}
                      : {article.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {language === "am"
                        ? article.description_am || article.description
                        : article.description}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {response.lawyers.map((lawyer) => (
                  <div
                    key={lawyer._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                          <span className="text-indigo-700 font-semibold text-lg">
                            {lawyer.firstName.charAt(0)}
                            {lawyer.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {lawyer.firstName} {lawyer.lastName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {lawyer.specialization.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex">
                          <span className="font-medium text-gray-700 w-24">
                            {language === "am" ? "ልምድ" : "Experience"}:
                          </span>
                          <span>
                            {lawyer.yearsOfExperience}{" "}
                            {language === "am" ? "ዓመታት" : "years"}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-gray-700 w-24">
                            {language === "am" ? "ትምህርት" : "Education"}:
                          </span>
                          <span>
                            {lawyer.lawDegree}{" "}
                            {language === "am" ? "ከ" : "from"}{" "}
                            {lawyer.universityName}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-gray-700 w-24">
                            {language === "am" ? "አካባቢ" : "Location"}:
                          </span>
                          <span>
                            {lawyer.city}, {lawyer.region}
                          </span>
                        </div>
                        {lawyer.matchScore && (
                          <div className="pt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>
                                {language === "am"
                                  ? "የሚመለከት ነጥብ"
                                  : "Match Score"}
                              </span>
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
                        <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors">
                          {language === "am" ? "ያግኙ" : "Contact"}
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
              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
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

      {/* Empty State - Improved design */}
      {!isResponseBoardOpen && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <FiBookOpen className="text-indigo-600" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {type
              ? uiContent[language].describeIssue
              : uiContent[language].selectCategory}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {type
              ? uiContent[language].personalizedAdvice
              : uiContent[language].beginWith}
          </p>
        </div>
      )}
    </div></>
  );
};
// Helper function to format Gemini's analysis response
const formatAnalysis = (text) => {
  if (!text) return "";

  // Convert markdown-like formatting to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
    .replace(/^### (.*$)/gm, "<h3>$1</h3>") // Headers
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^- (.*$)/gm, "<li>$1</li>") // Lists
    .replace(/\n/g, "<br>"); // Line breaks
};

export default Query;
