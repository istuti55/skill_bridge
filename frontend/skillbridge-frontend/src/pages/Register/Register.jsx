import { User, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import GoogleButton from "../../components/Auth/GoogleButton/GoogleButton";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthInput from "../../components/Auth/AuthInput/AuthInput";
import PasswordInput from "../../components/Auth/PasswordInput/PasswordInput";
import AuthButton from "../../components/Auth/AuthButton/AuthButton";

import { registerUser } from "../../services/api";

function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { role: "candidate" },
  });

  const password = watch("password");
  const role = watch("role");

  const onSubmit = async (data) => {
    toast.loading("Creating your account...", {
      id: "register",
    });

    try {
      await registerUser({
        name: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role || "candidate",
      });

      toast.success("Registration Successful 🎉", {
        id: "register",
      });

      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Registration Failed ❌", {
        id: "register",
      });
    }
  };

  return (
    <AuthLayout
      title="Create Your Account 🚀"
      subtitle="Join SkillBridge and start building your career."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Account type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a
          </label>
          <select
            {...register("role")}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="candidate">Job Seeker (Candidate)</option>
            <option value="company">Company / Recruiter</option>
          </select>
        </div>

        <AuthInput
          label={role === "company" ? "Company Name" : "Full Name"}
          type="text"
          placeholder={
            role === "company" ? "Enter your company name" : "Enter your full name"
          }
          icon={<User size={20} />}
          register={(name) =>
            register(name, {
              required: "Name is required",
            })
          }
          name="fullName"
          error={errors.fullName}
        />

        <AuthInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          icon={<Mail size={20} />}
          register={(name) =>
            register(name, {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Enter a valid email",
              },
            })
          }
          name="email"
          error={errors.email}
        />

        <PasswordInput
          label="Password"
          placeholder="Create a password"
          register={(name) =>
            register(name, {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })
          }
          name="password"
          error={errors.password}
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          register={(name) =>
            register(name, {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })
          }
          name="confirmPassword"
          error={errors.confirmPassword}
        />

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" required />
          I agree to the{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">
            Terms & Conditions
          </span>
        </label>

        <AuthButton
          text="Create Account"
          loading={isSubmitting}
        />

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-gray-400">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <GoogleButton />

        <p className="text-center text-gray-600 mt-5">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
}

export default Register;