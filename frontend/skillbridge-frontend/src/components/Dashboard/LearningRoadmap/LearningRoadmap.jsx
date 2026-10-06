import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
} from "lucide-react";

function LearningRoadmap() {
  const roadmap = [
    {
      title: "Master Node.js",
      description:
        "Learn backend development, REST APIs, Express.js, and authentication.",
      duration: "2 weeks",
      status: "In Progress",
      progress: 60,
    },
    {
      title: "Learn System Design",
      description:
        "Understand scalability, databases, caching, APIs, and system architecture.",
      duration: "3 weeks",
      status: "Not Started",
      progress: 0,
    },
    {
      title: "Advanced React",
      description:
        "Improve your knowledge of performance, hooks, state management, and architecture.",
      duration: "2 weeks",
      status: "Completed",
      progress: 100,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7 }}
      className="
        mt-8
        bg-white
        rounded-2xl
        border
        border-gray-100
        shadow-sm
        p-6
        md:p-8
      "
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div
          className="
            w-12
            h-12
            rounded-xl
            bg-blue-100
            flex
            items-center
            justify-center
            flex-shrink-0
          "
        >
          <BookOpen
            size={25}
            className="text-blue-600"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Learning Roadmap
          </h2>

          <p className="text-gray-500 mt-1">
            AI-generated learning path based on your skill gaps.
          </p>
        </div>
      </div>

      {/* Roadmap */}
      <div className="space-y-6">
        {roadmap.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
            }}
            className="
              relative
              border
              border-gray-100
              rounded-2xl
              p-6
              hover:shadow-md
              transition-all
              duration-300
            "
          >
            {/* Step Number */}
            <div className="flex items-start gap-4">
              <div
                className={`
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                  font-bold
                  ${
                    item.status === "Completed"
                      ? "bg-green-100 text-green-600"
                      : item.status === "In Progress"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-500"
                  }
                `}
              >
                {item.status === "Completed" ? (
                  <CheckCircle2 size={22} />
                ) : (
                  index + 1
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {item.title}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      {item.description}
                    </p>
                  </div>

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      ${
                        item.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                  <Clock size={16} />
                  Estimated duration: {item.duration}
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Progress</span>
                    <span>{item.progress}%</span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{
                        width: `${item.progress}%`,
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.1,
                      }}
                      className={`
                        h-full
                        rounded-full
                        ${
                          item.status === "Completed"
                            ? "bg-green-500"
                            : "bg-blue-600"
                        }
                      `}
                    />
                  </div>
                </div>

                {/* Action */}
                {item.status !== "Completed" && (
                  <button
                    type="button"
                    className="
                      mt-5
                      flex
                      items-center
                      gap-2
                      text-blue-600
                      hover:text-blue-700
                      font-semibold
                      text-sm
                    "
                  >
                    Start Learning
                    <ArrowRight size={16} />
                  </button>
                )}

                {item.status === "Completed" && (
                  <div className="
                    mt-5
                    flex
                    items-center
                    gap-2
                    text-green-600
                    font-semibold
                    text-sm
                  ">
                    <CheckCircle2 size={16} />
                    Skill completed
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="
          mt-8
          bg-blue-50
          border
          border-blue-100
          rounded-xl
          p-5
        "
      >
        <div className="flex items-start gap-3">
          <Circle
            size={18}
            className="text-blue-600 mt-1"
          />

          <div>
            <h3 className="font-semibold text-gray-800">
              AI Learning Recommendation
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              Complete Node.js and System Design first.
              These skills currently have the largest gaps in your profile.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default LearningRoadmap;