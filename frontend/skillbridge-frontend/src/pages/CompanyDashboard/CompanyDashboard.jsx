
import { useEffect, useState } from "react";
import { getCompanyDashboard } from "../../services/api";

function CompanyDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getCompanyDashboard();
        setDashboard(data);
      } catch (err) {
        console.error("Company dashboard error:", err);
        setError(err.message || "Failed to load company dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Company Dashboard
        </h1>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Company Dashboard
        </h1>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <p className="font-medium text-red-600">
            {error}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            You must be logged in with a company account to view this dashboard.
          </p>
        </div>
      </div>
    );
  }

  const activeJobs = dashboard.jobs_by_status?.open || 0;
  const shortlisted = dashboard.pipeline?.shortlisted || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Company Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your jobs, applicants, and recruitment process.
        </p>

        {!dashboard.company_approved && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            Your company account is waiting for approval.
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Total Jobs</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {dashboard.jobs_total}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Active Jobs</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {activeJobs}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Total Applicants</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {dashboard.applications_total}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Shortlisted</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {shortlisted}
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Jobs */}
        <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Jobs
            </h2>
          </div>

          {dashboard.jobs?.length > 0 ? (
            <div className="space-y-4">
              {dashboard.jobs.slice(0, 5).map((job) => (
                <div
                  key={job.job_id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {job.applicants} applicants
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {job.status}
                      </span>

                      <p className="mt-2 text-sm font-medium text-blue-600">
                        {job.avg_match_score}% avg match
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">
                No jobs available yet.
              </p>
            </div>
          )}
        </div>

        {/* Recruitment Pipeline */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Recruitment Pipeline
          </h2>

          <div className="space-y-3">
            {Object.entries(dashboard.pipeline || {}).map(
              ([stage, count]) => (
                <div
                  key={stage}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <span className="text-sm capitalize text-gray-600">
                    {stage.replaceAll("_", " ")}
                  </span>

                  <span className="font-semibold text-gray-800">
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Top Candidates */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Top Candidates
        </h2>

        {dashboard.top_candidates?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Match Score</th>
                  <th className="px-4 py-3">Stage</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.top_candidates.map((candidate) => (
                  <tr
                    key={candidate.application_id}
                    className="border-b border-gray-100"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {candidate.name}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {candidate.job}
                    </td>

                    <td className="px-4 py-3 font-semibold text-blue-600">
                      {candidate.match_score}%
                    </td>

                    <td className="px-4 py-3 capitalize text-gray-600">
                      {candidate.stage.replaceAll("_", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">
            No candidates yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default CompanyDashboard;

