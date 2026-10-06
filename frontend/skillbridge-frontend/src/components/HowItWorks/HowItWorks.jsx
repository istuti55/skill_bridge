import {
  Upload,
  BrainCircuit,
  Target,
  FileCheck,
  Video,
  BadgeCheck,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center font-bold text-black">
          SkillBridge Workflow
        </h2>

        <p className="text-center text-gray-600 mt-4 mb-16">
          A smarter recruitment journey powered by AI.
        </p>

        {/* Top Row */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-6">

          <WorkflowItem
            icon={<Upload size={32} />}
            title="Upload CV"
          />

          <ArrowRight className="hidden lg:block text-purple-500" size={32} />

          <WorkflowItem
            icon={<BrainCircuit size={32} />}
            title="AI Analysis"
          />

          <ArrowRight className="hidden lg:block text-purple-500" size={32} />

          <WorkflowItem
            icon={<Target size={32} />}
            title="Job Match"
          />

        </div>

        {/* Down Arrow */}

        <div className="flex justify-center my-10">
          <ArrowDown className="text-pink-500" size={40} />
        </div>

        {/* Bottom Row */}

        <div className="flex flex-col lg:flex-row justify-center items-center gap-6">

          <WorkflowItem
            icon={<FileCheck size={32} />}
            title="AI Screening"
          />

          <ArrowRight className="hidden lg:block text-purple-500" size={32} />

          <WorkflowItem
            icon={<Video size={32} />}
            title="Live Interview"
          />

          <ArrowRight className="hidden lg:block text-purple-500" size={32} />

          <WorkflowItem
            icon={<BadgeCheck size={32} />}
            title="Get Hired"
          />

        </div>

      </div>
    </section>
  );
}

function WorkflowItem({ icon, title }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 hover:border-pink-500 transition-all duration-300 p-6 w-52 text-center hover:-translate-y-2">

      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-black">
        {title}
      </h3>

    </div>
  );
}

export default HowItWorks;