
import {
  GraduationCap,
  Briefcase,
  Building2,
  TrendingUp,
} from "lucide-react";

function Stats() {
  const stats = [
    {
      icon: <GraduationCap size={48} />,
      value: 25000,
      suffix: "+",
      label: "Students",
    },
    {
      icon: <Briefcase size={48} />,
      value: 8000,
      suffix: "+",
      label: "Jobs Posted",
    },
    {
      icon: <Building2 size={48} />,
      value: 500,
      suffix: "+",
      label: "Companies",
    },
    {
      icon: <TrendingUp size={48} />,
      value: 96,
      suffix: "%",
      label: "Success Rate",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-white">
          Our Impact
        </h2>

        <p className="text-center text-blue-100 mt-4 mb-14">
          Thousands of students and companies trust SkillBridge to build successful careers.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 text-center shadow-xl hover:scale-105 transition duration-300"
            >
              <div className="text-blue-600 flex justify-center mb-5">
                {item.icon}
              </div>

              <h3 className="text-4xl font-bold text-gray-900">
                {item.value}
                {item.suffix}
              </h3>

              <p className="mt-3 text-gray-500 font-medium">
                {item.label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Stats;