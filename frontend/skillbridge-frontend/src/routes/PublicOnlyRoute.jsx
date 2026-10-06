import { Navigate, Outlet } from "react-router-dom";
import { getHomeRoute, getUserRole, isAuthenticated } from "../services/api";

function PublicOnlyRoute() {
  if (isAuthenticated()) {
    return <Navigate to={getHomeRoute(getUserRole())} replace />;
  }
  return <Outlet />;
}

export default PublicOnlyRoute;