import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * PublicRoute — accessible only when NOT authenticated.
 * If the user is already logged in, redirect them to /dashboard.
 * The Dashboard component handles rendering based on role.
 */
const PublicRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
