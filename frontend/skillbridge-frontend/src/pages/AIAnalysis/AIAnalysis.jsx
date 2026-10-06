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
import { Link } from "react-router-dom";

import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";
import {
  getMyProfile,
  getJobs,
  getSkillGaps,
  getCareerPaths,
} from "../../services/api";

const skillLabel = (skill) =>
  typeof skill === "string" ? skill : skill?.name || skill?.skill || "";

// Text next to the score circle, based on the real score
const scoreLabel = (score) => {
  if (score == null)
    return { title: "Not scored yet", text: "Upload your resume to get a score.", color: "text-gray-500" };
  if (score >= 75)
    return { title: "Excellent", text: "Your resume is highly competitive.", color: "text-green-600" };
  if (score >= 50)
    return { title: "Good", text: "Your resume is solid with room to grow.", color: "text-blue-600" };
  return { title: "Needs work", text: "Follow the tips below to strengthen your resume.", color: "text-orange-600" };
};

function AIAnalysis() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // Skill gap (backend needs a job, so we use the best-matching one)
  const [gapJob, setGapJob] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [gapLoading, setGapLoading] = useState(true);
  const [gapError, setGapError] = useState("");

  // Career recommendation
  const [careers, setCareers] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [careerLoading, setCareerLoading] = useState(true);
  const [careerError, setCareerError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      // 1. Profile: resume score, skills, education, tips
      let data = null;
      try {
        data = await getMyProfile();
        if (cancelled) return;
        setProfile(data);
      } catch (error) {
        if (cancelled) return;
        setProfileError(error.message || "Could not load your analysis.");
      } finally {
        if (!cancelled) setLoading(false);
      }

      // No skills yet means no resume analysed: skip the AI calls
      const hasSkills = (data?.extracted_skills || []).length > 0;
      if (!hasSkills) {
        setGapLoading(false);
        setCareerLoading(false);
        return;
      }

      // 2. Skill gap against the best-matching job
      const loadGaps = async () => {
        try {
          const jobs = await getJobs();
          if (cancelled) return;
          const list = Array.isArray(jobs) ? jobs : [];
          if (list.length === 0) {
            setGapError("No jobs are available to compare against yet.");
            return;
          }
          const best = [...list].sort(
            (a, b) => (b.match_score ?? -1) - (a.match_score ?? -1)
          )[0];
          setGapJob(best);
          const report = await getSkillGaps(best.id);
          if (!cancelled) setGaps(Array.isArray(report) ? report : []);
        } catch (error) {
          if (!cancelled)
            setGapError(error.message || "Could not load skill gaps.");
        } finally {
          if (!cancelled) setGapLoading(false);
        }
      };

      // 3. Career recommendation (uses the AI service, can be slow)
      const loadCareers = async () => {
        try {
          const result = await getCareerPaths();
          if (cancelled) return;
          setCareers(result.suggestions || []);
          setRoadmap(result.roadmap || []);
        } catch (error) {
          if (!cancelled)
            setCareerError(error.message || "Could not load recommendations.");
        } finally {
          if (!cancelled) setCareerLoading(false);
        }
      };

      loadGaps();
      loadCareers();
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const skills = (profile?.extracted_skills || []).map(skillLabel).filter(Boolean);
  const education = profile?.education || [];
  const experienceYears = profile?.experience_years ?? 0;
  const resumeScore = profile?.resume_score ?? null;
  const tips = profile?.suggestions || [];
  const label = scoreLabel(resumeScore);

  const missingGaps = gaps.filter((g) => g.status === "missing");
  const weakGaps = gaps.filter((g) => g.status === "weak");

  const strengths = [
    skills.length > 0
      ? `Technical skills: ${skills.slice(0, 4).join(", ")}`
      : "Technical skills will appear after CV analysis.",
    education.length > 0
      ? "Educational background detected"
      : "Education will appear after CV analysis.",
    experienceYears > 0
      ? `${experienceYears} years of experience detected`
      : "Experience will appear after CV analysis.",
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">

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
                  Based on skills, experience, education and resume quality.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full border-8 border-blue-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">
                    {loading ? "..." : resumeScore != null ? `${resumeScore}%` : "—"}
                  </span>
                </div>

                <div>
                  <p className={`${label.color} font-semibold`}>
                    {loading ? "" : label.title}
                  </p>

                  <p className="text-gray-500 text-sm">
                    {loading ? "" : label.text}
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
                {strengths.map((item, index) => (
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
                {loading ? (
                  <p className="text-gray-500">Loading tips...</p>
                ) : profileError ? (
                  <p className="text-red-600">{profileError}</p>
                ) : tips.length > 0 ? (
                  tips.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 text-gray-600"
                    >
                      <AlertTriangle
                        size={18}
                        className="text-orange-500 mt-1 shrink-0"
                      />
                      <span>
                        <strong className="text-gray-800">{item.area}: </strong>
                        {item.tip}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    Nothing to improve right now. Nice work!
                  </p>
                )}
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
                  Skills identified from your resume.
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading AI analysis...</p>
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
                No analyzed skills found.{" "}
                <Link to="/resume" className="text-blue-600 hover:underline">
                  Upload your resume
                </Link>{" "}
                first.
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

            {gapLoading ? (
              <p className="text-gray-500">Analysing skill gaps...</p>
            ) : gapError ? (
              <p className="text-gray-500">{gapError}</p>
            ) : !gapJob ? (
              <p className="text-gray-500">
                Upload your resume to see which skills you are missing.
              </p>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Compared with:{" "}
                  <span className="font-semibold text-gray-700">
                    {gapJob.title}
                  </span>
                  {gapJob.company_name ? ` at ${gapJob.company_name}` : ""}
                </p>

                {missingGaps.length === 0 && weakGaps.length === 0 ? (
                  <p className="text-green-600 font-medium">
                    No gaps found. You cover every required skill.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {missingGaps.map((g) => (
                      <span
                        key={`m-${g.skill_name}`}
                        className="px-4 py-2 rounded-full bg-red-50 text-red-600 font-medium text-sm"
                      >
                        {g.skill_name} · missing
                      </span>
                    ))}
                    {weakGaps.map((g) => (
                      <span
                        key={`w-${g.skill_name}`}
                        className="px-4 py-2 rounded-full bg-orange-50 text-orange-600 font-medium text-sm"
                      >
                        {g.skill_name} · needs work
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
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

            {careerLoading ? (
              <p className="text-gray-500">
                The AI is preparing your recommendations. This can take a
                moment...
              </p>
            ) : careerError ? (
              <p className="text-gray-500">{careerError}</p>
            ) : careers.length === 0 ? (
              <p className="text-gray-500">
                No recommendations yet.{" "}
                <Link to="/resume" className="text-blue-600 hover:underline">
                  Upload your resume
                </Link>{" "}
                first.
              </p>
            ) : (
              <div className="space-y-4">
                {careers.map((c, index) => (
                  <div
                    key={`${c.title}-${index}`}
                    className="bg-blue-50 rounded-xl p-5"
                  >
                    <h3 className="font-semibold text-blue-700 text-lg">
                      {c.title}
                    </h3>
                    {c.reason && (
                      <p className="text-gray-600 mt-2">{c.reason}</p>
                    )}
                  </div>
                ))}

                {roadmap.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-3">
                      Skills to learn next
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {roadmap.map((r) => (
                        <span
                          key={r.skill}
                          className="px-4 py-2 rounded-full bg-yellow-50 text-yellow-700 font-medium text-sm"
                        >
                          {r.priority}. {r.skill}
                          {r.est_weeks ? ` (~${r.est_weeks} wks)` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

        </main>
      </div>
    </div>
  );
}

export default AIAnalysis;