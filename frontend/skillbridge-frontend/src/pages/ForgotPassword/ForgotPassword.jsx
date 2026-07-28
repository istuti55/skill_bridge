import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

import AuthLayout from "../../components/Auth/AuthLayout";
import AuthInput from "../../components/Auth/AuthInput/AuthInput";
import AuthButton from "../../components/Auth/AuthButton/AuthButton";

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Reset Email:", data);

    // Connect Django Forgot Password API later
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your registered email address and we'll send you a password reset link."
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

        <AuthButton
          text="Send Reset Link"
          loading={isSubmitting}
        />

        <p className="text-center text-gray-600">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Back to Login
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;