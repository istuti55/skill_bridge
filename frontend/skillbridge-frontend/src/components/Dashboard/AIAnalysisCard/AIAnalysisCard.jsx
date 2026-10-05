import {
  CheckCircle2,
  AlertTriangle,
  Download,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

function AIAnalysisCard({
  score,
  strengths,
  improvements,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        ease: "easeOut",
      }}
      className="
        relative
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
        overflow-hidden
      "
    >
      {/* Top Gradient Accent */}
      <div className="
        absolute
        top-0
        left-0
        w-full
        h-1.5
        bg-gradient-to-r
        from-blue-500
        via-purple-500
        to-blue-600
      " />

      {/* Header */}
      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-6
        mb-8
      ">

        {/* Title */}
        <div className="flex items-start gap-4">

          <div className="
            w-12
            h-12
            rounded-xl
            bg-blue-100
            flex
            items-center
            justify-center
            flex-shrink-0
          ">
            <Sparkles
              size={25}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              AI Resume Analysis
            </h2>

            <p className="text-gray-500 mt-1">
              Your resume has been analyzed successfully.
            </p>
          </div>

        </div>

        {/* Score */}
        <div className="
          flex
          items-center
          gap-4
          bg-blue-50
          rounded-2xl
          px-5
          py-4
          border
          border-blue-100
        ">

          <div className="
            w-14
            h-14
            rounded-full
            bg-white
            border-4
            border-blue-500
            flex
            items-center
            justify-center
          ">
            <span className="text-blue-600 font-bold text-sm">
              {score}
            </span>
          </div>

          <div>
            <p className="text-gray-500 text-sm">
              Overall Score
            </p>

            <p className="text-2xl font-bold text-blue-600">
              {score}%
            </p>
          </div>

        </div>

      </div>

      {/* Score Message */}
      <div className="
        flex
        items-center
        gap-3
        bg-green-50
        border
        border-green-100
        rounded-xl
        p-4
        mb-6
      ">

        <TrendingUp
          size={20}
          className="text-green-600 flex-shrink-0"
        />

        <p className="text-sm text-green-700 font-medium">
          Your resume is performing well. A few improvements can make it even stronger.
        </p>

      </div>

      {/* Analysis Grid */}
      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-5
      ">

        {/* Strengths */}
        {strengths.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="
              bg-green-50
              border
              border-green-100
              rounded-xl
              p-5
              hover:shadow-md
              transition-shadow
              duration-300
            "
          >

            <div className="
              flex
              items-center
              gap-3
              mb-3
            ">

              <div className="
                w-9
                h-9
                rounded-lg
                bg-green-100
                flex
                items-center
                justify-center
              ">
                <CheckCircle2
                  size={20}
                  className="text-green-600"
                />
              </div>

              <h3 className="font-semibold text-gray-800">
                {item}
              </h3>

            </div>

            <p className="
              text-gray-600
              text-sm
              leading-relaxed
            ">
              Great job! This section of your resume looks strong.
            </p>

          </motion.div>
        ))}

        {/* Improvements */}
        {improvements.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="
              bg-yellow-50
              border
              border-yellow-100
              rounded-xl
              p-5
              hover:shadow-md
              transition-shadow
              duration-300
            "
          >

            <div className="
              flex
              items-center
              gap-3
              mb-3
            ">

              <div className="
                w-9
                h-9
                rounded-lg
                bg-yellow-100
                flex
                items-center
                justify-center
              ">
                <AlertTriangle
                  size={20}
                  className="text-yellow-600"
                />
              </div>

              <h3 className="font-semibold text-gray-800">
                {item}
              </h3>

            </div>

            <p className="
              text-gray-600
              text-sm
              leading-relaxed
            ">
              Improving this area can increase your resume score.
            </p>

          </motion.div>
        ))}

      </div>

      {/* Download Report */}
      <button
        type="button"
        className="
          mt-8
          w-full
          sm:w-auto
          bg-blue-600
          hover:bg-blue-700
          text-white
          px-6
          py-3
          rounded-xl
          flex
          items-center
          justify-center
          gap-2
          font-semibold
          shadow-sm
          hover:shadow-lg
          hover:-translate-y-0.5
          transition-all
          duration-300
        "
      >
        <Download size={18} />

        Download Report
      </button>

    </motion.div>
  );
}

export default AIAnalysisCard;