import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

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

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Login / Register: redirect away if already logged in */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Candidate only */}
      <Route element={<ProtectedRoute role="candidate" />}>
        <Route path="/career" element={<CareerDashboard />} />
        <Route path="/dashboard" element={<CareerDashboard />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/ai-analysis" element={<AIAnalysis />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Company only (Person 2 adds their pages in this block) */}
      <Route element={<ProtectedRoute role="company" />}>
        <Route path="/company" element={<CompanyDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;