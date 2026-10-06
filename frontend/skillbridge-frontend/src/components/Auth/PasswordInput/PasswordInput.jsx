import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

function PasswordInput({
  label,
  placeholder,
  register,
  name,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-5">
      {/* Label */}
      <label className="block text-gray-700 font-medium mb-2">
        {label}
      </label>

      {/* Password Input */}
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
        <Lock
          size={18}
          className="text-gray-400 mr-3 flex-shrink-0"
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="w-full outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
          {...(register ? register(name) : {})}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="
            ml-2
            p-1.5
            rounded-lg
            text-gray-400
            hover:text-pink-600
            hover:bg-pink-50
            active:scale-95
            transition-all
            duration-300
            ease-in-out
            focus:outline-none
            focus:ring-2
            focus:ring-purple-200
          "
        >
          <span
            className={`transition-all duration-300 ${
              showPassword ? "scale-110" : "scale-100"
            }`}
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </span>
        </button>
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

export default PasswordInput;