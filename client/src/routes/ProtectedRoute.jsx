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
const ProtectedRoute = ({ allowedRoles = [], allowedTypes = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.user);

  // 1️⃣ Not logged in
  if (!isAuthenticated || !user) {
    console.warn(`[ProtectedRoute] Access denied: User not authenticated.`);
    return <Navigate to="/login" replace />;
  }

  // 2️⃣ Type check (e.g., "admin" vs "partner")
  if (allowedTypes.length > 0 && !allowedTypes.includes(user.type)) {
    console.warn(`[ProtectedRoute] Type mismatch: user.type=${user.type}, allowed=${allowedTypes}`);
    return <Navigate to="/dashboard" replace />;
  }

  // 3️⃣ Role check (e.g., "admin" vs "manager" within "admin" type)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn(`[ProtectedRoute] Role mismatch: user.role=${user.role}, allowed=${allowedRoles}`);
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
