import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";
import DashboardCard from "../../components/Dashboard/DashboardCard/DashboardCard";
import ResumeCard from "../../components/Dashboard/ResumeCard/ResumeCard";

import AIAnalysisCard from "../../components/Dashboard/AIAnalysisCard/AIAnalysisCard";
import RecommendedJobs from "../../components/Dashboard/RecommendedJobs/RecommendedJobs";
import CareerProgress from "../../components/Dashboard/CareerProgress/CareerProgress";
import UpcomingInterviews from "../../components/Dashboard/UpcomingInterviews/UpcomingInterviews";
import RecentActivity from "../../components/Dashboard/RecentActivity/RecentActivity";
import SkillGapAnalysis from "../../components/Dashboard/SkillGapAnalysis/SkillGapAnalysis";
import LearningRoadmap from "../../components/Dashboard/LearningRoadmap/LearningRoadmap";

import { useState } from "react";
import { motion } from "framer-motion";

import {
  FileText,
  Brain,
  Briefcase,
  Star,
} from "lucide-react";

function CareerDashboard() {
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Animation for individual dashboard cards
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },

    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const sectionVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

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

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 lg:p-8">

          {/* Page Heading */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Career Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor your career journey with AI-powered insights.
            </p>
          </motion.div>

          {/* Dashboard Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},

              visible: {
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
          >

            {/* Resume Score */}
            <motion.div
              variants={cardVariants}
              transition={{ duration: 0.4 }}
            >
              <DashboardCard
                title="Resume Score"
                value="92%"
                subtitle="Excellent Resume"
                trend="▲ +8% from last analysis"
                icon={<FileText size={30} />}
                color="#2563eb"
              />
            </motion.div>

            {/* AI Analysis */}
            <motion.div
              variants={cardVariants}
              transition={{ duration: 0.4 }}
            >
              <DashboardCard
                title="AI Analysis"
                value="88%"
                subtitle="Profile Strength"
                trend="▲ Strong Match"
                icon={<Brain size={30} />}
                color="#7c3aed"
              />
            </motion.div>

            {/* Jobs Matched */}
            <motion.div
              variants={cardVariants}
              transition={{ duration: 0.4 }}
            >
              <DashboardCard
                title="Jobs Matched"
                value="24"
                subtitle="Recommended Jobs"
                trend="+5 New Today"
                icon={<Briefcase size={30} />}
                color="#16a34a"
              />
            </motion.div>

            {/* Skills */}
            <motion.div
              variants={cardVariants}
              transition={{ duration: 0.4 }}
            >
              <DashboardCard
                title="Skills"
                value="14"
                subtitle="Verified Skills"
                trend="3 Need Improvement"
                icon={<Star size={30} />}
                color="#ea580c"
              />
            </motion.div>

          </motion.div>

          {/* Resume Management */}
          <div className="mt-8">

            <ResumeCard
              onAnalysisComplete={() => setAnalysisComplete(true)}
            />

            {/* Show remaining dashboard after AI analysis */}
            {analysisComplete && (
              <>

                {/* First Row */}
                <motion.div
                  className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8"
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                >
                
                  {/* AI Analysis */}
                  <div className="xl:col-span-2">
                    <AIAnalysisCard
                      score={92}
                      strengths={[
                        "ATS Friendly",
                        "Strong Technical Skills",
                      ]}
                      improvements={[
                        "Improve Professional Summary",
                        "Add More Projects",
                      ]}                   
                    />
                  </div>

                  {/* Recent Activity */}
                  <RecentActivity />
                </motion.div>

                {/* Second Row */}
                <motion.div
                  className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8"
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                 }}
                >
                  <RecommendedJobs />

                  <CareerProgress />
                </motion.div>

                {/* Third Row */}
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                >
                  <UpcomingInterviews />
                </motion.div>

                {/* Skill Gap Analysis */}
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                >
                  {/* Skill Gap Analysis */}
                  <div className="mt-8">
                    <SkillGapAnalysis />
                  </div>

                  {/* Learning Roadmap */}
                  <LearningRoadmap />
                </motion.div>

              </>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

export default CareerDashboard;