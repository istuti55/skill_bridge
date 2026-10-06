import { FcGoogle } from "react-icons/fc";

function GoogleButton({
  text = "Continue with Google",
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full
        flex
        items-center
        justify-center
        gap-3
        py-3
        rounded-xl
        border
        border-gray-300
        bg-white
        text-gray-700
        font-semibold
        transition-all
        duration-300
        hover:border-purple-500
        hover:bg-gray-50
        hover:shadow-lg
        hover:-translate-y-1
        active:scale-95
      "
    >
      <FcGoogle size={24} />
      {text}
    </button>
  );
}

export default GoogleButton;