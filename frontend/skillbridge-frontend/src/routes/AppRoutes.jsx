import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import CareerDashboard from "../pages/CareerDashboard/CareerDashboard";
import CompanyDashboard from "../pages/CompanyDashboard/CompanyDashboard";

import Resume from "../pages/Resume/Resume";
import AIAnalysis from "../pages/AIAnalysis/AIAnalysis";
import Jobs from "../pages/Jobs/Jobs";
import Interviews from "../pages/Interviews/Interviews";
import Profile from "../pages/Profile/Profile";
import Applications from "../pages/Applications/Applications";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Main Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Dashboards */}
      <Route path="/career" element={<CareerDashboard />} />
      <Route path="/dashboard" element={<CareerDashboard />} />
      <Route path="/company" element={<CompanyDashboard />} />

      {/* Career Pages */}
      <Route path="/resume" element={<Resume />} />
      <Route path="/ai-analysis" element={<AIAnalysis />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/applications" element={<Applications />} />
      <Route path="/interviews" element={<Interviews />} />
      <Route path="/profile" element={<Profile />} />

      {/* Admin (admin accounts only) */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
