import { useState } from "react";
import { motion } from "framer-motion";

import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";
import ResumeCard from "../../components/Dashboard/ResumeCard/ResumeCard";

function Resume() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

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
            className="
              w-10
              h-10
              rounded-xl
              bg-blue-50
              text-blue-600
              flex
              items-center
              justify-center
              hover:bg-blue-100
              transition
            "
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

          {/* Heading */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Resume
            </h1>

            <p className="text-gray-500 mt-2">
              Upload and manage your resume for AI-powered career analysis.
            </p>
          </motion.div>

          {/* Resume Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ResumeCard
              onAnalysisComplete={() => setAnalysisComplete(true)}
            />
          </motion.div>

          {/* Analysis Status */}
          {analysisComplete && (
            <motion.div
              className="
                mt-6
                bg-green-50
                border
                border-green-200
                rounded-2xl
                p-5
                text-green-700
              "
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-semibold text-lg">
                AI Analysis Completed
              </h2>

              <p className="text-sm mt-1">
                Your resume has been analyzed successfully. You can now view
                your AI analysis and skill-gap results.
              </p>
            </motion.div>
          )}

        </main>

      </div>

    </div>
  );
}

export default Resume;