import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ArrowRight,
} from "lucide-react";

function UpcomingInterviews() {
  const interviews = [
    {
      company: "Google",
      position: "Frontend Developer",
      date: "Tomorrow",
      time: "10:00 AM",
      mode: "Google Meet",
      status: "Upcoming",
      countdown: "23 Hours",
    },
    {
      company: "Leapfrog",
      position: "React Developer",
      date: "Friday",
      time: "2:30 PM",
      mode: "Office Interview",
      status: "Confirmed",
      countdown: "",
    },
    {
      company: "Cotiviti",
      position: "UI Engineer",
      date: "Monday",
      time: "11:30 AM",
      mode: "Zoom Meeting",
      status: "Upcoming",
      countdown: "4 Days",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          📅 Upcoming Interviews
        </h2>

        <p className="text-gray-500 mt-2">
          Stay prepared for your scheduled interviews.
        </p>
      </div>

      <div className="space-y-6">
        {interviews.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start flex-wrap gap-4">
              {/* Left Side */}
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {item.company}
                </h3>

                <p className="text-blue-600 font-medium mt-1">
                  {item.position}
                </p>

                <div className="flex flex-wrap gap-5 mt-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    {item.date}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    {item.time}
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    {item.mode}
                  </div>
                </div>

                {/* Countdown Badge */}
                {item.status === "Upcoming" && (
                  <div className="mt-5">
                    <div
                      className="
                        inline-flex
                        items-center
                        gap-2
                        px-4
                        py-2
                        rounded-full
                        bg-gradient-to-r
                        from-blue-500
                        to-indigo-600
                        text-white
                        text-sm
                        font-semibold
                        shadow-md
                        animate-pulse
                      "
                    >
                      ⏳ Starts in {item.countdown}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side */}
              <div className="text-right">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    item.status === "Confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.status}
                </span>

                <button
                  className="
                    mt-4
                    flex
                    items-center
                    gap-2
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    px-5
                    py-2
                    rounded-xl
                    transition
                  "
                >
                  <Video size={18} />
                  Join Meeting
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingInterviews;