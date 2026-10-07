
import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";

import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";
import JobCard from "../../components/Dashboard/JobCard/JobCard";
import { getJobs, applyToJob } from "../../services/api";

function Jobs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  // Load real jobs from backend
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await getJobs();

        console.log(
          "REAL JOBS DATA:",
          JSON.stringify(data, null, 2)
        );

        setJobs(
          Array.isArray(data)
            ? data
            : data.results || []
        );
      } catch (err) {
        console.error("Failed to load jobs:", err);

        setError(
          err.message || "Failed to load jobs."
        );
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Apply for a job
  const handleApply = async (jobId) => {
    try {
      setApplyingJobId(jobId);

      await applyToJob(jobId);

      setAppliedJobIds((prev) =>
        prev.includes(jobId)
          ? prev
          : [...prev, jobId]
      );

      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Application failed:", err);

      const message = err.message || "";

      if (
        message.toLowerCase().includes("already") ||
        message.toLowerCase().includes("duplicate")
      ) {
        setAppliedJobIds((prev) =>
          prev.includes(jobId)
            ? prev
            : [...prev, jobId]
        );

        alert("You have already applied for this job.");
      } else {
        alert(
          message ||
            "Failed to apply for this job."
        );
      }
    } finally {
      setApplyingJobId(null);
    }
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

          {/* Loading */}
          {loading && (
            <p className="text-gray-500 mb-6">
              Loading jobs...
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            !error &&
            jobs.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center">
                <Briefcase
                  size={40}
                  className="mx-auto text-gray-400 mb-3"
                />

                <h3 className="text-lg font-semibold text-gray-700">
                  No jobs available
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Check back later for new opportunities.
                </p>
              </div>
            )}

          {/* Job Cards */}
          {!loading &&
            !error &&
            jobs.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{
                      opacity: 0,
                      y: 25,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.08,
                    }}
                  >

                    <JobCard
                      company={
                        job.company_name ||
                        job.company?.name ||
                        "Company"
                      }

                      title={
                        job.title ||
                        "Job Opportunity"
                      }

                      location={
                        job.location ||
                        "Location not specified"
                      }

                      salary={
                        job.salary ||
                        job.salary_range ||
                        "Salary not specified"
                      }

                      type={
                        job.type ||
                        job.job_type_display ||
                        job.job_type ||
                        "Full-time"
                      }

                      match={
                        job.match_score ??
                        job.match ??
                        null
                      }

                      description={
                        job.description || ""
                      }

                      requiredSkills={
                        job.required_skills || []
                      }

                      jobId={job.id}

                      isApplied={
                        appliedJobIds.includes(
                          job.id
                        ) ||
                        job.is_applied ||
                        job.applied
                      }

                      onApply={handleApply}

                      applying={
                        applyingJobId === job.id
                      }
                    />

                  </motion.div>
                ))}

              </div>
            )}

        </main>

      </div>

    </div>
  );
}

export default Jobs;