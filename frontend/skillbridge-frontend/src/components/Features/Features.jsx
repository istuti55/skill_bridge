import {
  Brain,
  Briefcase,
  TrendingUp,
  Route,
  Building2,
  BarChart3,
} from "lucide-react";

import FeatureCard from "./FeatureCard/FeatureCard";

function Features() {
  const features = [
    {
      icon: <Brain size={42} />,
      title: "AI Resume Analysis",
      description:
        "Upload your resume and let AI analyze your skills, experience, and strengths.",
    },
    {
      icon: <Briefcase size={42} />,
      title: "Smart Job Matching",
      description:
        "AI recommends jobs that best match your skills and career goals.",
    },
    {
      icon: <TrendingUp size={42} />,
      title: "Skill Gap Analysis",
      description:
        "Identify missing skills and receive personalized learning suggestions.",
    },
    {
      icon: <Route size={42} />,
      title: "Career Roadmap",
      description:
        "Receive an AI-powered roadmap to achieve your dream career.",
    },
    {
      icon: <Building2 size={42} />,
      title: "Company Dashboard",
      description:
        "Companies can manage applicants and streamline recruitment.",
    },
    {
      icon: <BarChart3 size={42} />,
      title: "Analytics Dashboard",
      description:
        "Track recruitment statistics and candidate performance.",
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-gray-900">
          Powerful Features
        </h2>

        <p className="text-center text-gray-500 mt-4 mb-16">
          Everything you need to connect talented candidates with the right opportunities.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default Features;