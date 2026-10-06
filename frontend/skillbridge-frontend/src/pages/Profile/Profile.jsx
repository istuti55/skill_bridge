import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  FileText,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";
import { getMyProfile, getStoredUser } from "../../services/api";

const skillName = (s) =>
  typeof s === "string" ? s : s?.name || s?.skill || "";

const educationLabel = (e) => {
  if (typeof e === "string") return e;
  if (!e || typeof e !== "object") return "";
  return [e.degree, e.field, e.institution || e.school || e.university, e.year]
    .filter(Boolean)
    .join(" · ");
};

function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getStoredUser();

  useEffect(() => {
    const load = async () => {
      try {
        setProfile(await getMyProfile());
      } catch (err) {
        setError(err.message || "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const name = user?.name || "Candidate";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const skills = (profile?.extracted_skills || []).map(skillName).filter(Boolean);
  const education = (profile?.education || []).map(educationLabel).filter(Boolean);
  const hasCv = !!profile?.cv_file_path;
  const joined = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString()
    : "";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1">
        <Topbar />

        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <User size={26} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                  My Profile
                </h1>
                <p className="text-gray-500 mt-1">
                  Your account and the details SkillBridge read from your resume.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-5 border-b border-gray-100 pb-6">
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
                {initials || "U"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
                <p className="text-blue-600 font-medium mt-1">Job Seeker</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field icon={<User size={18} />} label="Full Name" value={name} />
                <Field icon={<Mail size={18} />} label="Email" value={user?.email} />
                {joined && (
                  <Field icon={<Calendar size={18} />} label="Member Since" value={joined} />
                )}
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Resume Information
              </h3>

              {loading ? (
                <p className="text-gray-500">Loading your profile...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field
                      icon={<Briefcase size={18} />}
                      label="Experience"
                      value={`${profile?.experience_years ?? 0} years`}
                    />
                    <Field
                      icon={<FileText size={18} />}
                      label="Resume Score"
                      value={
                        profile?.resume_score != null
                          ? `${profile.resume_score}%`
                          : "Not scored yet"
                      }
                    />
                  </div>

                  {!hasCv && (
                    <p className="text-gray-600">
                      No resume uploaded yet.{" "}
                      <Link to="/resume" className="text-blue-600 font-medium hover:underline">
                        Upload your resume
                      </Link>
                    </p>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-3">Skills</p>
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {skills.map((skill, i) => (
                          <span
                            key={`${skill}-${i}`}
                            className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Skills appear after your resume is analysed.
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                      <GraduationCap size={18} /> Education
                    </p>
                    {education.length > 0 ? (
                      <ul className="space-y-2 text-gray-700">
                        {education.map((line, i) => (
                          <li key={i}>• {line}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Education appears after your resume is analysed.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function Field({ icon, label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700">
        <span className="text-gray-400">{icon}</span>
        <span>{value || "—"}</span>
      </div>
    </div>
  );
}

export default Profile;