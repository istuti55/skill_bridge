import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  Check,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getAdminCandidates,
  getAdminCompanies,
  getAdminJobs,
  getAdminStats,
  getAdminUsers,
  getStoredUser,
  logoutUser,
  reviewJob,
  setCompanyApproved,
  setUserActive,
} from "../../services/api";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "jobs", label: "Job approvals", icon: Briefcase },
  { id: "companies", label: "Companies", icon: Building2 },
  { id: "candidates", label: "Candidates", icon: UserCheck },
  { id: "users", label: "Users", icon: Users },
];

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  closed: "bg-gray-100 text-gray-600",
};

const STAGE_LABELS = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview scheduled",
  offer_extended: "Offer extended",
  hired: "Hired",
  rejected: "Rejected",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";

function Badge({ value }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
        STATUS_STYLES[value] || "bg-gray-100 text-gray-600"
      }`}
    >
      {value}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon size={20} className="text-blue-600" />
        </div>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-3">{value ?? 0}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function EmptyState({ children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500">
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

// ---------------------------------------------------------------
// Overview
// ---------------------------------------------------------------

function Overview({ stats, onGo }) {
  if (!stats) return <Spinner />;

  const stages = Object.entries(stats.applications.by_stage || {});
  const maxStage = Math.max(1, ...stages.map(([, n]) => n));

  return (
    <div className="space-y-6">
      {(stats.jobs.pending > 0 || stats.companies.pending > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <p className="text-amber-800 font-medium flex-1 min-w-[200px]">
            Waiting for your review:{" "}
            {stats.jobs.pending > 0 &&
              `${stats.jobs.pending} job${stats.jobs.pending > 1 ? "s" : ""}`}
            {stats.jobs.pending > 0 && stats.companies.pending > 0 && " and "}
            {stats.companies.pending > 0 &&
              `${stats.companies.pending} compan${
                stats.companies.pending > 1 ? "ies" : "y"
              }`}
          </p>
          {stats.jobs.pending > 0 && (
            <button
              onClick={() => onGo("jobs")}
              className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition"
            >
              Review jobs
            </button>
          )}
          {stats.companies.pending > 0 && (
            <button
              onClick={() => onGo("companies")}
              className="px-4 py-2 rounded-lg bg-white text-amber-700 border border-amber-300 text-sm font-medium hover:bg-amber-100 transition"
            >
              Review companies
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total users"
          value={stats.users.total}
          hint={`${stats.users.candidates} candidates, ${stats.users.companies} companies`}
        />
        <StatCard
          icon={Building2}
          label="Approved companies"
          value={stats.companies.approved}
          hint={`${stats.companies.pending} waiting`}
        />
        <StatCard
          icon={Briefcase}
          label="Live jobs"
          value={stats.jobs.approved}
          hint={`${stats.jobs.pending} pending, ${stats.jobs.rejected} rejected`}
        />
        <StatCard
          icon={FileText}
          label="Applications"
          value={stats.applications.total}
        />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">
          Applications by recruitment stage
        </h3>
        {stages.length === 0 ? (
          <p className="text-gray-500 text-sm">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {stages.map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="w-40 text-sm text-gray-600 shrink-0">
                  {STAGE_LABELS[stage] || stage}
                </span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(count / maxStage) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-medium text-gray-800">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Job approvals
// ---------------------------------------------------------------

function JobsPanel({ jobs, loading, onReview, busyId }) {
  const [filter, setFilter] = useState("pending");

  const visible = useMemo(
    () => (filter === "all" ? jobs : jobs.filter((j) => j.status === filter)),
    [jobs, filter]
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "closed", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-blue-50"
            }`}
          >
            {f}
            {f !== "all" && (
              <span className="ml-1.5 opacity-70">
                {jobs.filter((j) => j.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState>
          {filter === "pending"
            ? "No jobs are waiting for approval."
            : `No ${filter} jobs.`}
        </EmptyState>
      ) : (
        visible.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {job.company_name}
                  {job.location && ` · ${job.location}`}
                  {job.job_type_display && ` · ${job.job_type_display}`}
                  {` · Posted ${formatDate(job.posted_date)}`}
                </p>
              </div>
              <Badge value={job.status} />
            </div>

            {job.description && (
              <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                {job.description}
              </p>
            )}

            {Array.isArray(job.required_skills) &&
              job.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.required_skills.map((skill, i) => {
                    const name =
                      typeof skill === "string" ? skill : skill?.name || "";
                    return name ? (
                      <span
                        key={`${name}-${i}`}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium"
                      >
                        {name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

            {(job.status === "pending" ||
              job.status === "rejected" ||
              job.status === "approved") && (
              <div className="flex flex-wrap gap-2 mt-4">
                {job.status !== "approved" && (
                  <button
                    disabled={busyId === job.id}
                    onClick={() => onReview(job, "approved")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    <Check size={16} /> Approve and run matching
                  </button>
                )}
                {job.status !== "rejected" && (
                  <button
                    disabled={busyId === job.id}
                    onClick={() => onReview(job, "rejected")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition"
                  >
                    <X size={16} /> Reject
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Companies
// ---------------------------------------------------------------

function CompaniesPanel({ companies, loading, onToggle, busyId }) {
  if (loading) return <Spinner />;
  if (companies.length === 0) {
    return <EmptyState>No companies have registered yet.</EmptyState>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="px-5 py-3 font-medium">Company</th>
            <th className="px-5 py-3 font-medium">Industry</th>
            <th className="px-5 py-3 font-medium">Email</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.id} className="border-b border-gray-50 last:border-0">
              <td className="px-5 py-4 font-medium text-gray-900">
                {c.company_name}
              </td>
              <td className="px-5 py-4 text-gray-600">{c.industry || "-"}</td>
              <td className="px-5 py-4 text-gray-600">{c.email}</td>
              <td className="px-5 py-4">
                <Badge value={c.approved ? "approved" : "pending"} />
              </td>
              <td className="px-5 py-4 text-right">
                <button
                  disabled={busyId === c.id}
                  onClick={() => onToggle(c)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition ${
                    c.approved
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {c.approved ? "Remove approval" : "Approve company"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// ---------------------------------------------------------------
// Candidates
// ---------------------------------------------------------------

function CandidatesPanel() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminCandidates({ q: search })
      .then((d) => !cancelled && setCandidates(Array.isArray(d) ? d : []))
      .catch((e) => !cancelled && toast.error(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates by name or email"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {!loading && (
          <span className="text-sm text-gray-500">
            {candidates.length} candidate{candidates.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : candidates.length === 0 ? (
        <EmptyState>No candidates found.</EmptyState>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Candidate</th>
                <th className="px-5 py-3 font-medium">CV</th>
                <th className="px-5 py-3 font-medium">Skills</th>
                <th className="px-5 py-3 font-medium">Experience</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Applications</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Account</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 align-top">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {c.name}
                    <span className="block text-xs text-gray-400 font-normal">
                      {c.email}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {c.has_cv ? "Uploaded" : "Not uploaded"}
                  </td>
                  <td className="px-5 py-4 max-w-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {c.skills.slice(0, 5).map((s, i) => (
                        <span
                          key={`${s}-${i}`}
                          className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs"
                        >
                          {s}
                        </span>
                      ))}
                      {c.skills.length > 5 && (
                        <span className="text-xs text-gray-400">
                          +{c.skills.length - 5}
                        </span>
                      )}
                      {c.skills.length === 0 && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {c.experience_years} yrs
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {c.resume_score ?? "-"}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {c.applications_count}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {formatDate(c.date_joined)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge value={c.is_active ? "approved" : "closed"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Users
// ---------------------------------------------------------------

function UsersPanel({ onChanged }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminUsers({ role, q: search })
      .then((data) => !cancelled && setUsers(Array.isArray(data) ? data : []))
      .catch((e) => !cancelled && toast.error(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [role, search]);

  const toggle = async (user) => {
    setBusyId(user.id);
    try {
      const updated = await setUserActive(user.id, !user.is_active);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: updated.is_active } : u
        )
      );
      toast.success(
        updated.is_active ? "Account activated" : "Account deactivated"
      );
      onChanged();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All roles</option>
          <option value="candidate">Candidates</option>
          <option value="company">Companies</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <EmptyState>No users match your search.</EmptyState>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Account</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {u.name}
                    {u.company_name && u.company_name !== u.name && (
                      <span className="block text-xs text-gray-400 font-normal">
                        {u.company_name}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{u.email}</td>
                  <td className="px-5 py-4 capitalize text-gray-600">
                    {u.role}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {formatDate(u.date_joined)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge value={u.is_active ? "approved" : "closed"} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    {u.role === "admin" ? (
                      <span className="text-xs text-gray-400">Protected</span>
                    ) : (
                      <button
                        disabled={busyId === u.id}
                        onClick={() => toggle(u)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition ${
                          u.is_active
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {u.is_active ? (
                          <>
                            <UserX size={16} /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck size={16} /> Activate
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Page
// ---------------------------------------------------------------

function AdminDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [tab, setTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [busyJob, setBusyJob] = useState(null);
  const [busyCompany, setBusyCompany] = useState(null);

  const [loadError, setLoadError] = useState("");

  const loadAll = useCallback(async () => {
    setLoadingLists(true);
    setLoadError("");
    // Each request is independent: one failing must not blank the others
    const [s, j, c] = await Promise.allSettled([
      getAdminStats(),
      getAdminJobs(),
      getAdminCompanies(),
    ]);

    const errors = [];
    if (s.status === "fulfilled") setStats(s.value);
    else errors.push(`Stats: ${s.reason?.message}`);

    if (j.status === "fulfilled") {
      setJobs(Array.isArray(j.value) ? j.value : j.value?.results || []);
    } else errors.push(`Jobs: ${j.reason?.message}`);

    if (c.status === "fulfilled") {
      setCompanies(Array.isArray(c.value) ? c.value : c.value?.results || []);
    } else errors.push(`Companies: ${c.reason?.message}`);

    if (errors.length) {
      setLoadError(errors.join("  |  "));
      console.error("Admin load errors:", errors);
    }
    setLoadingLists(false);
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await getAdminStats());
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleReviewJob = async (job, status) => {
    setBusyJob(job.id);
    try {
      const result = await reviewJob(job.id, status);
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: result.status } : j))
      );
      toast.success(
        status === "approved"
          ? `Job approved. ${result.candidates_matched ?? 0} candidates matched.`
          : "Job rejected"
      );
      refreshStats();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyJob(null);
    }
  };

  const handleToggleCompany = async (company) => {
    setBusyCompany(company.id);
    try {
      const result = await setCompanyApproved(company.id, !company.approved);
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === company.id ? { ...c, approved: result.approved } : c
        )
      );
      toast.success(
        result.approved ? "Company approved" : "Company approval removed"
      );
      refreshStats();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyCompany(null);
    }
  };

  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  const pendingJobs = jobs.filter((j) => j.status === "pending").length;
  const pendingCompanies = companies.filter((c) => !c.approved).length;
  const badgeFor = { jobs: pendingJobs, companies: pendingCompanies };

  const goTo = (id) => {
    setTab(id);
    setMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 w-64 h-screen bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">SkillBridge</h1>
            <p className="text-gray-500 text-sm mt-1">Admin panel</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => goTo(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 font-medium transition-all duration-200 ${
                tab === id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <Icon size={20} />
              <span className="flex-1 text-left">{label}</span>
              {badgeFor[id] > 0 && (
                <span
                  className={`min-w-6 h-6 px-1.5 rounded-full text-xs flex items-center justify-center ${
                    tab === id
                      ? "bg-white text-blue-600"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {badgeFor[id]}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-medium hover:bg-red-100 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {TABS.find((t) => t.id === tab)?.label}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              loadAll();
              toast.success("Refreshed");
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {loadError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
              <p className="font-medium">Some admin data could not be loaded.</p>
              <p className="mt-1 break-words">{loadError}</p>
            </div>
          )}
          {tab === "overview" && <Overview stats={stats} onGo={goTo} />}
          {tab === "jobs" && (
            <JobsPanel
              jobs={jobs}
              loading={loadingLists}
              onReview={handleReviewJob}
              busyId={busyJob}
            />
          )}
          {tab === "companies" && (
            <CompaniesPanel
              companies={companies}
              loading={loadingLists}
              onToggle={handleToggleCompany}
              busyId={busyCompany}
            />
          )}
          {tab === "candidates" && <CandidatesPanel />}
          {tab === "users" && <UsersPanel onChanged={refreshStats} />}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
