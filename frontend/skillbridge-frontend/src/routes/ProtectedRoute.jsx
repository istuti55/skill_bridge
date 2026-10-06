import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getHomeRoute, getUserRole, isAuthenticated } from "../services/api";

function ProtectedRoute({ role }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userRole = getUserRole();
  if (role && userRole !== role) {
    return <Navigate to={getHomeRoute(userRole)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;