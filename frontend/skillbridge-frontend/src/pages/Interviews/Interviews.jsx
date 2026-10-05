import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

import Sidebar from "../../components/Dashboard/Sidebar/Sidebar";
import Topbar from "../../components/Dashboard/Topbar/Topbar";
import UpcomingInterviews from "../../components/Dashboard/UpcomingInterviews/UpcomingInterviews";

function Interviews() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1">
        {/* Topbar */}
        <Topbar />

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <CalendarDays
                  size={26}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                  Interviews
                </h1>

                <p className="text-gray-500 mt-1">
                  Manage your upcoming interviews and stay prepared.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Interview Section */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <UpcomingInterviews />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default Interviews;