import { useState } from "react";
import { User, Mail, Phone, MapPin, Briefcase, Edit3, Save } from "lucide-react";
import { motion } from "framer-motion";

import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";

function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Alex Sharma",
    email: "alex@example.com",
    phone: "+977 98XXXXXXXX",
    location: "Kathmandu, Nepal",
    role: "Frontend Developer",
    bio: "Computer Engineering student interested in AI, web development and modern technologies.",
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    setEditing(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1">
        <Topbar />

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
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
                  Manage your personal information and career profile.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
                  AS
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

            {/* Personal Information */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                {/* Email */}
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                {/* Phone */}
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                {/* Location */}
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Career Information */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Career Information
              </h3>

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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  About Me
                </label>

                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!editing}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600 resize-none"
                />
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default Profile;