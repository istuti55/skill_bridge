import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Circle,
  Clock,
  ArrowRight,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

import { getCareerPaths } from "../../../services/api";

function LearningRoadmap({ jobId }) {
  const [roadmap, setRoadmap] = useState([]);
  const [learningPath, setLearningPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  console.log("LEARNING ROADMAP JOB ID:", jobId);

  useEffect(() => {
    console.log(
      "LEARNING ROADMAP USEEFFECT STARTED:",
      jobId
    );

    if (!jobId) {
      console.log(
        "LEARNING ROADMAP: NO JOB ID, SKIPPING API"
      );

      setRoadmap([]);
      setLearningPath([]);
      setLoading(false);
      return;
    }

    const loadRoadmap = async () => {
      console.log(
        "LEARNING ROADMAP: STARTING API REQUEST FOR JOB:",
        jobId
      );

      try {
        setLoading(true);
        setError("");

        console.log(
          "LEARNING ROADMAP: CALLING getCareerPaths()"
        );

        const data = await getCareerPaths(jobId);

        console.log("ROADMAP REQUEST COMPLETED");
        console.log("ROADMAP DATA:", data);
        console.log("LEARNING ROADMAP API DATA:", data);

        setRoadmap(
          Array.isArray(data?.roadmap)
            ? data.roadmap
            : []
        );

        setLearningPath(
          Array.isArray(data?.learning_path)
            ? data.learning_path
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load learning roadmap:",
          err
        );

        setError(
          err.message ||
            "Failed to load learning roadmap."
        );
      } finally {
        console.log(
          "LEARNING ROADMAP: API REQUEST FINISHED"
        );

        setLoading(false);
      }
    };

    loadRoadmap();
  }, [jobId]);

  const getResourceLinks = (resources) => {
    if (!Array.isArray(resources)) {
      return [];
    }

    return resources.filter(
      (resource) =>
        typeof resource === "string" &&
        resource.trim()
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.7,
      }}
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
            AI-generated learning path based on your
            current skills and job requirements.
          </p>
        </div>
      </div>

      {/* No Job */}
      {!jobId && (
        <div className="text-center py-10 text-gray-500">
          <p className="font-medium">
            No recommended job available yet.
          </p>

          <p className="text-sm mt-1">
            Your learning roadmap will appear when a
            suitable job match is available.
          </p>
        </div>
      )}

      {/* Loading */}
      {jobId && loading && (
        <div className="text-center py-10 text-gray-500">
          <p className="font-medium">
            Generating your learning roadmap...
          </p>

          <p className="text-sm mt-1">
            AI is analyzing your skills and career gaps.
          </p>
        </div>
      )}

      {/* Error */}
      {jobId && !loading && error && (
        <div
          className="
            bg-red-50
            border
            border-red-200
            text-red-600
            rounded-xl
            p-5
            flex
            items-start
            gap-3
          "
        >
          <AlertCircle
            size={20}
            className="flex-shrink-0 mt-0.5"
          />

          <div>
            <p className="font-semibold">
              Unable to load learning roadmap
            </p>

            <p className="text-sm mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Empty Roadmap */}
      {jobId &&
        !loading &&
        !error &&
        roadmap.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p className="font-medium">
              No learning recommendations available yet.
            </p>

            <p className="text-sm mt-1">
              Complete your profile and resume information
              to generate a personalized roadmap.
            </p>
          </div>
        )}

      {/* Roadmap */}
      {jobId &&
        !loading &&
        !error &&
        roadmap.length > 0 && (
          <div className="space-y-6">
            {roadmap.map((item, index) => {
              const skillName =
                item.skill || "Recommended Skill";

              const duration =
                item.est_weeks !== undefined &&
                item.est_weeks !== null
                  ? `${item.est_weeks} week${
                      Number(item.est_weeks) === 1
                        ? ""
                        : "s"
                    }`
                  : "Not estimated";

              const resources =
                getResourceLinks(item.resources);

              return (
                <motion.div
                  key={`${skillName}-${index}`}
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
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
                  <div className="flex items-start gap-4">
                    {/* Priority Number */}
                    <div
                      className="
                        w-10
                        h-10
                        rounded-full
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                        font-bold
                        bg-blue-100
                        text-blue-600
                      "
                    >
                      {item.priority || index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="
                          flex
                          justify-between
                          items-start
                          gap-4
                          flex-wrap
                        "
                      >
                        <div>
                          <h3
                            className="
                              text-lg
                              font-bold
                              text-gray-800
                            "
                          >
                            {skillName}
                          </h3>

                          <p
                            className="
                              text-gray-500
                              text-sm
                              mt-1
                            "
                          >
                            Recommended skill based on
                            your career growth path.
                          </p>
                        </div>

                        <span
                          className="
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-semibold
                            bg-blue-100
                            text-blue-700
                          "
                        >
                          Priority{" "}
                          {item.priority || index + 1}
                        </span>
                      </div>

                      {/* Duration */}
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-sm
                          text-gray-500
                          mt-4
                        "
                      >
                        <Clock size={16} />

                        Estimated duration: {duration}
                      </div>

                      {/* Resources */}
                      {resources.length > 0 && (
                        <div className="mt-5">
                          <p
                            className="
                              text-sm
                              font-semibold
                              text-gray-700
                              mb-2
                            "
                          >
                            Learning Resources
                          </p>

                          <div
                            className="
                              flex
                              flex-wrap
                              gap-2
                            "
                          >
                            {resources.map(
                              (
                                resource,
                                resourceIndex
                              ) => (
                                <a
                                  key={`${resource}-${resourceIndex}`}
                                  href={resource}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    px-3
                                    py-1.5
                                    rounded-lg
                                    bg-gray-50
                                    border
                                    border-gray-200
                                    text-sm
                                    text-blue-600
                                    hover:bg-blue-50
                                    hover:border-blue-200
                                    transition
                                  "
                                >
                                  Resource{" "}
                                  {resourceIndex + 1}

                                  <ExternalLink
                                    size={14}
                                  />
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action */}
                      <div
                        className="
                          mt-5
                          flex
                          items-center
                          gap-2
                          text-blue-600
                          font-semibold
                          text-sm
                        "
                      >
                        <ArrowRight size={16} />

                        Focus on this skill next
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      {/* AI Learning Recommendation */}
      {jobId &&
        !loading &&
        !error &&
        (roadmap.length > 0 ||
          learningPath.length > 0) && (
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
                className="
                  text-blue-600
                  mt-1
                  flex-shrink-0
                "
              />

              <div className="flex-1">
                <h3
                  className="
                    font-semibold
                    text-gray-800
                  "
                >
                  AI Learning Recommendation
                </h3>

                {learningPath.length > 0 ? (
                  <div
                    className="
                      text-sm
                      text-gray-600
                      mt-3
                      space-y-3
                    "
                  >
                    {learningPath.map(
                      (step, index) => {
                        if (
                          typeof step === "string"
                        ) {
                          return (
                            <p key={index}>
                              {step}
                            </p>
                          );
                        }

                        if (
                          step &&
                          typeof step === "object"
                        ) {
                          return (
                            <div
                              key={index}
                              className="
                                bg-white
                                rounded-lg
                                border
                                border-blue-100
                                p-3
                              "
                            >
                              {step.skill && (
                                <p
                                  className="
                                    font-semibold
                                    text-gray-800
                                  "
                                >
                                  {step.skill}
                                </p>
                              )}

                              {step.priority && (
                                <p
                                  className="
                                    text-xs
                                    text-blue-600
                                    mt-1
                                    capitalize
                                  "
                                >
                                  Priority:{" "}
                                  {step.priority}
                                </p>
                              )}

                              {Array.isArray(
                                step.topics
                              ) &&
                                step.topics.length > 0 && (
                                  <ul
                                    className="
                                      list-disc
                                      list-inside
                                      mt-2
                                      space-y-1
                                    "
                                  >
                                    {step.topics.map(
                                      (
                                        topic,
                                        topicIndex
                                      ) => (
                                        <li
                                          key={
                                            topicIndex
                                          }
                                        >
                                          {topic}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}

                              {!step.skill &&
                                !step.priority &&
                                !step.topics && (
                                  <p>
                                    {JSON.stringify(
                                      step
                                    )}
                                  </p>
                                )}
                            </div>
                          );
                        }

                        return null;
                      }
                    )}
                  </div>
                ) : (
                  <p
                    className="
                      text-sm
                      text-gray-600
                      mt-1
                    "
                  >
                    Focus on the highest-priority
                    skills first, then continue through
                    the remaining recommendations.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
    </motion.div>
  );
}

export default LearningRoadmap;