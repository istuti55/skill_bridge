import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import JobCard from "../JobCard/JobCard";

function RecommendedJobs({ jobs = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="
        bg-white rounded-2xl border border-gray-100 shadow-sm
        hover:shadow-lg transition-shadow duration-300 p-6 md:p-8
      "
    >
      <div className="flex items-start gap-4 mb-7">
        <div className="
          w-12 h-12 rounded-xl bg-blue-100
          flex items-center justify-center flex-shrink-0
        ">
          <Sparkles size={24} className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Recommended Jobs
          </h2>
          <p className="text-gray-500 mt-1">
            Jobs ranked using your current profile match scores.
          </p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="font-medium">No matched jobs yet.</p>
          <p className="text-sm mt-1">
            Upload your resume and complete your profile to get recommendations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {jobs.map((job, index) => (
            <motion.div
              key={job.job_id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <JobCard
                company={job.company}
                title={job.title}
                match={job.match_score}
                requiredSkills={job.missing_skills || []}
                jobId={job.job_id}
              />
            </motion.div>
          ))}
        </div>
      )}

      <div className="
        mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4
        flex items-center gap-3
      ">
        <Sparkles size={18} className="text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          Match scores are calculated from your current candidate profile and
          available job matches.
        </p>
      </div>
    </motion.div>
  );
}

export default RecommendedJobs;
