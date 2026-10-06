import authImage from "../../assets/images/login.svg";

function AuthLayout({ title, subtitle, children }) {
  return (
    <section className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side */}
      <div className="hidden lg:flex bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-10">
        <div className="text-center">
          <img
            src={authImage}
            alt="Authentication"
            className="w-[500px] mx-auto"
          />

          <h2 className="text-4xl font-bold text-white mt-10">
            Welcome to SkillBridge
          </h2>

          <p className="text-blue-100 mt-4 text-lg leading-8">
            AI-powered recruitment platform connecting students,
            job seekers and companies through intelligent career
            recommendations.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-gray-900">
            {title}
          </h1>

          <p className="text-gray-500 mt-3 mb-10">
            {subtitle}
          </p>

          {children}
        </div>
      </div>
    </section>
  );
}

export default AuthLayout;