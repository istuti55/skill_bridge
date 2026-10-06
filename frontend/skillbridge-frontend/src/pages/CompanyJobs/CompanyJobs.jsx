import { useEffect, useState } from "react";
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  closeJob,
} from "../../services/api";

function CompanyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    job_type: "full_time",
    required_skills: "",
  });

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getJobs();

      // Backend normally returns an array.
      // This also handles paginated responses.
      const jobList = Array.isArray(data)
        ? data
        : data.results || [];

      setJobs(jobList);
    } catch (err) {
      console.error("Company jobs error:", err);
      setError(err.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      location: "",
      salary: "",
      job_type: "full_time",
      required_skills: "",
    });

    setEditingJob(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    resetForm();
    setMessage("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (job) => {
    setEditingJob(job);
    setMessage("");
    setError("");

    setForm({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      salary: job.salary || "",
      job_type: job.job_type || "full_time",
      required_skills: Array.isArray(job.required_skills)
        ? job.required_skills.join(", ")
        : job.required_skills || "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        salary: form.salary,
        job_type: form.job_type,
        required_skills: form.required_skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      if (!payload.title || !payload.description) {
        setError("Job title and description are required.");
        return;
      }

      if (editingJob) {
        await updateJob(editingJob.id, payload);
        setMessage("Job updated successfully.");
      } else {
        await createJob(payload);
        setMessage(
          "Job created successfully. It may require admin approval."
        );
      }

      resetForm();
      setShowForm(false);
      await loadJobs();
    } catch (err) {
      console.error("Save job error:", err);
      setError(err.message || "Failed to save job.");
    }
  };

  const handleDelete = async (job) => {
    const confirmed = window.confirm(
      `Delete "${job.title}"?\n\nThe backend will reject deletion if this job already has applications.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteJob(job.id);

      setMessage("Job deleted successfully.");
      await loadJobs();
    } catch (err) {
      console.error("Delete job error:", err);
      setError(err.message || "Failed to delete job.");
    }
  };

  const handleClose = async (job) => {
    const confirmed = window.confirm(
      `Close "${job.title}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await closeJob(job.id);

      setMessage("Job closed successfully.");
      await loadJobs();
    } catch (err) {
      console.error("Close job error:", err);
      setError(err.message || "Failed to close job.");
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "closed":
        return "bg-gray-200 text-gray-700";
      case "open":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Company Jobs
        </h1>
        <p className="mt-4 text-gray-600">
          Loading your jobs...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Company Jobs
          </h1>
          <p className="mt-2 text-gray-600">
            Create, manage, and close your job postings.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          + Create Job
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingJob ? "Edit Job" : "Create New Job"}
            </h2>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Python Developer"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Kathmandu / Remote"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Salary */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Salary
                </label>
                <input
                  type="text"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="e.g. NPR 50,000 - 80,000"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Job Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Job Type
                </label>
                <select
                  name="job_type"
                  value={form.job_type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              {/* Skills */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Required Skills
                </label>
                <input
                  type="text"
                  name="required_skills"
                  value={form.required_skills}
                  onChange={handleChange}
                  placeholder="Python, Django, PostgreSQL, Git"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separate skills with commas.
                </p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
              >
                {editingJob ? "Update Job" : "Create Job"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs */}
      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Your Job Postings
          </h2>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
            {jobs.length} job{jobs.length === 1 ? "" : "s"}
          </span>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              No jobs yet
            </h3>
            <p className="mt-2 text-gray-500">
              Create your first job posting to start receiving candidates.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-gray-200 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {job.title}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                          job.status
                        )}`}
                      >
                        {job.status || "unknown"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                      {job.location && (
                        <span>📍 {job.location}</span>
                      )}

                      {job.job_type && (
                        <span>
                          💼{" "}
                          {String(job.job_type).replaceAll(
                            "_",
                            " "
                          )}
                        </span>
                      )}

                      {job.salary && (
                        <span>💰 {job.salary}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(job)}
                      disabled={job.status === "closed"}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    {job.status !== "closed" && (
                      <button
                        type="button"
                        onClick={() => handleClose(job)}
                        className="rounded-lg border border-orange-300 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50"
                      >
                        Close
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(job)}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {job.description && (
                  <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-600">
                    {job.description}
                  </p>
                )}

                {job.required_skills && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Required Skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(job.required_skills)
                        ? job.required_skills
                        : String(job.required_skills)
                            .split(",")
                            .map((skill) => skill.trim())
                            .filter(Boolean)
                      ).map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-5 border-t border-gray-100 pt-4 text-sm text-gray-500">
                  <span>
                    Applicants:{" "}
                    <strong className="text-gray-700">
                      {job.applicants ?? 0}
                    </strong>
                  </span>

                  {job.avg_match_score !== undefined && (
                    <span>
                      Average Match:{" "}
                      <strong className="text-blue-600">
                        {job.avg_match_score}%
                      </strong>
                    </span>
                  )}

                  {job.posted_date && (
                    <span>
                      Posted:{" "}
                      {new Date(job.posted_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyJobs;