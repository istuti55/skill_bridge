import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Users,
  UserCheck,
  CalendarDays,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock3,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import { getCompanyDashboard } from "../../services/api";

function formatStage(stage) {
  return stage
    ?.replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStageStyle(stage) {
  const styles = {
    applied: "bg-pink-50 text-pink-600",
    shortlisted: "bg-purple-50 text-purple-600",
    interview_scheduled: "bg-pink-50 text-pink-600",
    offer_extended: "bg-purple-50 text-purple-600",
    hired: "bg-purple-100 text-purple-700",
    rejected: "bg-pink-50 text-pink-500",
  };

  return styles[stage] || "bg-gray-50 text-gray-600";
}

function getStatusStyle(status) {
  const styles = {
    approved: "bg-purple-50 text-purple-600",
    open: "bg-purple-50 text-purple-600",
    pending: "bg-pink-50 text-pink-600",
    closed: "bg-gray-100 text-gray-500",
    rejected: "bg-pink-50 text-pink-600",
  };

  return styles[status] || "bg-gray-50 text-gray-600";
}

function StatCard({ icon: Icon, label, value, description, type }) {
  const iconStyle =
    type === "pink"
      ? "bg-pink-50 text-pink-600"
      : "bg-purple-50 text-purple-600";

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_4px_20px_rgba(88,28,135,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(88,28,135,0.10)]">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={21} strokeWidth={2} />
        </div>

        <TrendingUp
          size={17}
          className="text-purple-300 transition group-hover:text-purple-500"
        />
      </div>

      <p className="mt-5 text-sm font-medium text-gray-500">{label}</p>

      <h2 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
        {value}
      </h2>

      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}

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
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-48 rounded-3xl bg-purple-50" />

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 rounded-2xl bg-pink-50"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-pink-100 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <XCircle className="text-pink-500" />
            <h1 className="text-xl font-bold text-gray-900">
              Unable to load dashboard
            </h1>
          </div>

          <p className="mt-3 text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const companyApproved = dashboard.company_approved === true;

  const totalApplicants = dashboard.applications_total || 0;

  const activeJobs =
    (dashboard.jobs_by_status?.open || 0) +
    (dashboard.jobs_by_status?.approved || 0);

  const applied = dashboard.pipeline?.applied || 0;
  const shortlisted = dashboard.pipeline?.shortlisted || 0;
  const interviews = dashboard.pipeline?.interview_scheduled || 0;
  const offers = dashboard.pipeline?.offer_extended || 0;
  const hired = dashboard.pipeline?.hired || 0;

  const pipeline = [
    {
      key: "applied",
      label: "Applied",
      value: applied,
      color: "bg-pink-500",
    },
    {
      key: "shortlisted",
      label: "Shortlisted",
      value: shortlisted,
      color: "bg-purple-500",
    },
    {
      key: "interview_scheduled",
      label: "Interview",
      value: interviews,
      color: "bg-pink-500",
    },
    {
      key: "offer_extended",
      label: "Offer",
      value: offers,
      color: "bg-purple-500",
    },
    {
      key: "hired",
      label: "Hired",
      value: hired,
      color: "bg-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-8 shadow-[0_15px_40px_rgba(168,85,247,0.20)] sm:px-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 right-48 h-72 w-72 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl text-white">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-white/15 p-2">
                  <Sparkles size={17} />
                </div>

                <span className="text-sm font-medium text-pink-50">
                  SkillBridge Recruitment
                </span>
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                Welcome to your
                <span className="block">recruitment dashboard.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-pink-50 sm:text-base">
                Find talented candidates, manage job openings, and move
                applicants through your hiring pipeline.
              </p>
            </div>

          </div>
        </section>

        {/* =====================================================
            APPROVAL
        ====================================================== */}
        {!dashboard.company_approved && (
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-pink-100 bg-pink-50 px-5 py-4">
            <div className="rounded-xl bg-white p-2.5 shadow-sm">
              <Clock3 size={20} className="text-pink-500" />
            </div>

            <div>
              <p className="font-semibold text-gray-800">
                Company approval pending
              </p>

              <p className="mt-0.5 text-sm text-gray-500">
                Your company account is waiting for administrator approval.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            STATISTICS
        ====================================================== */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={BriefcaseBusiness}
            label="Total Jobs"
            value={dashboard.jobs_total || 0}
            description="Jobs created"
            type="pink"
          />

          <StatCard
            icon={TrendingUp}
            label="Active Jobs"
            value={activeJobs}
            description="Currently available"
            type="purple"
          />

          <StatCard
            icon={Users}
            label="Applicants"
            value={totalApplicants}
            description="Across all jobs"
            type="pink"
          />

          <StatCard
            icon={UserCheck}
            label="Shortlisted"
            value={shortlisted}
            description="Candidates selected"
            type="purple"
          />
        </div>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}
        <section className="mt-7">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Everything you need to manage recruitment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {companyApproved ? (
              <Link
                to="/company/jobs"
                className="group rounded-2xl border border-pink-100 bg-white p-5 shadow-[0_4px_20px_rgba(88,28,135,0.04)] transition hover:border-pink-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-pink-50 p-3">
                    <Plus className="text-pink-600" size={21} />
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-pink-500"
                  />
                </div>

                <h3 className="mt-4 font-bold text-gray-800">
                  Manage Jobs
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Create, edit and manage job openings.
                </p>
              </Link>
            ) : (
              <div
                className="cursor-not-allowed rounded-2xl border border-gray-100 bg-gray-50 p-5 opacity-70"
                title="Available after company approval"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-gray-100 p-3">
                    <Plus className="text-gray-400" size={21} />
                  </div>
                  <span className="text-lg">??</span>
                </div>

                <h3 className="mt-4 font-bold text-gray-500">
                  Manage Jobs
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Available after company approval.
                </p>
              </div>
            )}

            {companyApproved ? (
              <Link
                to="/company/applicants"
                className="group rounded-2xl border border-purple-100 bg-white p-5 shadow-[0_4px_20px_rgba(88,28,135,0.04)] transition hover:border-purple-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-purple-50 p-3">
                    <Users className="text-purple-600" size={21} />
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-purple-500"
                  />
                </div>

                <h3 className="mt-4 font-bold text-gray-800">
                  Review Applicants
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Compare candidates and match scores.
                </p>
              </Link>
            ) : (
              <div
                className="cursor-not-allowed rounded-2xl border border-gray-100 bg-gray-50 p-5 opacity-70"
                title="Available after company approval"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-gray-100 p-3">
                    <Users className="text-gray-400" size={21} />
                  </div>
                  <span className="text-lg">??</span>
                </div>

                <h3 className="mt-4 font-bold text-gray-500">
                  Review Applicants
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Available after company approval.
                </p>
              </div>
            )}

            {companyApproved ? (
              <Link
                to="/company/applicants"
                className="group rounded-2xl border border-pink-100 bg-white p-5 shadow-[0_4px_20px_rgba(88,28,135,0.04)] transition hover:border-pink-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-pink-50 p-3">
                    <CalendarDays className="text-pink-600" size={21} />
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-pink-500"
                  />
                </div>

                <h3 className="mt-4 font-bold text-gray-800">
                  Recruitment
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Manage interviews and hiring stages.
                </p>
              </Link>
            ) : (
              <div
                className="cursor-not-allowed rounded-2xl border border-gray-100 bg-gray-50 p-5 opacity-70"
                title="Available after company approval"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-gray-100 p-3">
                    <CalendarDays className="text-gray-400" size={21} />
                  </div>
                  <span className="text-lg">??</span>
                </div>

                <h3 className="mt-4 font-bold text-gray-500">
                  Recruitment
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Available after company approval.
                </p>
              </div>
            )}

          </div>
        </section>
        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}
        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ===================================================
              RECENT JOBS
          ==================================================== */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_5px_25px_rgba(88,28,135,0.05)] lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Jobs
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Performance of your latest positions
                </p>
              </div>

              <Link
                to="/company/jobs"
                className="text-sm font-semibold text-purple-600 hover:text-pink-600"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {dashboard.jobs?.length > 0 ? (
                dashboard.jobs.slice(0, 5).map((job) => (
                  <div
                    key={job.job_id}
                    className="group rounded-xl border border-gray-100 p-4 transition hover:border-purple-100 hover:bg-purple-50/30"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-purple-50 p-3">
                          <BriefcaseBusiness
                            size={19}
                            className="text-purple-600"
                          />
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {job.title}
                          </h3>

                          <p className="mt-1 text-xs text-gray-400">
                            {job.applicants || 0} applicants
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div>
                          <p className="text-xs text-gray-400">
                            Avg. Match
                          </p>

                          <p className="mt-0.5 font-bold text-purple-600">
                            {job.avg_match_score || 0}%
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-purple-200 bg-purple-50/30 p-10 text-center">
                  <BriefcaseBusiness
                    size={35}
                    className="mx-auto text-purple-300"
                  />

                  <p className="mt-3 font-semibold text-gray-700">
                    No jobs yet
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Create your first position to start hiring.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ===================================================
              PIPELINE
          ==================================================== */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_5px_25px_rgba(88,28,135,0.05)]">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Hiring Pipeline
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Candidate progression
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {pipeline.map((stage, index) => {
                const percentage =
                  totalApplicants > 0
                    ? Math.round((stage.value / totalApplicants) * 100)
                    : 0;

                return (
                  <div key={stage.key}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${stage.color}`}
                        />

                        <span className="text-sm font-medium text-gray-700">
                          {stage.label}
                        </span>
                      </div>

                      <span className="text-sm font-bold text-gray-800">
                        {stage.value}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                        style={{
                          width:
                            percentage > 0
                              ? `${Math.max(percentage, 5)}%`
                              : "0%",
                        }}
                      />
                    </div>

                    <p className="mt-1 text-right text-[11px] text-gray-400">
                      {percentage}% of applicants
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-5">
              <div className="flex items-center gap-3 rounded-xl bg-purple-50 p-4">
                <div className="rounded-lg bg-white p-2">
                  <CheckCircle2
                    size={18}
                    className="text-purple-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {hired} candidate{hired !== 1 ? "s" : ""} hired
                  </p>

                  <p className="text-xs text-gray-500">
                    Keep building your team.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =====================================================
            TOP CANDIDATES
        ====================================================== */}
        <section className="mt-7 rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_5px_25px_rgba(88,28,135,0.05)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Top Candidates
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Highest matching candidates based on your job requirements.
              </p>
            </div>

            <Link
              to="/company/applicants"
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-pink-600"
            >
              View applicants
              <ArrowRight size={15} />
            </Link>
          </div>

          {dashboard.top_candidates?.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wider text-gray-400">
                    <th className="px-4 py-3 font-semibold">
                      Candidate
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Position
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Match
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Stage
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.top_candidates.map((candidate) => (
                    <tr
                      key={candidate.application_id}
                      className="border-b border-gray-50 transition hover:bg-pink-50/30"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-sm font-bold text-white">
                            {candidate.name
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {candidate.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              Candidate #{candidate.candidate_id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {candidate.job}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    candidate.match_score || 0
                                  )
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="font-bold text-purple-600">
                            {candidate.match_score}%
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStageStyle(
                            candidate.stage
                          )}`}
                        >
                          {formatStage(candidate.stage)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <Link
                          to="/company/applicants"
                          className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-pink-50 hover:text-pink-600"
                        >
                          Review
                          <ArrowRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-purple-200 bg-purple-50/20 p-10 text-center">
              <Users
                size={35}
                className="mx-auto text-purple-300"
              />

              <p className="mt-3 font-semibold text-gray-700">
                No candidates yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Applicants will appear here when candidates apply.
              </p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default CompanyDashboard;




