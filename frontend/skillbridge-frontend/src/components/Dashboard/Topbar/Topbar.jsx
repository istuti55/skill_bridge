import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Search } from "lucide-react";
import toast from "react-hot-toast";

import {
  getNotifications,
  getStoredUser,
  markNotificationRead,
} from "../../../services/api";

const POLL_MS = 60000;

const ROLE_LABELS = {
  candidate: "Job Seeker",
  company: "Recruiter",
  admin: "Admin",
};

function Topbar() {
  const user = getStoredUser();
  const displayName = user?.name || "User";
  const roleLabel = ROLE_LABELS[user?.role] || "Member";

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, POLL_MS);
    return () => clearInterval(timer);
  }, [loadNotifications]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    try {
      await markNotificationRead(id);
    } catch (error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
      );
      toast.error(error.message || "Could not mark as read");
    }
  };

  const formatDate = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
  };

  return (
    <header className="bg-white h-20 shadow-sm flex items-center justify-between px-8">
      <div>
        <h2 className="text-3xl font-bold text-black">
          Welcome Back, {displayName.split(" ")[0]} 👋
        </h2>

        <p className="text-gray-500">
          Here's your career progress today.
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center bg-purple-50 rounded-xl px-4 py-2">
          <Search size={18} className="text-purple-600 mr-2" />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-black placeholder-gray-500"
          />
        </div>

        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative p-3 rounded-full bg-purple-50 text-purple-600 hover:bg-pink-100 hover:text-pink-600 transition"
            aria-label="Notifications"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center text-xs font-semibold text-white bg-pink-500 rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-xl border border-purple-100 z-50">
              <div className="px-4 py-3 border-b border-purple-100 font-semibold text-black">
                Notifications
              </div>

              {loading ? (
                <p className="p-4 text-sm text-gray-500">
                  Loading...
                </p>
              ) : notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 transition ${
                      n.is_read
                        ? "bg-white text-gray-500"
                        : "bg-pink-50 hover:bg-pink-100 text-black"
                    }`}
                  >
                    <p className="text-sm">{n.message}</p>

                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(n.created_at)}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              displayName
            )}&background=9333ea&color=fff`}
            alt="avatar"
            className="w-11 h-11 rounded-full"
          />

          <div>
            <h3 className="font-semibold text-black">
              {displayName}
            </h3>

            <p className="text-sm text-gray-500">
              {roleLabel}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;