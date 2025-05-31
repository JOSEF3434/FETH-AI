import { useState, useEffect } from 'react';

const FaqSlider = () => {
    const [faqs, setFaqs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnsweredFaqs = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/faqs/answered');
                if (!response.ok) {
                    throw new Error('Failed to fetch FAQs');
                }
                const data = await response.json();
                setFaqs(data.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching FAQs:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchAnsweredFaqs();
    }, []);

    useEffect(() => {
        if (faqs.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) =>
                    prevIndex < faqs.length - 1 ? prevIndex + 1 : 0
                );
            }, 8000); // Change slide every 8 seconds

            return () => clearInterval(interval);
        }
    }, [faqs.length]);

    const navigateFaq = (direction) => {
        if (direction === 'prev') {
            setCurrentIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : faqs.length - 1
            );
        } else {
            setCurrentIndex((prevIndex) =>
                prevIndex < faqs.length - 1 ? prevIndex + 1 : 0
            );
        }
    };

    if (loading) {
        return (
            <section className="text-center py-12">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg h-64 flex items-center justify-center">
                    <p className="text-gray-600">Loading FAQs...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="text-center py-12">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg h-64 flex items-center justify-center">
                    <p className="text-red-500">Error: {error}</p>
                </div>
            </section>
        );
    }

    if (faqs.length === 0) {
        return (
            <section className="text-center py-12">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg h-64 flex flex-col items-center justify-center">
                    <p className="text-gray-600 mb-4">No answered FAQs available yet.</p>
                    <a 
                        href="/ask-question" 
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Ask a question
                    </a>
                </div>
            </section>
        );
    }

    const currentFaq = faqs[currentIndex];

    return (
        <section className="text-center py-12 px-4">
            <h2 className="text-3xl mb-8 font-montserrat font-bold text-gray-800">
                Frequently Answered Questions
                <a 
                    href="/AskQuestionPage" 
                    className="block text-lg text-blue-600 hover:text-blue-800 mt-2 font-normal"
                >
                    Ask your question
                </a>
            </h2>
            
            <div className="relative max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Navigation Arrows */}
                <button 
                    onClick={() => navigateFaq('prev')} 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 text-gray-800 p-2 rounded-full shadow-md hover:bg-opacity-100 transition duration-300"
                    aria-label="Previous FAQ"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <button 
                    onClick={() => navigateFaq('next')} 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 text-gray-800 p-2 rounded-full shadow-md hover:bg-opacity-100 transition duration-300"
                    aria-label="Next FAQ"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                
                {/* FAQ Content */}
                <div className="flex flex-col md:flex-row min-h-96">
                    {/* Question Side */}
                    <div className="w-full md:w-1/2 bg-blue-50 p-8 flex flex-col justify-center">
                        <div className="mb-4">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide">
                                Question
                            </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            {currentFaq.question}
                        </h3>
                        <div className="text-sm text-gray-500 mt-auto">
                            <p>Asked by: {currentFaq.askedBy?.name || 'Anonymous'}</p>
                            <p>{new Date(currentFaq.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    {/* Answer Side */}
                    <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center border-l border-gray-100">
                        <div className="mb-4">
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide">
                                Answer
                            </span>
                        </div>
                        <p className="text-gray-700 mb-6">
                            {currentFaq.answer}
                        </p>
                        
                        <div className="mt-auto bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-800">
                                Answered by: {currentFaq.answeredBy?.lawyerName || 'Legal Expert'}
                            </h4>
                            <div className="text-sm text-gray-600 mt-2">
                                <p>License: {currentFaq.answeredBy?.licenseNumber || 'Not provided'}</p>
                                {currentFaq.answeredBy?.phone && (
                                    <p>Phone: {currentFaq.answeredBy.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Dots Indicator */}
                <div className="flex justify-center space-x-2 p-4">
                    {faqs.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                            aria-label={`Go to FAQ ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FaqSlider;