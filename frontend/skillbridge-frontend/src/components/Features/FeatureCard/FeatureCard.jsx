function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-8 border border-purple-100">
      <div className="text-purple-600 mb-5 text-5xl">
        {icon}
      </div>

      <h3 className="text-2xl font-bold text-black mb-3">
        {title}
      </h3>

      <p className="text-gray-600 leading-7">
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;