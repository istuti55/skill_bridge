function JobCard({
  job,
  onApply,
  onViewDetails,
  applying = false,
}) {
  const {
    id,
    title,
    description,
    required_skills = [],
    location,
    salary_range,
    job_type_display,
    job_type,
    match_score,
    has_applied,
  } = job;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {title}
          </h3>

          {location && (
            <p className="mt-1 text-sm text-gray-500">
              📍 {location}
            </p>
          )}
        </div>

        {match_score !== null &&
          match_score !== undefined && (
            <div className="rounded-lg bg-blue-50 px-4 py-2 text-center">
              <p className="text-xs text-gray-500">
                Match
              </p>

              <p className="text-lg font-bold text-blue-600">
                {match_score}%
              </p>
            </div>
          )}
      </div>

      {/* Job information */}
      <div className="mt-4 flex flex-wrap gap-2">
        {job_type_display || job_type ? (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {job_type_display || job_type}
          </span>
        ) : null}

        {salary_range && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            {salary_range}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="mt-4 text-sm leading-6 text-gray-600">
          {description}
        </p>
      )}

      {/* Required skills */}
      {required_skills.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Required Skills
          </p>

          <div className="flex flex-wrap gap-2">
            {required_skills.map((skill, index) => (
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

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(id)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            View Details
          </button>
        )}

        {has_applied ? (
          <button
            type="button"
            disabled
            className="rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
          >
            Applied
          </button>
        ) : onApply ? (
          <button
            type="button"
            onClick={() => onApply(id)}
            disabled={applying}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {applying ? "Applying..." : "Apply Now"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default JobCard;