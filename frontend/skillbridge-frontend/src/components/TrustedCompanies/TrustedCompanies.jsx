function TrustedCompanies() {
  const companies = [
    "Google",
    "Microsoft",
    "Amazon",
    "Meta",
    "Adobe",
    "Netflix",
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-black">
          Trusted by Leading Companies
        </h2>

        <p className="text-center text-gray-600 mt-4 mb-12">
          Companies can recruit talented candidates through SkillBridge.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {companies.map((company) => (
            <div
              key={company}
              className="bg-white border border-purple-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-pink-500 hover:bg-purple-50 transition-all duration-300 py-10 text-center font-semibold text-gray-700 hover:-translate-y-2 cursor-pointer"
            >
              {company}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default TrustedCompanies;