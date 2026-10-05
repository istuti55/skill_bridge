import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import CareerDashboard from "../pages/CareerDashboard/CareerDashboard";
import CompanyDashboard from "../pages/CompanyDashboard/CompanyDashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/career" element={<CareerDashboard />} />
      <Route path="/company" element={<CompanyDashboard />} />
      <Route path="/dashboard" element={<CareerDashboard />} />
    </Routes>
  );
}

export default AppRoutes;