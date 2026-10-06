function Testimonials() {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      message:
        "SkillBridge helped me identify my skill gaps and land my dream software engineering job. The AI recommendations were incredibly accurate.",
    },
    {
      name: "Rahul Verma",
      role: "HR Manager",
      message:
        "The AI screening and candidate ranking saved our recruitment team hours of manual work.",
    },
    {
      name: "Aarav Singh",
      role: "Computer Science Student",
      message:
        "The personalized job recommendations and career guidance helped me secure my first interview.",
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-gray-900">
          What Our Users Say
        </h2>

        <p className="text-center text-gray-500 mt-4 mb-12">
          Trusted by students and recruiters across SkillBridge.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition duration-300"
            >
              <div className="text-yellow-500 text-2xl mb-4">
                ⭐⭐⭐⭐⭐
              </div>

              <p className="text-gray-600 leading-7 mb-6">
                "{item.message}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {item.name.charAt(0)}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {item.role}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Testimonials;