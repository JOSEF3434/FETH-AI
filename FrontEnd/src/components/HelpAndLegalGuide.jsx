
import { CheckCircle, FileText, Search, UserCheck, Scale, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import Nave from '../Pages/Nave';

const civilSubclasses = [
  "Succession law",
  "Tort law (extra-contractual liability)",
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

// General steps to use the system
const generalSteps = [
  {
    title: "1. Access the Website",
    description: "Open your browser and go to http://localhost:5173/ to access FETH AI.",
  },
  {
    title: "2. Create a User Account",
    description: "Click 'Sign Up' and fill your full name, email, phone number, password, and location. Upload a profile picture if available.",
  },
  {
    title: "3. Log In",
    description: "Use your registered email and password to sign in and access your dashboard.",
  },
  {
    title: "4. Ask for Legal Advice",
    description: "Go to the 'Query' page, select the case type and subclass, input your question, language, and location, then click 'Submit'.",
  },
  {
    title: "5. View Lawyer Profiles",
    description: "See AI-recommended lawyers based on your query, location, and legal issue.",
  },
  {
    title: "6. Book a Consultation",
    description: "Choose a lawyer, pick a time, and complete payment using Chapa Payment Gateway.",
  },
  {
    title: "7. Chat with Lawyers",
    description: "Use the chat section to message, send media, documents, and voice messages. All messages show time sent.",
  },
  {
    title: "8. Manage Your Profile",
    description: "Update name, contact info, password, and profile picture from your dashboard.",
  },
  {
    title: "9. Log Out",
    description: "Click your profile icon and choose 'Logout' to safely exit the system.",
  },
];

// Legal help process steps
const legalHelpSteps = [
  {
    icon: <FileText className="text-blue-600 w-6 h-6" />,
    title: "Step 1: Select Case Type & Subclass",
    description: `Choose 'Civil Case' or 'Criminal Matter'. Then select a matching subclass based on your legal issue.`,
  },
  {
    icon: <Search className="text-purple-600 w-6 h-6" />,
    title: "Step 2: Ask Your Legal Question",
    description: `Write your legal query. Select location and preferred language. Submit to get AI-generated advice with matching laws.`,
  },
  {
    icon: <UserCheck className="text-green-600 w-6 h-6" />,
    title: "Step 3: Get Lawyer Recommendations",
    description: `FETH AI recommends 3 lawyers based on your legal issue, location, and preferences. You can view their profile and book directly.`,
  },
];

const HelpAndLegalGuide = () => {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);

  const handleVideoClick = () => {
    setShowVideo(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleVideoError = () => {
    setVideoError(true);
  };
  return (<>
  <Nave/>
    <div className="max-w-5xl mx-auto p-6 space-y-12">
      {/* Header */}
      <h1 className="text-4xl font-bold text-center text-indigo-700">📘 How to Use FETH AI</h1>

      {/* General Steps */}
      <div className="space-y-6">
        {generalSteps.map((step, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md transition"
          >
            <CheckCircle className="text-green-500 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{step.title}</h2>
              <p className="text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legal Advice Steps */}
       <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Scale className="w-6 h-6 text-indigo-600" />
          Search Legal Advice & Get a Lawyer
        </h2>
        
        <div className="space-y-6">
          {legalHelpSteps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col lg:flex-row gap-6 items-start p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all"
            >
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                {step.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    Step {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800">{step.title}</h3>
                </div>
                <p className="text-gray-600">{step.description}</p>
                
                {index === 0 && !showVideo && (
                  <button 
                    onClick={handleVideoClick}
                    className="mt-3 flex items-center text-2xl text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Watch tutorial video <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {index === 0 && showVideo && (
                <div className="w-full lg:w-[320px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  {videoError ? (
                    <div className="bg-gray-100 p-4 rounded-xl text-center">
                      <h1 className="text-red-500">Video failed to load</h1>
                     <a 
  href="/FETH_AI_help_video.mp4" 
  className="text-indigo-600 hover:underline mt-2 inline-block "
  download
>
  Download video instead
</a>

                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      controls
                      className="w-full h-auto rounded-xl"
                      onError={handleVideoError}
                    >
                      <source src="/FETH_AI_help_video.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video> 
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legal Types and Subclasses */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">🧾 Legal Types & Subclasses</h2>

        {/* Civil Cases */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Civil Cases</h3>
          <p className="text-gray-600 mb-2">
            Civil law deals with private rights and obligations. It includes matters like property, contracts, family, and inheritance.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {civilSubclasses.map((sub, idx) => (
              <li key={idx}>{sub}</li>
            ))}
          </ul>
        </div>

        {/* Criminal Matters */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Criminal Matters</h3>
          <p className="text-gray-600 mb-2">
            Criminal law involves crimes against the state or society. It covers offenses like theft, violence, and corruption.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {criminalSubclasses.map((sub, idx) => (
              <li key={idx}>{sub}</li>
            ))}
          </ul>
        </div>
      </div>
    </div></>
  );
};

export default HelpAndLegalGuide;
