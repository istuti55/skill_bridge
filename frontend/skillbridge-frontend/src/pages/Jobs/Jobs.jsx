import { useState } from "react";
import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";

import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";
import JobCard from "../../components/Dashboard/JobCard/JobCard";

function Jobs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const jobs = [
    {
      company: "TechNova",
      title: "Frontend Developer",
      location: "Kathmandu, Nepal",
      salary: "NPR 50,000 - 80,000",
      type: "Full-time",
      match: 95,
      logo: "🚀",
    },
    {
      company: "CloudTech Nepal",
      title: "Full Stack Developer",
      location: "Kathmandu, Nepal",
      salary: "NPR 60,000 - 100,000",
      type: "Full-time",
      match: 92,
      logo: "☁️",
    },
    {
      company: "DataMind",
      title: "Machine Learning Engineer",
      location: "Remote",
      salary: "NPR 70,000 - 110,000",
      type: "Full-time",
      match: 89,
      logo: "🤖",
    },
    {
      company: "WebWorks",
      title: "React Developer",
      location: "Lalitpur, Nepal",
      salary: "NPR 45,000 - 75,000",
      type: "Full-time",
      match: 87,
      logo: "💻",
    },
    {
      company: "Innovate Nepal",
      title: "Python Developer",
      location: "Pokhara, Nepal",
      salary: "NPR 50,000 - 85,000",
      type: "Full-time",
      match: 84,
      logo: "🐍",
    },
    {
      company: "Digital Solutions",
      title: "Software Engineer",
      location: "Remote",
      salary: "NPR 65,000 - 100,000",
      type: "Full-time",
      match: 81,
      logo: "⚡",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1">

        {/* Topbar */}
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
                <Briefcase
                  size={26}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                  Job Opportunities
                </h1>

                <p className="text-gray-500 mt-1">
                  Find jobs that match your skills and career goals.
                </p>
              </div>

            </div>
          </motion.div>

          {/* Section Heading */}
          <div className="mb-6">

            <h2 className="text-xl font-bold text-gray-800">
              Recommended Jobs
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Jobs recommended based on your AI profile analysis.
            </p>

          </div>

          {/* Job Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {jobs.map((job, index) => (
              <motion.div
                key={job.company + job.title}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                }}
              >
                <JobCard
                  company={job.company}
                  title={job.title}
                  location={job.location}
                  salary={job.salary}
                  type={job.type}
                  match={job.match}
                  logo={job.logo}
                />
              </motion.div>
            ))}

          </div>

        </main>

      </div>

    </div>
  );
}

export default Jobs;