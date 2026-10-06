import { Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import GoogleButton from "../../components/Auth/GoogleButton/GoogleButton";
import AuthLayout from "../../components/Auth/AuthLayout";
import AuthInput from "../../components/Auth/AuthInput/AuthInput";
import PasswordInput from "../../components/Auth/PasswordInput/PasswordInput";
import AuthButton from "../../components/Auth/AuthButton/AuthButton";

import { loginUser, getHomeRoute } from "../../services/api";

function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    toast.loading("Signing in...", {
      id: "login",
    });

    try {
      const result = await loginUser(data.email, data.password);

      toast.success("Login Successful 🎉", {
        id: "login",
      });

      // Candidates go to /dashboard, companies go to /company
      navigate(getHomeRoute(result.user?.role), { replace: true });
    } catch (error) {
      toast.error(error.message || "Login Failed ❌", {
        id: "login",
      });
    }
  };

  return (
    <AuthLayout
      title="Welcome Back 👋"
      subtitle="Sign in to continue to your SkillBridge account."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          placeholder="Enter your password"
          register={(name) =>
            register(name, {
              required: "Password is required",
            })
          }
          name="password"
          error={errors.password}
        />

        <div className="flex items-center justify-between mt-6 mb-8">
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              className="w-4 h-4 accent-purple-600"
            />
            Remember Me
          </label>

          <Link
            to="/forgot-password"
            className="text-purple-600 hover:text-pink-600 hover:underline transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <AuthButton
          text="Login"
          loading={isSubmitting}
        />

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-gray-400">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <GoogleButton />

        <p className="text-center text-gray-600 mt-5">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-purple-600 font-semibold hover:text-pink-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;