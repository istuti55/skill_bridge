function CareerProgress() {
  const skills = [
    { name: "React.js", value: 90 },
    { name: "JavaScript", value: 85 },
    { name: "HTML & CSS", value: 95 },
    { name: "Python", value: 70 },
    { name: "Communication", value: 80 },
    { name: "Problem Solving", value: 88 },
  ];

  const getColor = (value) => {
    if (value >= 90) return "bg-green-500";
    if (value >= 75) return "bg-blue-500";
    return "bg-orange-500";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-10">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          📈 Career Progress
        </h2>

        <p className="text-gray-500 mt-2">
          AI evaluated your current skill proficiency.
        </p>
      </div>

      <div className="space-y-6">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-700">
                {skill.name}
              </span>

              <span className="font-bold text-gray-600">
                {skill.value}%
              </span>
            </div>

            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getColor(
                  skill.value
                )}`}
                style={{ width: `${skill.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CareerProgress;