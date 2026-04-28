import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute — accessible only when authenticated.
 *
 * Props:
 *  - allowedRoles: string[] (optional) — if provided, user.role must be included.
 *
 * Redirect behaviour:
 *  - Not authenticated      → /login
 *  - Wrong role             → /unauthorized  (or "/" as a safe fallback)
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.user);

  // 1️⃣ Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ Role-based access control (only checked when allowedRoles is specified)
  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user.role);
    const hasType = allowedRoles.includes(user.type);
    
    if (!hasRole && !hasType) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
