import { useEffect, useState } from "react";

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

import { motion } from "framer-motion";

import {
  FileText,
  Brain,
  Briefcase,
  Star,
} from "lucide-react";

import { getCandidateDashboard } from "../../services/api";

function CareerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);

  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [dashboardError, setDashboardError] = useState("");

  // Load real candidate dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getCandidateDashboard();

        console.log(
          "CANDIDATE DASHBOARD DATA:",
          JSON.stringify(data, null, 2)
        );

        setDashboardData(data);
      } catch (err) {
        console.error(
          "Failed to load candidate dashboard:",
          err
        );

        setDashboardError(
          err.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboard();
  }, []);

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
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Career Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor your career journey with AI-powered insights.
            </p>
          </motion.div>

          {/* Dashboard Error */}
          {dashboardError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
              {dashboardError}
            </div>
          )}

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
                value={
                  dashboardLoading
                    ? "..."
                    : `${dashboardData?.resume_score ?? 0}%`
                }
                subtitle="Resume Score"
                trend={
                  dashboardLoading
                    ? "Loading..."
                    : dashboardData?.resume_score >= 80
                    ? "Excellent Resume"
                    : "Needs Improvement"
                }
                icon={<FileText size={30} />}
                color="#2563eb"
              />
            </motion.div>

            {/* AI Analysis / Job Readiness */}
            <motion.div
              variants={cardVariants}
              transition={{ duration: 0.4 }}
            >
              <DashboardCard
                title="AI Analysis"
                value={
                  dashboardLoading
                    ? "..."
                    : `${dashboardData?.job_readiness ?? 0}%`
                }
                subtitle="Job Readiness"
                trend={
                  dashboardLoading
                    ? "Loading..."
                    : dashboardData?.job_readiness >= 80
                    ? "Strong Match"
                    : "Keep Improving"
                }
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
                value={
                  dashboardLoading
                    ? "..."
                    : dashboardData?.matched_jobs_count ?? 0
                }
                subtitle="Recommended Jobs"
                trend={
                  dashboardLoading
                    ? "Loading..."
                    : "Based on your profile"
                }
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
                value={
                  dashboardLoading
                    ? "..."
                    : dashboardData?.skills_total ?? 0
                }
                subtitle="Detected Skills"
                trend={
                  dashboardLoading
                    ? "Loading..."
                    : `${dashboardData?.skills_strong ?? 0} Strong Skills`
                }
                icon={<Star size={30} />}
                color="#ea580c"
              />
            </motion.div>

          </motion.div>

          {/* Resume Management */}
          <div className="mt-8">

            <ResumeCard />

            {/* Dashboard Details */}
            <>

              {/* First Row */}
              <motion.div
                className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8"
                initial={{
                  opacity: 0,
                  y: 60,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
              >

                {/* AI Analysis */}
                <div className="xl:col-span-2">
                  <AIAnalysisCard
                    score={
                      dashboardData?.resume_score ?? 0
                    }
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
                initial={{
                  opacity: 0,
                  y: 60,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
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
                initial={{
                  opacity: 0,
                  y: 60,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
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
                initial={{
                  opacity: 0,
                  y: 60,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
              >

                <SkillGapAnalysis
                  jobId={dashboardData?.top_matches?.[0]?.job_id}
                />

                <LearningRoadmap />

              </motion.div>

            </>

          </div>

        </main>

      </div>

    </div>
  );
}

export default CareerDashboard;