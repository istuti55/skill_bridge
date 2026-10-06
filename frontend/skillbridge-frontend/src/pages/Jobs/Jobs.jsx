import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";

import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";
import JobCard from "../../components/Dashboard/JobCard/JobCard";

import {
  getJobs,
  applyToJob,
} from "../../services/api";

function Jobs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingJobId, setApplyingJobId] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError("");

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

  const handleApply = async (jobId) => {
    try {
      setError("");
      setApplyingJobId(jobId);

      await applyToJob(jobId);

      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                has_applied: true,
              }
            : job
        )
      );
    } catch (err) {
      console.error("Failed to apply:", err);

      setError(
        err.message || "Failed to apply for this job."
      );
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
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Briefcase
                  size={26}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
                  Job Opportunities
                </h1>

                <p className="mt-1 text-gray-500">
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

            <p className="mt-1 text-sm text-gray-500">
              Jobs recommended based on your AI profile analysis.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <p className="mb-6 text-gray-500">
              Loading jobs...
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            !error &&
            jobs.length === 0 && (
              <div className="rounded-2xl bg-white p-8 text-center">
                <Briefcase
                  size={40}
                  className="mx-auto mb-3 text-gray-400"
                />

                <h3 className="text-lg font-semibold text-gray-700">
                  No jobs available
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Check back later for new opportunities.
                </p>
              </div>
            )}

          {/* Job Cards */}
          {!loading &&
            jobs.length > 0 && (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
                      job={job}
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