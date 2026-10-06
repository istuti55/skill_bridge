import { Loader2 } from "lucide-react";

function AuthButton({
  text,
  type = "submit",
  loading = false,
}) {
  return (
    <button
      type={type}
      disabled={loading}
      className={`w-full py-3 rounded-xl font-semibold text-white transition duration-300 flex items-center justify-center gap-2 ${
        loading
          ? "bg-blue-500 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
      }`}
    >
      {loading ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          Please wait...
        </>
      ) : (
        text
      )}
    </button>
  );
}

export default AuthButton;