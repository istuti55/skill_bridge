import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">
            SkillBridge
          </h2>

          <p className="leading-7">
            AI-powered recruitment platform helping students,
            job seekers, and companies connect smarter and faster.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-5">
            Quick Links
          </h3>

          <ul className="space-y-3">
            <li className="hover:text-blue-400 cursor-pointer">Home</li>
            <li className="hover:text-blue-400 cursor-pointer">Features</li>
            <li className="hover:text-blue-400 cursor-pointer">About</li>
            <li className="hover:text-blue-400 cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-5">
            Resources
          </h3>

          <ul className="space-y-3">
            <li className="hover:text-blue-400 cursor-pointer">
              Privacy Policy
            </li>

            <li className="hover:text-blue-400 cursor-pointer">
              Terms & Conditions
            </li>

            <li className="hover:text-blue-400 cursor-pointer">
              FAQ
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-5">
            Contact
          </h3>

          <div className="space-y-4">

            <div className="flex items-center gap-3">
              <FaEnvelope className="text-blue-400" />
              <span>support@skillbridge.ai</span>
            </div>

            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-blue-400" />
              <span>Kathmandu, Nepal</span>
            </div>

            <div className="flex gap-5 text-2xl pt-4">

              <FaGithub className="hover:text-white cursor-pointer transition" />

              <FaLinkedin className="hover:text-blue-400 cursor-pointer transition" />

              <FaTwitter className="hover:text-sky-400 cursor-pointer transition" />

            </div>

          </div>
        </div>

      </div>

      <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-500">
        © 2026 SkillBridge – Final Year Project. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;