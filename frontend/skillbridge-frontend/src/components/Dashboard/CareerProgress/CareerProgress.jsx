import { useEffect, useState } from "react";
import { Target, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { getSkillGaps } from "../../../services/api";

function CareerProgress({ jobId }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) {
      setSkills([]);
      setLoading(false);
      return;
    }

    const loadSkills = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getSkillGaps(jobId);

        let skillData = [];

        if (Array.isArray(data)) {
          skillData = data;
        } else if (Array.isArray(data.results)) {
          skillData = data.results;
        } else if (Array.isArray(data.skills)) {
          skillData = data.skills;
        } else if (Array.isArray(data.skill_gaps)) {
          skillData = data.skill_gaps;
        }

        setSkills(skillData);
      } catch (err) {
        setError(
          err.message || "Failed to load career skill status."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, [jobId]);

  const getStatusConfig = (status) => {
    const normalized = status?.toLowerCase();

    if (normalized === "strong") {
      return {
        label: "Strong",
        text: "text-green-600",
        badge: "bg-green-100 text-green-700",
        bar: "bg-green-500",
        width: "100%",
        icon: <CheckCircle2 size={17} />,
      };
    }

    if (normalized === "weak") {
      return {
        label: "Weak",
        text: "text-orange-600",
        badge: "bg-orange-100 text-orange-700",
        bar: "bg-orange-500",
        width: "50%",
        icon: <TrendingUp size={17} />,
      };
    }

    return {
      label: "Missing",
      text: "text-red-600",
      badge: "bg-red-100 text-red-700",
      bar: "bg-red-500",
      width: "15%",
      icon: <AlertCircle size={17} />,
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-10">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
            <Target size={22} className="text-blue-600" />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Career Skill Status
            </h2>

            <p className="text-gray-500 mt-1">
              Your current skills compared with the selected job.
            </p>
          </div>
        </div>
      </div>

      {!jobId && (
        <div className="text-center py-8 text-gray-500">
          <p className="font-medium">
            No recommended job available yet.
          </p>
          <p className="text-sm mt-1">
            Your career skill status will appear when a job match is available.
          </p>
        </div>
      )}

      {loading && (
        <div className="text-gray-500 py-6">
          Loading career skill status...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        jobId &&
        skills.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No skill status data available for this job.
          </div>
        )}

      {!loading && !error && skills.length > 0 && (
        <div className="space-y-6">
          {skills.map((skill, index) => {
            const name =
              skill.skill_name ||
              skill.name ||
              skill.skill ||
              "Unknown Skill";

            const config = getStatusConfig(skill.status);

            return (
              <div key={`${name}-${index}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">
                    {name}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}
                  >
                    {config.icon}
                    {config.label}
                  </span>
                </div>

                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${config.bar}`}
                    style={{ width: config.width }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CareerProgress;
