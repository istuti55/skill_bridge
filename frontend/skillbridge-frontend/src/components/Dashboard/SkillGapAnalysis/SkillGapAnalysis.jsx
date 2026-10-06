import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

function SkillGapAnalysis() {
  const skills = [
    {
      name: "React.js",
      current: 90,
      required: 95,
      status: "Strong",
    },
    {
      name: "JavaScript",
      current: 85,
      required: 90,
      status: "Strong",
    },
    {
      name: "Node.js",
      current: 60,
      required: 85,
      status: "Needs Improvement",
    },
    {
      name: "System Design",
      current: 40,
      required: 80,
      status: "Needs Improvement",
    },
    {
      name: "Git & GitHub",
      current: 75,
      required: 85,
      status: "Good",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7 }}
      className="
        bg-white
        rounded-2xl
        border
        border-gray-100
        shadow-sm
        hover:shadow-lg
        transition-shadow
        duration-300
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
            bg-purple-100
            flex
            items-center
            justify-center
            flex-shrink-0
          "
        >
          <Target
            size={25}
            className="text-purple-600"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Skill Gap Analysis
          </h2>

          <p className="text-gray-500 mt-1">
            Compare your current skills with the skills required for your target roles.
          </p>
        </div>

      </div>

      {/* Skill List */}
      <div className="space-y-6">

        {skills.map((skill, index) => {
          const gap = skill.required - skill.current;

          return (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
              }}
              className="
                border
                border-gray-100
                rounded-xl
                p-5
                hover:shadow-md
                transition
              "
            >

              {/* Skill Header */}
              <div className="flex justify-between items-center mb-3">

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {skill.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Current: {skill.current}% &nbsp;•&nbsp;
                    Required: {skill.required}%
                  </p>
                </div>

                <div className="text-right">

                  {skill.status === "Needs Improvement" ? (
                    <span className="
                      inline-flex
                      items-center
                      gap-1
                      bg-yellow-100
                      text-yellow-700
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                    ">
                      <AlertCircle size={14} />
                      Improve
                    </span>
                  ) : (
                    <span className="
                      inline-flex
                      items-center
                      gap-1
                      bg-green-100
                      text-green-700
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                    ">
                      <CheckCircle2 size={14} />
                      {skill.status}
                    </span>
                  )}

                </div>

              </div>

              {/* Current Skill Bar */}
              <div className="mb-3">

                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Your Skill</span>
                  <span>{skill.current}%</span>
                </div>

                <div className="
                  w-full
                  h-2
                  bg-gray-100
                  rounded-full
                  overflow-hidden
                ">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${skill.current}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.08,
                    }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>

              </div>

              {/* Required Skill Bar */}
              <div>

                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Required Level</span>
                  <span>{skill.required}%</span>
                </div>

                <div className="
                  w-full
                  h-2
                  bg-gray-100
                  rounded-full
                  overflow-hidden
                ">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${skill.required}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.08 + 0.15,
                    }}
                    className="h-full bg-purple-500 rounded-full"
                  />
                </div>

              </div>

              {/* Gap */}
              {gap > 0 && (
                <p className="text-xs text-orange-600 mt-3 font-medium">
                  Skill gap: {gap}%
                </p>
              )}

            </motion.div>
          );
        })}

      </div>

      {/* AI Recommendation */}
      <div className="
        mt-8
        bg-purple-50
        border
        border-purple-100
        rounded-xl
        p-5
      ">

        <div className="flex items-start gap-3">

          <div className="
            w-10
            h-10
            rounded-lg
            bg-purple-100
            flex
            items-center
            justify-center
            flex-shrink-0
          ">
            <TrendingUp
              size={20}
              className="text-purple-600"
            />
          </div>

          <div>

            <h3 className="font-semibold text-gray-800">
              AI Recommendation
            </h3>

            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Focus on <strong>Node.js</strong> and{" "}
              <strong>System Design</strong> first.
              Improving these skills can significantly increase
              your chances of qualifying for senior frontend roles.
            </p>

          </div>

        </div>

      </div>

      {/* Learning Roadmap Button */}
      <button
        type="button"
        className="
          mt-6
          w-full
          sm:w-auto
          flex
          items-center
          justify-center
          gap-2
          bg-purple-600
          hover:bg-purple-700
          text-white
          px-6
          py-3
          rounded-xl
          font-semibold
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:shadow-lg
        "
      >
        <BookOpen size={18} />

        View Learning Roadmap

        <ArrowRight size={18} />

      </button>

    </motion.div>
  );
}

export default SkillGapAnalysis;