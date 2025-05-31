// src/components/LawyerPortal.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaSpinner } from 'react-icons/fa';

const LawyerPortal = () => {
  const [unansweredFaqs, setUnansweredFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('unanswered');
  const [formData, setFormData] = useState({
    answer: '',
    lawyerName: '',
    lawyerEmail: '',
    licenseNumber: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    const fetchUnansweredQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/faqs/unanswered');
        setUnansweredFaqs(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch questions');
        setLoading(false);
      }
    };

    fetchUnansweredQuestions();
  }, []);

  const handleAnswerClick = (faq) => {
    setCurrentQuestion(faq);
    setFormData({
      answer: '',
      lawyerName: '',
      lawyerEmail: '',
      licenseNumber: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:4000/api/faqs/answer/${currentQuestion._id}`, formData);
      // Remove answered question from list
      setUnansweredFaqs(unansweredFaqs.filter(faq => faq._id !== currentQuestion._id));
      setCurrentQuestion(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Lawyer Portal</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('unanswered')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'unanswered' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Unanswered Questions
          </button>
          <button
            onClick={() => setActiveTab('answered')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'answered' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Answered Questions
          </button>
        </div>
      </div>

      {activeTab === 'unanswered' ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            Unanswered Questions ({unansweredFaqs.length})
          </h2>

          {unansweredFaqs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No unanswered questions at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {unansweredFaqs.map(faq => (
                <div key={faq._id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Category: <span className="font-medium">{faq.category}</span></p>
                        <p>Asked by: {faq.askedBy?.name} ({faq.askedBy?.email})</p>
                        <p className="text-xs text-gray-400">
                          {new Date(faq.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAnswerClick(faq)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Answer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Answered Questions
          </h2>
          {/* Implement similar to unanswered but for answered questions */}
          <p className="text-gray-500">Answered questions list would go here</p>
        </div>
      )}

      {/* Answer Modal */}
      {currentQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Answer Question
              </h3>
              <button
                onClick={() => setCurrentQuestion(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">
                {currentQuestion.question}
              </h4>
              <p className="text-sm text-gray-600">
                Asked by: {currentQuestion.askedBy?.name} ({currentQuestion.askedBy?.email})
              </p>
            </div>

            <form onSubmit={handleSubmitAnswer}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="answer">
                  Your Answer *
                </label>
                <textarea
                  id="answer"
                  name="answer"
                  value={formData.answer}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="lawyerName">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="lawyerName"
                    name="lawyerName"
                    value={formData.lawyerName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="lawyerEmail">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    id="lawyerEmail"
                    name="lawyerEmail"
                    value={formData.lawyerEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="licenseNumber">
                    License Number *
                  </label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCurrentQuestion(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <FaCheck /> <span>Submit Answer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerPortal;