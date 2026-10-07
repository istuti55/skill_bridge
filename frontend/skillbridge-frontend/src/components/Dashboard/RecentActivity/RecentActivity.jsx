import { useEffect, useState } from "react";
import {
  Upload,
  Calendar,
  Briefcase,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { getMyApplications } from "../../../services/api";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyApplications();

        const applications = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : [];

        const activityItems = [];

        applications.forEach((application) => {
          const jobTitle =
            application.job_title || "Job Application";

          // Real application submission activity
          if (application.applied_date) {
            activityItems.push({
              id: `applied-${application.id}`,
              icon: <Upload size={20} />,
              title: "Application Submitted",
              description: `You applied for ${jobTitle}.`,
              date: application.applied_date,
              color: "bg-blue-100 text-blue-600",
            });
          }

          // Real scheduled interview activity
          if (
            application.recruitment_stage ===
              "interview_scheduled" &&
            application.interview_date
          ) {
            activityItems.push({
              id: `interview-${application.id}`,
              icon: <Calendar size={20} />,
              title: "Interview Scheduled",
              description: `An interview was scheduled for ${jobTitle}.`,
              date: application.interview_date,
              color: "bg-orange-100 text-orange-600",
            });
          }

          // Current application status
          if (
            application.recruitment_stage &&
            application.recruitment_stage !== "applied"
          ) {
            let icon = <Clock3 size={20} />;
            let color = "bg-purple-100 text-purple-600";

            if (application.recruitment_stage === "shortlisted") {
              icon = <CheckCircle2 size={20} />;
              color = "bg-green-100 text-green-600";
            }

            if (application.recruitment_stage === "hired") {
              icon = <CheckCircle2 size={20} />;
              color = "bg-emerald-100 text-emerald-600";
            }

            if (application.recruitment_stage === "rejected") {
              icon = <XCircle size={20} />;
              color = "bg-red-100 text-red-600";
            }

            activityItems.push({
              id: `status-${application.id}`,
              icon,
              title: "Application Status",
              description: `${jobTitle}: ${formatStage(
                application.recruitment_stage
              )}.`,
              date: application.applied_date,
              color,
            });
          }
        });

        activityItems.sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        );

        setActivities(activityItems.slice(0, 6));
      } catch (err) {
        console.error(
          "Failed to load recent activity:",
          err
        );

        setError(
          err.message ||
            "Failed to load recent activity."
        );
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const formatStage = (stage) => {
    const labels = {
      applied: "Applied",
      shortlisted: "Shortlisted",
      interview_scheduled: "Interview Scheduled",
      offer_extended: "Offer Extended",
      hired: "Hired",
      rejected: "Rejected",
    };

    return (
      labels[stage] ||
      stage
        ?.replaceAll("_", " ")
        ?.replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        ) ||
      "Unknown"
    );
  };

  const formatTime = (dateValue) => {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
            <Briefcase
              size={22}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Recent Activity
            </h2>

            <p className="text-gray-500 mt-1">
              Keep track of your latest career updates.
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-gray-500 py-8 text-center">
          Loading recent activity...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading &&
        !error &&
        activities.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p className="font-medium">
              No recent activity yet.
            </p>

            <p className="text-sm mt-1">
              Your application activity will appear here.
            </p>
          </div>
        )}

      {/* Activities */}
      {!loading &&
        !error &&
        activities.length > 0 && (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="
                  flex items-start gap-5
                  pb-5
                  border-b
                  last:border-none
                  hover:bg-gray-50
                  rounded-xl
                  transition
                  p-3
                "
              >
                <div
                  className={`
                    w-12
                    h-12
                    rounded-full
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                    ${activity.color}
                  `}
                >
                  {activity.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800">
                    {activity.title}
                  </h3>

                  <p className="text-gray-500 mt-1">
                    {activity.description}
                  </p>
                </div>

                <span className="text-sm text-gray-400 whitespace-nowrap">
                  {formatTime(activity.date)}
                </span>
              </div>
            ))}
          </div>
        )}

    </div>
  );
}

export default RecentActivity;