import {
  Upload,
  Brain,
  Briefcase,
  Calendar,
  TrendingUp,
} from "lucide-react";

function RecentActivity() {
  const activities = [
    {
      icon: <Upload size={20} />,
      title: "Resume Uploaded",
      description: "Your latest resume was uploaded successfully.",
      time: "2 minutes ago",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <Brain size={20} />,
      title: "AI Analysis Completed",
      description: "AI evaluated your resume and generated insights.",
      time: "1 minute ago",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: <Briefcase size={20} />,
      title: "24 Jobs Matched",
      description: "New jobs matching your profile are available.",
      time: "Today",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <Calendar size={20} />,
      title: "Interview Scheduled",
      description: "Google scheduled an interview for tomorrow.",
      time: "Yesterday",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: <TrendingUp size={20} />,
      title: "Profile Strength Increased",
      description: "Your profile score improved after AI analysis.",
      time: "Yesterday",
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          🕒 Recent Activity
        </h2>

        <p className="text-gray-500 mt-2">
          Keep track of your latest career updates.
        </p>
      </div>

      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-5 pb-5 border-b last:border-none hover:bg-gray-50 rounded-xl transition p-3"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${activity.color}`}
            >
              {activity.icon}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">
                {activity.title}
              </h3>

              <p className="text-gray-500 mt-1">
                {activity.description}
              </p>
            </div>

            <span className="text-sm text-gray-400 whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;