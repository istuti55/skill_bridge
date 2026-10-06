import { motion } from "framer-motion";
import {
Brain,
CheckCircle2,
AlertTriangle,
TrendingUp,
Target,
Lightbulb,
} from "lucide-react";
import { useEffect, useState } from "react";

import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";
import { getMyProfile } from "../../services/api";

function AIAnalysis() {
const [sidebarOpen, setSidebarOpen] = useState(false);
const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
const loadProfile = async () => {
try {
const data = await getMyProfile();
console.log("AI Analysis profile:", JSON.stringify(data, null, 2));
setProfile(data);
} catch (error) {
console.error("Failed to load AI analysis:", error);
} finally {
setLoading(false);
}
};


loadProfile();


}, []);

const rawSkills = profile?.extracted_skills || [];

const skills = rawSkills
.map((skill) => {
if (typeof skill === "string") return skill;
return skill?.name || skill?.skill || "";
})
.filter(Boolean);

const education = profile?.education || [];
const certifications = profile?.certifications || [];
const experienceYears = profile?.experience_years ?? 0;
const resumeScore = profile?.resume_score ?? 0;

return ( <div className="flex bg-gray-100 min-h-screen">


  {/* Sidebar */}
  <Sidebar
    isOpen={sidebarOpen}
    setIsOpen={setSidebarOpen}
  />

  {/* Main Content */}
  <div className="flex-1 flex flex-col">

    {/* Mobile Header */}
    <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition"
      >
        ☰
      </button>

      <h1 className="text-xl font-bold text-blue-600">
        SkillBridge
      </h1>

      <div className="w-10" />
    </div>

    {/* Topbar */}
    <Topbar />

    {/* Page Content */}
    <main className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Brain size={26} />
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              AI Resume Analysis
            </h1>

            <p className="text-gray-500 mt-1">
              Get AI-powered insights about your resume and career.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Resume Score */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Overall Resume Score
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Based on your uploaded resume and AI analysis.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full border-8 border-blue-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">
                {loading ? "..." : `${resumeScore}%`}
              </span>
            </div>

            <div>
              <p className="text-green-600 font-semibold">
                Excellent
              </p>

              <p className="text-gray-500 text-sm">
                Your resume is highly competitive.
              </p>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Strengths */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              Strengths
            </h2>
          </div>

          <div className="space-y-3">
            {[
              skills.length > 0
                ? `Strong technical skills: ${skills.slice(0, 4).join(", ")}`
                : "Technical skills will appear after CV analysis.",

              education.length > 0
                ? "Relevant educational background detected"
                : "Education information will appear after CV analysis.",

              experienceYears > 0
                ? `${experienceYears} years of experience detected`
                : "Experience information will appear after CV analysis.",

              certifications.length > 0
                ? "Professional certifications detected"
                : "Certifications will appear if available.",
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-gray-600"
              >
                <CheckCircle2
                  size={18}
                  className="text-green-500"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Improvements */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              Areas to Improve
            </h2>
          </div>

          <div className="space-y-3">
            {[
              "Add measurable project achievements",
              "Improve professional summary",
              "Add more relevant keywords",
              "Improve work experience descriptions",
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-gray-600"
              >
                <AlertTriangle
                  size={18}
                  className="text-orange-500"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Skills */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <TrendingUp size={22} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Detected Skills
            </h2>

            <p className="text-sm text-gray-500">
              Skills identified from your uploaded resume.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">
            Loading AI analysis...
          </p>
        ) : skills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No analyzed skills found. Please upload and analyze your CV first.
          </p>
        )}
      </motion.div>

      {/* Skill Gap */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <Target size={22} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Skill Gap Analysis
            </h2>

            <p className="text-sm text-gray-500">
              Skills you can develop to improve your career opportunities.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {["Docker", "Kubernetes", "AWS", "TypeScript"].map(
            (skill) => (
              <span
                key={skill}
                className="px-4 py-2 rounded-full bg-red-50 text-red-600 font-medium text-sm"
              >
                {skill}
              </span>
            )
          )}
        </div>
      </motion.div>

      {/* Career Recommendation */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <Lightbulb size={22} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              AI Career Recommendation
            </h2>

            <p className="text-sm text-gray-500">
              Suggested career direction based on your skills.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-5">
          <h3 className="font-semibold text-blue-700 text-lg">
            Full Stack Developer
          </h3>

          <p className="text-gray-600 mt-2">
            Your current skills in React, JavaScript, Python and Django
            make Full Stack Development a strong career path for you.
          </p>

          <div className="flex items-center gap-2 mt-4 text-blue-600 font-medium">
            <TrendingUp size={18} />
            <span>Career Match: 94%</span>
          </div>
        </div>
      </motion.div>

    </main>
  </div>
</div>


);
}

export default AIAnalysis;
