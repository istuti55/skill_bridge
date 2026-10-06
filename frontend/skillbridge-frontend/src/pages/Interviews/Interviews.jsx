
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Briefcase,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";
import { getMyApplications } from "../../services/api";

function Interviews() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const data = await getMyApplications();

        console.log(
          "INTERVIEW APPLICATION DATA:",
          JSON.stringify(data, null, 2)
        );

        setApplications(
          Array.isArray(data)
            ? data
            : data.results || []
        );
      } catch (err) {
        console.error(
          "Failed to load interview data:",
          err
        );

        setError(
          err.message ||
            "Failed to load interview information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not scheduled";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const getStatus = (stage) => {
    const value = stage?.toLowerCase();

    if (value === "hired") {
      return {
        label: "Hired",
        className:
          "bg-green-100 text-green-700",
      };
    }

    if (value === "shortlisted") {
      return {
        label: "Shortlisted",
        className:
          "bg-blue-100 text-blue-700",
      };
    }

    if (value === "interview") {
      return {
        label: "Interview",
        className:
          "bg-purple-100 text-purple-700",
      };
    }

    if (value === "rejected") {
      return {
        label: "Rejected",
        className:
          "bg-red-100 text-red-700",
      };
    }

    return {
      label: "Application Submitted",
      className:
        "bg-gray-100 text-gray-700",
    };
  };

  const scheduledInterviews = applications.filter(
    (application) =>
      application.interview_date
  );

  const applicationsWithoutInterview =
    applications.filter(
      (application) =>
        !application.interview_date
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1">
        <Topbar />

        <main className="p-4 sm:p-6 lg:p-8">

          {/* Header */}
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
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <CalendarDays
                  size={26}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                  Interviews
                </h1>

                <p className="text-gray-500 mt-1">
                  Manage your interviews and track your application progress.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500">
                Loading interview information...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle size={20} />
                Failed to load interviews
              </div>

              <p className="text-sm mt-1">
                {error}
              </p>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* Scheduled Interviews */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Upcoming Interviews
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Your scheduled interviews appear here.
                    </p>
                  </div>

                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {scheduledInterviews.length}
                  </span>
                </div>

                {scheduledInterviews.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                    <CalendarDays
                      size={40}
                      className="mx-auto text-gray-400 mb-3"
                    />

                    <h3 className="text-lg font-semibold text-gray-700">
                      No interviews scheduled
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      You don't have any scheduled interviews yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {scheduledInterviews.map(
                      (application, index) => {
                        const status = getStatus(
                          application.recruitment_stage
                        );

                        return (
                          <motion.div
                            key={application.id}
                            initial={{
                              opacity: 0,
                              y: 20,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              duration: 0.4,
                              delay: index * 0.08,
                            }}
                            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                  {application.job_title ||
                                    "Job Opportunity"}
                                </h3>

                                <p className="text-gray-500 mt-1">
                                  Application #{application.id}
                                </p>
                              </div>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </div>

                            <div className="mt-5 space-y-3">
                              <div className="flex items-center gap-3 text-gray-600">
                                <CalendarDays
                                  size={18}
                                  className="text-blue-600"
                                />

                                <span>
                                  {formatDate(
                                    application.interview_date
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-gray-600">
                                <Clock
                                  size={18}
                                  className="text-blue-600"
                                />

                                <span>
                                  {formatTime(
                                    application.interview_date
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-gray-600">
                                <Briefcase
                                  size={18}
                                  className="text-blue-600"
                                />

                                <span>
                                  {application.job_title ||
                                    "Job Application"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-5 pt-5 border-t border-gray-100">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                  Match Score
                                </span>

                                <span className="font-semibold text-blue-600">
                                  {application.match_score}%
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }
                    )}
                  </div>
                )}
              </section>

              {/* Applications Waiting for Interview */}
              <section>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Application Status
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Applications that have not received an interview date yet.
                  </p>
                </div>

                {applicationsWithoutInterview.length ===
                0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                    <CheckCircle
                      size={40}
                      className="mx-auto text-green-500 mb-3"
                    />

                    <h3 className="text-lg font-semibold text-gray-700">
                      All applications have interview dates
                    </h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {applicationsWithoutInterview.map(
                      (application, index) => {
                        const status = getStatus(
                          application.recruitment_stage
                        );

                        return (
                          <motion.div
                            key={application.id}
                            initial={{
                              opacity: 0,
                              y: 20,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              duration: 0.4,
                              delay: index * 0.08,
                            }}
                            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                  {application.job_title ||
                                    "Job Opportunity"}
                                </h3>

                                <p className="text-gray-500 text-sm mt-1">
                                  Application #{application.id}
                                </p>
                              </div>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </div>

                            <div className="mt-5 flex items-center gap-3">
                              <Clock
                                size={18}
                                className="text-gray-400"
                              />

                              <span className="text-sm text-gray-500">
                                Interview not scheduled yet
                              </span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                  Match Score
                                </span>

                                <span className="font-semibold text-blue-600">
                                  {application.match_score}%
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Interviews;

