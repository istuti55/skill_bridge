import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  BriefcaseBusiness,
} from "lucide-react";

import { getMyApplications } from "../../../services/api";

function UpcomingInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyApplications();

        const applications = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : [];

        const scheduledInterviews = applications
          .filter(
            (application) =>
              application.recruitment_stage ===
              "interview_scheduled"
          )
          .filter((application) => application.interview_date)
          .sort(
            (a, b) =>
              new Date(a.interview_date) -
              new Date(b.interview_date)
          );

        setInterviews(scheduledInterviews);
      } catch (err) {
        console.error(
          "Failed to load upcoming interviews:",
          err
        );

        setError(
          err.message ||
            "Failed to load upcoming interviews."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInterviews();
  }, []);

  const formatDate = (dateValue) => {
    const date = new Date(dateValue);

    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    const date = new Date(dateValue);

    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
            <Calendar
              size={22}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Upcoming Interviews
            </h2>

            <p className="text-gray-500 mt-1">
              Stay prepared for your scheduled interviews.
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-gray-500 py-8 text-center">
          Loading upcoming interviews...
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
        interviews.length === 0 && (
          <div className="text-center py-10">
            <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar
                size={26}
                className="text-gray-400"
              />
            </div>

            <p className="font-semibold text-gray-700 mt-4">
              No upcoming interviews
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Scheduled interviews will appear here once a company
              moves your application to the interview stage.
            </p>
          </div>
        )}

      {/* Real Interviews */}
      {!loading &&
        !error &&
        interviews.length > 0 && (
          <div className="space-y-6">
            {interviews.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-start flex-wrap gap-4">

                  {/* Interview Information */}
                  <div>
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness
                        size={19}
                        className="text-blue-600"
                      />

                      <h3 className="text-xl font-bold text-gray-800">
                        {item.job_title || "Interview"}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-5 mt-5 text-gray-600">

                      <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        {formatDate(item.interview_date)}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={18} />
                        {formatTime(item.interview_date)}
                      </div>

                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-right">
                    <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                      Interview Scheduled
                    </span>

                    <div className="mt-4 flex items-center justify-end gap-2 text-gray-500 text-sm">
                      <Video size={17} />
                      Interview details will be provided by the company.
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

    </div>
  );
}

export default UpcomingInterviews;