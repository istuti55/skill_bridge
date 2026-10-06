import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

import { getSkillGaps } from "../../../services/api";

function SkillGapAnalysis({ jobId }) {
  console.log("SKILL GAP COMPONENT RENDERED");

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("SKILL GAP USEEFFECT STARTED");
    console.log("SKILL GAP JOB ID:", jobId);

    if (!jobId) {
      console.log("NO JOB ID YET - SKIPPING SKILL GAP API");
      setLoading(false);
      return;
    }

    const loadSkillGaps = async () => {
      console.log("CALLING GET SKILL GAPS API");

      setLoading(true);
      setError("");

      try {
        const data = await getSkillGaps(jobId);

        console.log(
          "SKILL GAP DATA:",
          JSON.stringify(data, null, 2)
        );

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

        console.log(
          "PROCESSED SKILL GAP DATA:",
          JSON.stringify(skillData, null, 2)
        );

        setSkills(skillData);
      } catch (err) {
        console.error("SKILL GAP API ERROR:", err);

        setError(
          err.message ||
            "Failed to load skill gap data."
        );
      } finally {
        console.log("SKILL GAP API FINISHED");
        setLoading(false);
      }
    };

    loadSkillGaps();
  }, [jobId]);

  const getStatusText = (status) => {
    if (!status) return "Needs Improvement";

    if (status.toLowerCase() === "missing") {
      return "Missing";
    }

    if (status.toLowerCase() === "weak") {
      return "Weak";
    }

    if (status.toLowerCase() === "strong") {
      return "Strong";
    }

    return status;
  };

  const getStatusColor = (status) => {
    const normalizedStatus =
      status?.toLowerCase();

    if (normalizedStatus === "strong") {
      return "text-green-600 bg-green-50";
    }

    if (normalizedStatus === "weak") {
      return "text-orange-600 bg-orange-50";
    }

    if (normalizedStatus === "missing") {
      return "text-red-600 bg-red-50";
    }

    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">

        <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
          <Target
            size={24}
            className="text-blue-600"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Skill Gap Analysis
          </h2>

          <p className="text-sm text-gray-500">
            Compare your current skills with job requirements.
          </p>
        </div>

      </div>

      {/* Loading */}
      {loading && (
        <div className="text-gray-500 py-6">
          Loading skill gap analysis...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">

          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle size={18} />
            Failed to load skill gap analysis
          </div>

          <p className="text-sm mt-1">
            {error}
          </p>

        </div>
      )}

      {/* No Data */}
      {!loading &&
        !error &&
        skills.length === 0 && (
          <div className="bg-gray-50 rounded-xl p-6 text-center">

            <BookOpen
              size={35}
              className="mx-auto text-gray-400 mb-3"
            />

            <h3 className="font-semibold text-gray-700">
              No skill gap data available
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Upload and analyze your CV to generate skill gap insights.
            </p>

          </div>
        )}

      {/* Skill Data */}
      {!loading &&
        !error &&
        skills.length > 0 && (
          <div className="space-y-5">

            {skills.map((skill, index) => {

              const name =
                skill.skill_name ||
                skill.name ||
                skill.skill ||
                skill.title ||
                "Unknown Skill";

              const status =
                skill.status || "missing";

              const statusText =
                getStatusText(status);

              const statusColor =
                getStatusColor(status);

              const resourceLinks =
                Array.isArray(
                  skill.resource_links
                )
                  ? skill.resource_links
                  : [];

              return (
                <motion.div
                  key={`${name}-${index}`}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="border border-gray-200 rounded-xl p-4"
                >

                  {/* Skill Header */}
                  <div className="flex justify-between items-center gap-3">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <BookOpen
                          size={19}
                          className="text-blue-600"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {name}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                          Job requirement
                        </p>
                      </div>

                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                    >
                      {statusText}
                    </span>

                  </div>

                  {/* Status Information */}
                  <div className="mt-4">

                    {status.toLowerCase() === "missing" && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle size={17} />
                        <span>
                          This skill is required for the job but was not detected in your CV.
                        </span>
                      </div>
                    )}

                    {status.toLowerCase() === "weak" && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <TrendingUp size={17} />
                        <span>
                          You have this skill, but your CV shows limited evidence of proficiency.
                        </span>
                      </div>
                    )}

                    {status.toLowerCase() === "strong" && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 size={17} />
                        <span>
                          Your CV shows strong evidence of this skill.
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Learning Resources */}
                  {resourceLinks.length > 0 && (
                    <div className="mt-4">

                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Recommended Resources
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {resourceLinks.map(
                          (link, linkIndex) => (
                            <a
                              key={linkIndex}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium transition"
                            >
                              Learn Resource{" "}
                              {linkIndex + 1}

                              <ExternalLink
                                size={13}
                              />
                            </a>
                          )
                        )}

                      </div>

                    </div>
                  )}

                </motion.div>
              );
            })}

          </div>
        )}

      {/* AI Recommendation */}
      {!loading &&
        !error &&
        skills.length > 0 && (
          <div className="mt-6 bg-blue-50 rounded-xl p-5">

            <div className="flex items-start gap-3">

              <TrendingUp
                size={22}
                className="text-blue-600 mt-0.5"
              />

              <div className="flex-1">

                <h3 className="font-semibold text-gray-800">
                  AI Recommendation
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  Focus on the missing and weak skills first.
                  Improving these skills can increase your
                  job matching score.
                </p>

              </div>

              <ArrowRight
                size={20}
                className="text-blue-600"
              />

            </div>

          </div>
        )}

    </div>
  );
}

export default SkillGapAnalysis;