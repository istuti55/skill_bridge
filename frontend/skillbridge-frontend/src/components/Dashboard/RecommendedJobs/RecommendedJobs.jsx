import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import JobCard from "../JobCard/JobCard";

function RecommendedJobs() {
  const jobs = [
    {
      company: "Google",
      title: "Frontend Developer",
      location: "Kathmandu",
      salary: "NPR 80,000/month",
      type: "Full Time",
      match: 95,
      logo: "🟢",
    },
    {
      company: "Leapfrog",
      title: "React Developer",
      location: "Lalitpur",
      salary: "NPR 70,000/month",
      type: "Hybrid",
      match: 92,
      logo: "🚀",
    },
    {
      company: "Cotiviti",
      title: "UI Engineer",
      location: "Remote",
      salary: "NPR 90,000/month",
      type: "Remote",
      match: 89,
      logo: "💙",
    },
    {
      company: "Fusemachines",
      title: "Frontend Engineer",
      location: "Kathmandu",
      salary: "NPR 85,000/month",
      type: "Full Time",
      match: 87,
      logo: "🤖",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.7,
        ease: "easeOut",
      }}
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
      <div className="flex items-start gap-4 mb-7">

        {/* Icon */}
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
            size={24}
            className="text-blue-600"
          />
        </div>

        {/* Heading */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Recommended Jobs
          </h2>

          <p className="text-gray-500 mt-1">
            AI matched these opportunities based on your resume.
          </p>
        </div>

      </div>

      {/* Job Cards */}
      <div className="
        grid
        grid-cols-1
        gap-5
      ">
        {jobs.map((job, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.1,
            }}
            transition={{
              duration: 0.4,
              delay: index * 0.08,
            }}
          >
            <JobCard
              company={job.company}
              title={job.title}
              location={job.location}
              salary={job.salary}
              type={job.type}
              match={job.match}
              logo={job.logo}
            />
          </motion.div>
        ))}
      </div>

      {/* Bottom Message */}
      <div className="
        mt-6
        bg-blue-50
        border
        border-blue-100
        rounded-xl
        p-4
        flex
        items-center
        gap-3
      ">
        <Sparkles
          size={18}
          className="text-blue-600 flex-shrink-0"
        />

        <p className="text-sm text-blue-700">
          These jobs are ranked according to your resume skills and AI match score.
        </p>
      </div>

    </motion.div>
  );
}

export default RecommendedJobs;