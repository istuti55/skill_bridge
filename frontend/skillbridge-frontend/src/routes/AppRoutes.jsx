import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";

import CareerDashboard from "../pages/CareerDashboard/CareerDashboard";
import CompanyDashboard from "../pages/CompanyDashboard/CompanyDashboard";
import CompanyJobs from "../pages/CompanyJobs/CompanyJobs";
import CompanyApplicants from "../pages/CompanyApplicants/CompanyApplicants";

import Resume from "../pages/Resume/Resume";
import AIAnalysis from "../pages/AIAnalysis/AIAnalysis";
import Jobs from "../pages/Jobs/Jobs";
import Applications from "../pages/Applications/Applications";
import Interviews from "../pages/Interviews/Interviews";
import Profile from "../pages/Profile/Profile";

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

      {/* Candidate Dashboards */}
      <Route path="/career" element={<CareerDashboard />} />
      <Route path="/dashboard" element={<CareerDashboard />} />

      {/* Company Dashboard */}
      <Route path="/company" element={<CompanyDashboard />} />
      <Route path="/company/jobs" element={<CompanyJobs />} />
      <Route path="/company/applicants" element={<CompanyApplicants />} />

      {/* Candidate Pages */}
      <Route path="/resume" element={<Resume />} />
      <Route path="/ai-analysis" element={<AIAnalysis />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/applications" element={<Applications />} />
      <Route path="/interviews" element={<Interviews />} />
      <Route path="/profile" element={<Profile />} />

      {/* Admin */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
