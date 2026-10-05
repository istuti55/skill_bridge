import { useState } from "react";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Heart,
  Eye,
  Building2,
  X,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function JobCard({
  company,
  title,
  location,
  salary,
  type,
  match,
  logo,
}) {
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <>
      {/* ================= JOB CARD ================= */}
      <div
        className="
          bg-white
          border
          border-gray-100
          rounded-2xl
          p-6
          hover:shadow-xl
          hover:-translate-y-1
          transition-all
          duration-300
        "
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">

            {/* Company Logo */}
            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-gray-50
                border
                border-gray-100
                flex
                items-center
                justify-center
                text-2xl
              "
            >
              {logo}
            </div>

            <div>
              <h2 className="font-bold text-xl text-gray-800">
                {title}
              </h2>

              <div className="flex items-center gap-2 mt-1">
                <Building2
                  size={16}
                  className="text-gray-400"
                />

                <p className="text-gray-500">
                  {company}
                </p>
              </div>
            </div>
          </div>

          {/* Favorite Button */}
          <button
            onClick={() => setSaved(!saved)}
            className={`
              w-10
              h-10
              rounded-xl
              flex
              items-center
              justify-center
              transition
              ${
                saved
                  ? "bg-red-50 text-red-500"
                  : "text-gray-400 hover:bg-red-50 hover:text-red-500"
              }
            `}
          >
            <Heart
              size={20}
              fill={saved ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Details */}
        <div className="mt-6 space-y-3">

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin
              size={18}
              className="text-blue-600"
            />
            {location}
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign
              size={18}
              className="text-green-600"
            />
            {salary}
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase
              size={18}
              className="text-purple-600"
            />
            {type}
          </div>
        </div>

        {/* Match Bar */}
        <div className="mt-6">

          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-600">
              AI Match Score
            </span>

            <span className="font-bold text-green-600">
              {match}%
            </span>
          </div>

          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="
                h-full
                bg-gradient-to-r
                from-green-400
                to-green-600
                rounded-full
              "
              style={{
                width: `${match}%`,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center">

          <span
            className="
              bg-green-100
              text-green-700
              px-4
              py-2
              rounded-full
              text-sm
              font-semibold
            "
          >
            {match}% Match
          </span>

          {/* View Job */}
          <button
            onClick={() => setShowModal(true)}
            className="
              flex
              items-center
              gap-2
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-5
              py-2
              rounded-xl
              font-medium
              transition
            "
          >
            <Eye size={18} />
            View Job
          </button>
        </div>
      </div>

      {/* ================= JOB DETAILS MODAL ================= */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              fixed
              inset-0
              z-50
              bg-black/50
              backdrop-blur-sm
              flex
              items-center
              justify-center
              p-4
            "
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="
                bg-white
                w-full
                max-w-2xl
                max-h-[90vh]
                overflow-y-auto
                rounded-3xl
                shadow-2xl
                p-6
                sm:p-8
              "
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >

              {/* Modal Header */}
              <div className="flex justify-between items-start">

                <div className="flex items-center gap-4">

                  <div
                    className="
                      w-16
                      h-16
                      rounded-2xl
                      bg-gray-50
                      border
                      border-gray-100
                      flex
                      items-center
                      justify-center
                      text-3xl
                    "
                  >
                    {logo}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {title}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {company}
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-gray-100
                    hover:bg-gray-200
                    flex
                    items-center
                    justify-center
                    transition
                  "
                >
                  <X size={20} />
                </button>

              </div>

              {/* Job Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">

                <div className="bg-blue-50 rounded-2xl p-4">
                  <MapPin
                    size={20}
                    className="text-blue-600 mb-2"
                  />
                  <p className="text-xs text-gray-500">
                    Location
                  </p>
                  <p className="font-semibold text-gray-800">
                    {location}
                  </p>
                </div>

                <div className="bg-green-50 rounded-2xl p-4">
                  <DollarSign
                    size={20}
                    className="text-green-600 mb-2"
                  />
                  <p className="text-xs text-gray-500">
                    Salary
                  </p>
                  <p className="font-semibold text-gray-800">
                    {salary}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-2xl p-4">
                  <Briefcase
                    size={20}
                    className="text-purple-600 mb-2"
                  />
                  <p className="text-xs text-gray-500">
                    Job Type
                  </p>
                  <p className="font-semibold text-gray-800">
                    {type}
                  </p>
                </div>

              </div>

              {/* AI Match */}
              <div className="mt-8">

                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-gray-800">
                    AI Job Match
                  </h3>

                  <span className="font-bold text-green-600">
                    {match}%
                  </span>
                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="
                      h-full
                      bg-gradient-to-r
                      from-green-400
                      to-green-600
                      rounded-full
                    "
                    style={{
                      width: `${match}%`,
                    }}
                  />
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  This job strongly matches your current skills,
                  experience, and career goals.
                </p>

              </div>

              {/* Job Description */}
              <div className="mt-8">

                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Job Description
                </h3>

                <p className="text-gray-600 leading-7">
                  We are looking for a talented and motivated{" "}
                  <span className="font-semibold">
                    {title}
                  </span>{" "}
                  to join the team at{" "}
                  <span className="font-semibold">
                    {company}
                  </span>
                  . You will work on modern web applications,
                  collaborate with developers and designers, and
                  contribute to building high-quality products.
                </p>

              </div>

              {/* Required Skills */}
              <div className="mt-8">

                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Recommended Skills
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {[
                    "React.js",
                    "JavaScript",
                    "HTML & CSS",
                    "Git & GitHub",
                  ].map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <CheckCircle
                        size={18}
                        className="text-green-500"
                      />
                      {skill}
                    </div>
                  ))}

                </div>

              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">

                <button
                  onClick={() => setSaved(!saved)}
                  className="
                    flex-1
                    flex
                    items-center
                    justify-center
                    gap-2
                    border
                    border-gray-200
                    hover:bg-gray-50
                    text-gray-700
                    py-3
                    rounded-xl
                    font-semibold
                    transition
                  "
                >
                  <Heart
                    size={19}
                    fill={saved ? "currentColor" : "none"}
                    className={saved ? "text-red-500" : ""}
                  />
                  {saved ? "Saved" : "Save Job"}
                </button>

                <button
                  onClick={() => {
                    alert("Application process started!");
                    setShowModal(false);
                  }}
                  className="
                    flex-1
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    py-3
                    rounded-xl
                    font-semibold
                    transition
                  "
                >
                  Apply Now
                </button>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default JobCard;