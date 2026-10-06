import heroImage from "../../assets/images/hero.svg";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    document.getElementById("about")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-white min-h-screen flex items-center pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12 items-center">

        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🚀 AI-Powered Career Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-black">
            Build Your Career with{" "}
            <span className="text-purple-600">AI-Powered</span> Guidance
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-8">
            SkillBridge helps students and job seekers upload their CV,
            identify skill gaps, receive personalized career recommendations,
            and connect with companies through intelligent AI-powered matching.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {/* Get Started */}
            <button
              onClick={() => navigate("/register")}
              className="bg-purple-600 hover:bg-pink-600 text-white px-7 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-300"
            >
              Get Started
            </button>

            {/* Learn More */}
            <button
              onClick={handleLearnMore}
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-7 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex justify-center items-center"
        >
          <img
            src={heroImage}
            alt="SkillBridge Hero"
            className="w-[90%] max-w-[550px]"
          />
        </motion.div>

      </div>
    </section>
  );
}

export default Hero;