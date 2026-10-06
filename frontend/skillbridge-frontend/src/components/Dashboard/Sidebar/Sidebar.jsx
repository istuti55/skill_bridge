
import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../../../services/api";

import {
  LayoutDashboard,
  FileText,
  Brain,
  Briefcase,
  ClipboardList,
  CalendarDays,
  User,
  LogOut,
  X,
} from "lucide-react";

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    setIsOpen(false);
    navigate("/login", { replace: true });
  };

  const menu = [
    {
      icon: <LayoutDashboard size={20} />,
      title: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <FileText size={20} />,
      title: "Resume",
      path: "/resume",
    },
    {
      icon: <Brain size={20} />,
      title: "AI Analysis",
      path: "/ai-analysis",
    },
    {
      icon: <Briefcase size={20} />,
      title: "Jobs",
      path: "/jobs",
    },
    {
      icon: <ClipboardList size={20} />,
      title: "Applications",
      path: "/applications",
    },
    {
      icon: <CalendarDays size={20} />,
      title: "Interviews",
      path: "/interviews",
    },
    {
      icon: <User size={20} />,
      title: "Profile",
      path: "/profile",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="
            fixed
            inset-0
            bg-black/40
            z-40
            lg:hidden
          "
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          lg:sticky
          top-0
          left-0
          z-50
          w-64
          h-screen
          bg-white
          border-r
          border-gray-200
          flex
          flex-col
          transition-transform
          duration-300
          ease-in-out

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-600">
              SkillBridge
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Career Dashboard
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="
              lg:hidden
              w-9
              h-9
              rounded-lg
              flex
              items-center
              justify-center
              text-gray-600
              hover:bg-pink-50
              hover:text-pink-600
              transition
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {menu.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-3
                px-4
                py-3
                rounded-xl
                mb-2
                font-medium
                transition-all
                duration-200

                ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-100"
                    : "text-gray-800 hover:bg-pink-50 hover:text-pink-600"
                }
                `
              }
            >
              {item.icon}

              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="
              w-full
              flex
              items-center
              justify-center
              gap-2
              bg-red-50
              text-red-600
              py-3
              rounded-xl
              font-medium
              hover:bg-red-100
              transition
            "
          >
            <LogOut size={18} />

            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

