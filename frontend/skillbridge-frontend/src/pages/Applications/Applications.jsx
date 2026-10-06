import { useEffect, useState } from "react";
import {
  Briefcase,
  CheckCircle,
  Clock,
  XCircle,
  CalendarDays,
} from "lucide-react";
import { motion } from "framer-motion";

import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";
import { getMyApplications } from "../../services/api";

function Applications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const data = await getMyApplications();

        console.log(
          "MY APPLICATIONS DATA:",
          JSON.stringify(data, null, 2)
        );

        setApplications(
          Array.isArray(data)
            ? data
            : data.results || data.applications || []
        );
      } catch (err) {
        console.error(
          "Failed to load applications:",
          err
        );

        setError(
          err.message ||
            "Failed to load applications."
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const getStatusStyle = (status) => {
    const value = String(
      status || "applied"
    ).toLowerCase();

    if (value === "hired") {
      return {
        label: "Hired",
        className:
          "bg-green-100 text-green-700",
        icon: <CheckCircle size={16} />,
      };
    }

    if (value === "shortlisted") {
      return {
        label: "Shortlisted",
        className:
          "bg-blue-100 text-blue-700",
        icon: <CheckCircle size={16} />,
      };
    }

    if (value === "interview") {
      return {
        label: "Interview",
        className:
          "bg-purple-100 text-purple-700",
        icon: <CalendarDays size={16} />,
      };
    }

    if (value === "rejected") {
      return {
        label: "Rejected",
        className:
          "bg-red-100 text-red-700",
        icon: <XCircle size={16} />,
      };
    }

    return {
      label: "Applied",
      className:
        "bg-yellow-100 text-yellow-700",
      icon: <Clock size={16} />,
    };
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
                  My Applications
                </h1>

                <p className="text-gray-500 mt-1">
                  Track your job applications and
                  their current status.
                </p>
              </div>

            </div>
          </motion.div>

          {loading && (
            <p className="text-gray-500">
              Loading applications...
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            applications.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center">

                <Briefcase
                  size={42}
                  className="mx-auto text-gray-400 mb-3"
                />

                <h3 className="text-lg font-semibold text-gray-700">
                  No applications yet
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Apply to a job to see your
                  application here.
                </p>

              </div>
            )}

          {!loading &&
            !error &&
            applications.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {applications.map(
                  (application, index) => {

                    const status =
                      application.recruitment_stage ||
                      "applied";

                    const statusStyle =
                      getStatusStyle(status);

                    return (
                      <motion.div
                        key={
                          application.id ||
                          index
                        }
                        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.08,
                        }}
                      >

                        <div className="flex justify-between items-start gap-4">

                          <div>
                            <h2 className="text-xl font-bold text-gray-800">
                              {application.job_title ||
                                "Job Application"}
                            </h2>

                            <p className="text-gray-600 mt-1">
                              TechNova
                            </p>
                          </div>

                          <span
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${statusStyle.className}`}
                          >
                            {statusStyle.icon}
                            {statusStyle.label}
                          </span>

                        </div>

                        <div className="mt-5 space-y-3 text-sm text-gray-600">

                          {application.match_score && (
                            <p>
                              🎯 Match Score:{" "}
                              <strong>
                                {application.match_score}%
                              </strong>
                            </p>
                          )}

                          {application.applied_date && (
                            <p>
                              📅 Applied:{" "}
                              {new Date(
                                application.applied_date
                              ).toLocaleDateString()}
                            </p>
                          )}

                          {application.interview_date && (
                            <p>
                              🎯 Interview:{" "}
                              {new Date(
                                application.interview_date
                              ).toLocaleDateString()}
                            </p>
                          )}

                        </div>

                      </motion.div>
                    );
                  }
                )}

              </div>
            )}

        </main>
      </div>
    </div>
  );
}

export default Applications;