import { useSelector } from "react-redux";
import AdminDashboard from "./AdminDashboard";
import PartnerDashboard from "./PartnerDashboard";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useSelector((state) => state.user);

  if (user?.type === "partner") return <PartnerDashboard />;
  if (user?.type === "admin") return <AdminDashboard />;

  // Unknown role — shouldn't happen if auth is correct
  return <Navigate to="/unauthorized" replace />;
};

export default Dashboard;
