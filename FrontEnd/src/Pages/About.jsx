import Sfooter from "../public/Sfooter";
import Nave from "./Nave"; //../Assites/feth_AI_logo.png
//import logo from "../Assites/feth_AI_logo.png"; // Make sure the extension is correct

const About = () => {
  return (
    <div>
      <Nave />
      <div className="bg-gray-100 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            About FETH AI
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img
                src={"../Assites/feth_AI_logo.png"}
                alt="FETH AI Logo"
                className="rounded-lg shadow-md"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Empowering Legal Access with AI
              </h2>
              <p className="text-gray-700 mb-4">
                FETH AI is an intelligent legal adviser and lawyer finder system developed
                at Haramaya University. It uses cutting-edge AI to provide legal guidance
                and connect users with qualified lawyers based on specialization, language,
                location, and experience.
              </p>
              <p className="text-gray-700 mb-4">
                Whether you're looking for quick legal advice or need help finding the
                right legal professional, FETH AI is here to simplify your journey. Our
                platform is built using the MERN stack and leverages Gemini AI to deliver
                reliable, real-time support.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Sfooter />
    </div>
  );
};

export default About;
