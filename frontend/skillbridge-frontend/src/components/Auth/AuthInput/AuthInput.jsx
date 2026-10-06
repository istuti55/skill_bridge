function AuthInput({
  label,
  type = "text",
  placeholder,
  icon,
  register,
  name,
  error,
}) {
  return (
    <div className="mb-5">
      {/* Label */}
      <label className="block text-gray-700 font-medium mb-2">
        {label}
      </label>

      {/* Input */}
      <div
        className="
          flex items-center
          border border-gray-300
          rounded-xl
          px-4
          py-2.5
          bg-white
          transition-all
          duration-300
          focus-within:border-purple-500
          focus-within:ring-4
          focus-within:ring-purple-100
        "
      >
        <span className="text-gray-400 mr-3 flex-shrink-0">
          {icon}
        </span>

        <input
          type={type}
          placeholder={placeholder}
          className="w-full outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
          {...(register ? register(name) : {})}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
}

export default AuthInput;