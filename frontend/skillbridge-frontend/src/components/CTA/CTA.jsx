import { useNavigate } from "react-router-dom";

function CTA() {
  const navigate = useNavigate();

  const handleContactUs = () => {
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="max-w-5xl mx-auto px-6 text-center">

        <h2 className="text-5xl font-bold text-white">
          Ready to Build Your Career?
        </h2>

        <p className="mt-6 text-xl text-purple-100 leading-8">
          Join thousands of students, job seekers, and companies using
          SkillBridge to connect talent with opportunities through
          AI-powered recruitment.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-5">

          {/* Get Started */}
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition duration-300 shadow-lg"
          >
            Get Started
          </button>

          {/* Contact Us */}
          <button
            onClick={handleContactUs}
            className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition duration-300"
          >
            Contact Us
          </button>

        </div>

      </div>
    </section>
  );
}

export default CTA;