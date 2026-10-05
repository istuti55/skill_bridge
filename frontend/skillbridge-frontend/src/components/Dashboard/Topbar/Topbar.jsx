import { Bell, Search } from "lucide-react";

function Topbar() {
  return (
    <header className="bg-white h-20 shadow-sm flex items-center justify-between px-8">
      {/* Left */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          Welcome Back 👋
        </h2>

        <p className="text-gray-500">
          Here's your career progress today.
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2">
          <Search
            size={18}
            className="text-gray-500 mr-2"
          />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none"
          />
        </div>

        {/* Notification */}
        <button className="relative p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition">
          <Bell size={20} />

          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <img
            src="https://ui-avatars.com/api/?name=User+Name&background=2563eb&color=fff"
            alt="avatar"
            className="w-11 h-11 rounded-full"
          />

          <div>
            <h3 className="font-semibold text-gray-800">
              User Name
            </h3>

            <p className="text-sm text-gray-500">
              Job Seeker
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;