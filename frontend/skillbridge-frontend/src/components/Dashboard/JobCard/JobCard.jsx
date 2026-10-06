import { MapPin, DollarSign, Briefcase, CheckCircle } from "lucide-react";

function JobCard({
  company,
  title,
  location,
  salary,
  type,
  match,
  description,
  requiredSkills,
  jobId,
  isApplied = false,
  onApply,
  applying = false,
}) {
  return (
    <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-xl font-bold text-black">
            {title}
          </h3>

          <p className="text-gray-600 mt-1">
            {company}
          </p>
        </div>

        {match !== null && match !== undefined && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
            {match}% Match
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <MapPin size={16} />
          {location}
        </div>

        <div className="flex items-center gap-1">
          <DollarSign size={16} />
          {salary}
        </div>

        <div className="flex items-center gap-1">
          <Briefcase size={16} />
          {type}
        </div>
      </div>

      {description && (
        <p className="text-gray-600 text-sm mt-5 line-clamp-3">
          {description}
        </p>
      )}

      {requiredSkills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {requiredSkills.map((skill, index) => (
            <span
              key={index}
              className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6">
        {isApplied ? (
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <CheckCircle size={19} />
            Applied
          </div>
        ) : (
          <button
            onClick={() => onApply(jobId)}
            disabled={applying}
            className="w-full bg-purple-600 hover:bg-pink-600 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {applying ? "Applying..." : "Apply Now"}
          </button>
        )}
      </div>
    </div>
  );
}

export default JobCard;