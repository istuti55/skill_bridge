import { useEffect, useState } from "react";
import {
  getJobs,
  getJobApplications,
  getRankedCandidates,
  updateApplicationStage,
} from "../../services/api";
import ReviewModal from "../../components/Reviews/ReviewModal";

function CompanyApplicants() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applications, setApplications] = useState([]);
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [reviewTarget, setReviewTarget] = useState(null);

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingRanking, setLoadingRanking] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [interviewDate, setInterviewDate] = useState({});
  const [interviewTime, setInterviewTime] = useState({});

  const loadJobs = async () => {
    try {
      setLoadingJobs(true);
      setError("");

      const data = await getJobs();

      const jobList = Array.isArray(data)
        ? data
        : data.results || [];

      setJobs(jobList);

      if (jobList.length > 0) {
        setSelectedJobId(String(jobList[0].id));
      }
    } catch (err) {
      console.error("Load company jobs error:", err);
      setError(err.message || "Failed to load jobs.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadApplicants = async (jobId) => {
    if (!jobId) {
      setApplications([]);
      setRankedCandidates([]);
      return;
    }

    try {
      setLoadingApplications(true);
      setLoadingRanking(true);
      setError("");

      const [applicationData, rankingData] = await Promise.all([
        getJobApplications(jobId),
        getRankedCandidates(jobId),
      ]);

      const applicationList = Array.isArray(applicationData)
        ? applicationData
        : applicationData.results || [];

      const rankingList = Array.isArray(rankingData)
        ? rankingData
        : rankingData.results || [];

      setApplications(applicationList);
      setRankedCandidates(rankingList);

      // Restore existing interview date/time into the form
      const dateValues = {};
      const timeValues = {};

      applicationList.forEach((application) => {
        if (application.interview_date) {
          const date = new Date(application.interview_date);

          dateValues[application.id] = date
            .toISOString()
            .slice(0, 10);

          timeValues[application.id] = date
            .toTimeString()
            .slice(0, 5);
        }
      });

      setInterviewDate(dateValues);
      setInterviewTime(timeValues);
    } catch (err) {
      console.error("Load applicants error:", err);
      setError(err.message || "Failed to load applicants.");
      setApplications([]);
      setRankedCandidates([]);
    } finally {
      setLoadingApplications(false);
      setLoadingRanking(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadApplicants(selectedJobId);
    }
  }, [selectedJobId]);

  const handleStageChange = async (
    application,
    newStage
  ) => {
    try {
      setError("");
      setMessage("");

      let extra = {};

      if (newStage === "interview_scheduled") {
        const date = interviewDate[application.id];
        const time = interviewTime[application.id];

        if (!date || !time) {
          setError(
            "Please select both an interview date and time."
          );
          return;
        }

        const localDateTime = `${date}T${time}:00`;

        extra = {
          interview_date: new Date(
            localDateTime
          ).toISOString(),
        };
      }

      await updateApplicationStage(
        application.id,
        newStage,
        extra
      );

      setMessage(
        `${application.candidate_name} moved to ${newStage.replaceAll(
          "_",
          " "
        )}.`
      );

      await loadApplicants(selectedJobId);
    } catch (err) {
      console.error(
        "Update recruitment stage error:",
        err
      );

      setError(
        err.message ||
          "Failed to update recruitment stage."
      );
    }
  };

  const getStageClasses = (stage) => {
    switch (stage) {
      case "shortlisted":
        return "bg-blue-100 text-blue-700";

      case "interview_scheduled":
        return "bg-purple-100 text-purple-700";

      case "offer_extended":
        return "bg-yellow-100 text-yellow-700";

      case "hired":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getScoreClasses = (score) => {
    if (score >= 80) {
      return "text-green-600";
    }

    if (score >= 60) {
      return "text-blue-600";
    }

    if (score >= 40) {
      return "text-yellow-600";
    }

    return "text-red-600";
  };

  const selectedJob = jobs.find(
    (job) =>
      String(job.id) === String(selectedJobId)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Applicants
        </h1>

        <p className="mt-2 text-gray-600">
          Review applicants, compare match scores, and manage
          recruitment stages.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success */}
      {message && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* Job selector */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Select Job
        </label>

        {loadingJobs ? (
          <p className="text-gray-500">
            Loading jobs...
          </p>
        ) : jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="text-gray-500">
              You have not posted any jobs yet.
            </p>
          </div>
        ) : (
          <select
            value={selectedJobId}
            onChange={(event) => {
              setSelectedJobId(event.target.value);
              setMessage("");
              setError("");
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 md:max-w-2xl"
          >
            {jobs.map((job) => (
              <option
                key={job.id}
                value={job.id}
              >
                {job.title} — {job.status}
              </option>
            ))}
          </select>
        )}

        {selectedJob && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="font-medium text-gray-800">
              {selectedJob.title}
            </p>

            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
              <span>
                Status: {selectedJob.status}
              </span>

              <span>
                Applicants: {applications.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ranking */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Candidate Ranking
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Candidates are ordered by match score.
            </p>
          </div>

          {loadingRanking && (
            <span className="text-sm text-gray-500">
              Loading ranking...
            </span>
          )}
        </div>

        {rankedCandidates.length === 0 &&
        !loadingRanking ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">
              No ranked candidates available for this job.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Match Score</th>
                  <th className="px-4 py-3">Matched Skills</th>
                  <th className="px-4 py-3">Missing Skills</th>
                  <th className="px-4 py-3">Stage</th>
                </tr>
              </thead>

              <tbody>
                {rankedCandidates.map(
                  (candidate, index) => (
                    <tr
                      key={
                        candidate.application_id ||
                        candidate.candidate_id
                      }
                      className="border-b border-gray-100"
                    >
                      <td className="px-4 py-4 font-medium text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-800">
                          {candidate.name}
                        </div>

                        {!candidate.applied && (
                          <span className="mt-1 inline-block text-xs text-gray-400">
                            Not applied
                          </span>
                        )}
                      </td>

                      <td
                        className={`px-4 py-4 font-bold ${getScoreClasses(
                          candidate.match_score
                        )}`}
                      >
                        {candidate.match_score}%
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {candidate.matched_skills?.length
                          ? candidate.matched_skills.join(", ")
                          : "None"}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {candidate.missing_skills?.length
                          ? candidate.missing_skills.join(", ")
                          : "None"}
                      </td>

                      <td className="px-4 py-4">
                        {candidate.recruitment_stage ? (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStageClasses(
                              candidate.recruitment_stage
                            )}`}
                          >
                            {candidate.recruitment_stage.replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not applied
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Applicants */}
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-800">
            Job Applicants
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage the recruitment stage for each applicant.
          </p>
        </div>

        {loadingApplications ? (
          <p className="text-gray-500">
            Loading applicants...
          </p>
        ) : applications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">
              No applications received for this job yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="rounded-xl border border-gray-200 p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {application.candidate_name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Applied for {application.job_title}
                    </p>

                    {application.applied_date && (
                      <p className="mt-1 text-xs text-gray-400">
                        Applied:{" "}
                        {new Date(
                          application.applied_date
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-sm text-gray-500">
                      Match Score
                    </p>

                    <p
                      className={`text-2xl font-bold ${getScoreClasses(
                        Number(
                          application.match_score || 0
                        )
                      )}`}
                    >
                      {application.match_score ?? 0}%
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Recruitment Stage
                    </p>

                    <select
                      value={
                        application.recruitment_stage ||
                        "applied"
                      }
                      onChange={(event) =>
                        handleStageChange(
                          application,
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="applied">
                        Applied
                      </option>

                      <option value="shortlisted">
                        Shortlisted
                      </option>

                      <option value="interview_scheduled">
                        Interview Scheduled
                      </option>

                      <option value="offer_extended">
                        Offer Extended
                      </option>

                      <option value="hired">
                        Hired
                      </option>

                      <option value="rejected">
                        Rejected
                      </option>
                    </select>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Current Status
                    </p>

                    <span
                      className={`inline-block rounded-full px-3 py-2 text-sm font-medium ${getStageClasses(
                        application.recruitment_stage
                      )}`}
                    >
                      {(
                        application.recruitment_stage ||
                        "applied"
                      ).replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Review candidate */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setReviewTarget(application)}
                    className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-100"
                  >
                    Review candidate
                  </button>
                </div>

                {reviewTarget?.id === application.id && (
                  <ReviewModal
                    targetUserId={application.candidate_user_id}
                    targetName={application.candidate_name}
                    onClose={() => setReviewTarget(null)}
                  />
                )}

                {/* Interview scheduling */}
                {(application.recruitment_stage ===
                  "shortlisted" ||
                  application.recruitment_stage ===
                    "interview_scheduled") && (
                  <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-5">
                    <p className="mb-4 text-sm font-semibold text-purple-800">
                      Schedule Interview
                    </p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Interview Date
                        </label>

                        <input
                          type="date"
                          value={
                            interviewDate[
                              application.id
                            ] || ""
                          }
                          onChange={(event) =>
                            setInterviewDate(
                              (current) => ({
                                ...current,
                                [application.id]:
                                  event.target.value,
                              })
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Interview Time
                        </label>

                        <input
                          type="time"
                          value={
                            interviewTime[
                              application.id
                            ] || ""
                          }
                          onChange={(event) =>
                            setInterviewTime(
                              (current) => ({
                                ...current,
                                [application.id]:
                                  event.target.value,
                              })
                            )
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleStageChange(
                          application,
                          "interview_scheduled"
                        )
                      }
                      className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                    >
                      Save Interview
                    </button>

                    <p className="mt-3 text-xs text-purple-700">
                      Select the interview date and time, then
                      click "Save Interview".
                    </p>
                  </div>
                )}

                {/* Saved interview */}
                {application.interview_date && (
                  <div className="mt-4 rounded-lg bg-purple-50 p-4">
                    <p className="text-sm font-medium text-purple-800">
                      Interview
                    </p>

                    <p className="mt-1 text-sm text-purple-700">
                      {new Date(
                        application.interview_date
                      ).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Rejection reason */}
                {application.rejection_reason && (
                  <div className="mt-4 rounded-lg bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-800">
                      Rejection Reason
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      {application.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyApplicants;