import { User, LogIn } from "lucide-react";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">

        {/* Logo */}
        <NavLink
          to="/"
          className="text-3xl font-bold text-blue-600"
        >
          SkillBridge
        </NavLink>

        {/* Menu */}
        <ul className="flex gap-8 text-gray-700 font-medium">

          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"
              }
            >
              Home
            </NavLink>
          </li>

          <li>
            <a href="#features" className="hover:text-blue-600">
              Features
            </a>
          </li>

          <li>
            <a href="#about" className="hover:text-blue-600">
              About
            </a>
          </li>

        </ul>

        {/* Buttons */}
        <div className="flex gap-4">

          <NavLink
            to="/login"
            className="flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
          >
            <LogIn size={18} />
            Login
          </NavLink>

          <NavLink
            to="/register"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <User size={18} />
            Register
          </NavLink>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;