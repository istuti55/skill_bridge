
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Edit3,
  Save,
  FileText,
  Award,
  GraduationCap,
  Code2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";
import { getMyProfile } from "../../services/api";

function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    bio: "",
  });

  const [candidateData, setCandidateData] = useState({
    extracted_skills: [],
    education: [],
    experience_years: 0,
    resume_score: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();

        console.log(
          "REAL PROFILE DATA:",
          JSON.stringify(data, null, 2)
        );

        const storedUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        const savedProfile = JSON.parse(
          localStorage.getItem("profile") || "{}"
        );

        setProfile({
          name:
            savedProfile.name ||
            storedUser.name ||
            storedUser.username ||
            "User",

          email:
            savedProfile.email ||
            storedUser.email ||
            "",

          phone:
            savedProfile.phone ||
            data.phone ||
            data.phone_number ||
            "",

          location:
            savedProfile.location ||
            data.location ||
            data.address ||
            "",

          role:
            savedProfile.role ||
            data.current_role ||
            data.job_title ||
            data.target_role ||
            "Job Seeker",

          bio:
            savedProfile.bio ||
            data.bio ||
            data.about ||
            data.description ||
            "",
        });

        setCandidateData({
          extracted_skills: data.extracted_skills || [],
          education: data.education || [],
          experience_years: data.experience_years || 0,
          resume_score: data.resume_score || 0,
        });
      } catch (err) {
        console.error("Failed to load profile:", err);

        setError(
          err.message || "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    localStorage.setItem(
      "profile",
      JSON.stringify(profile)
    );

    const storedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    const updatedUser = {
      ...storedUser,
      name: profile.name,
      email: profile.email,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setEditing(false);

    alert("Profile updated successfully!");
  };

  const getInitials = (name) => {
    if (!name) return "U";

    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1">
        <Topbar />

        <main className="p-4 sm:p-6 lg:p-8">

          {/* PAGE HEADER */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <User
                  size={26}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                  My Profile
                </h1>

                <p className="text-gray-500 mt-1">
                  Manage your personal information and career profile.
                </p>
              </div>
            </div>
          </motion.div>

          {/* LOADING */}
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500">
                Loading your profile...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle size={20} />
                Failed to load profile
              </div>

              <p className="text-sm mt-1">
                {error}
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* PROFILE CARD */}
              <motion.div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* PROFILE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-gray-100 pb-6">

                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
                      {getInitials(profile.name)}
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {profile.name}
                      </h2>

                      <p className="text-blue-600 font-medium mt-1">
                        {profile.role}
                      </p>
                    </div>
                  </div>

                  {!editing ? (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition"
                    >
                      <Edit3 size={18} />
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition"
                    >
                      <Save size={18} />
                      Save Changes
                    </button>
                  )}
                </div>

                {/* PERSONAL INFORMATION */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* NAME */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Full Name
                      </label>

                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-3 top-3.5 text-gray-400"
                        />

                        <input
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Enter your full name"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Email
                      </label>

                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-3 top-3.5 text-gray-400"
                        />

                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Enter your email"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    </div>

                    {/* PHONE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Phone
                      </label>

                      <div className="relative">
                        <Phone
                          size={18}
                          className="absolute left-3 top-3.5 text-gray-400"
                        />

                        <input
                          type="text"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Enter your phone number"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    </div>

                    {/* LOCATION */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Location
                      </label>

                      <div className="relative">
                        <MapPin
                          size={18}
                          className="absolute left-3 top-3.5 text-gray-400"
                        />

                        <input
                          type="text"
                          name="location"
                          value={profile.location}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Enter your location"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CAREER INFORMATION */}
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    Career Information
                  </h3>

                  {/* ROLE */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Current Role
                    </label>

                    <div className="relative">
                      <Briefcase
                        size={18}
                        className="absolute left-3 top-3.5 text-gray-400"
                      />

                      <input
                        type="text"
                        name="role"
                        value={profile.role}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="Enter your current role"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* BIO */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      About Me
                    </label>

                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="Tell us about yourself..."
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600 resize-none"
                    />
                  </div>
                </div>
              </motion.div>

              {/* RESUME OVERVIEW */}
              <motion.div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-6"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText
                      size={22}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Resume Overview
                    </h3>

                    <p className="text-sm text-gray-500">
                      Information extracted from your uploaded CV.
                    </p>
                  </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

                  <div className="bg-blue-50 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <Award
                        size={22}
                        className="text-blue-600"
                      />

                      <div>
                        <p className="text-sm text-gray-500">
                          Resume Score
                        </p>

                        <p className="text-2xl font-bold text-gray-800">
                          {candidateData.resume_score}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <Briefcase
                        size={22}
                        className="text-green-600"
                      />

                      <div>
                        <p className="text-sm text-gray-500">
                          Experience
                        </p>

                        <p className="text-2xl font-bold text-gray-800">
                          {candidateData.experience_years} years
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <Code2
                        size={22}
                        className="text-purple-600"
                      />

                      <div>
                        <p className="text-sm text-gray-500">
                          Skill Groups
                        </p>

                        <p className="text-2xl font-bold text-gray-800">
                          {candidateData.extracted_skills.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SKILLS */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Code2
                      size={20}
                      className="text-blue-600"
                    />

                    <h4 className="font-bold text-gray-800">
                      Extracted Skills
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {candidateData.extracted_skills.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No skills extracted from your CV.
                      </p>
                    ) : (
                      candidateData.extracted_skills.map(
                        (skill, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700"
                          >
                            {skill}
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>

                {/* EDUCATION */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap
                      size={20}
                      className="text-blue-600"
                    />

                    <h4 className="font-bold text-gray-800">
                      Education
                    </h4>
                  </div>

                  {candidateData.education.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No education information available.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {candidateData.education.map(
                        (education, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-xl p-5"
                          >
                            <h5 className="font-semibold text-gray-800">
                              {education.title || "Education"}
                            </h5>

                            <p className="text-sm text-gray-600 mt-1">
                              {education.institution ||
                                "Institution not specified"}
                            </p>

                            {education.courses && (
                              <p className="text-sm text-gray-500 mt-2">
                                {education.courses}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Profile;

