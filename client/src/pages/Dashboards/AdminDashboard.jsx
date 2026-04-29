import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { StatCard, cn } from "../../components/dashboard/StatCard";
import {
  Users,
  UserPlus,
  BookOpen,
  Clock,
  Building2,
  ChevronRight,
  Activity,
  CheckCircle,
  Eye,
  XCircle,
  FileText,
  MapPin,
  ExternalLink,
  ShieldAlert,
  User as UserIcon,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPendingAdmissionPoints,
  updateAdmissionPointStatus,
} from "../../api/admissionPoint.api";
import {
  getPendingEligibility,
  reviewApplication,
} from "../../api/student.api";
import { getAdminDashboardStats } from "../../api/admin.api";
import { handleFormError } from "../../utils/handleFormError";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../../redux/alertSlice";
import { ReviewModal } from "../../components/students/ReviewModal";

const COURSE_LABELS = {
  uiux: "Advanced UI/UX Design",
  fsd: "Full Stack Web Dev",
  ds: "Data Science & AI",
  dm: "Digital Marketing",
};

const ENROLLMENT_GOAL = 500;

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [pendingPoints, setPendingPoints] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const [approveWarningId, setApproveWarningId] = useState(null);
  const [rejectWarningId, setRejectWarningId] = useState(null);
  const [viewDetailsPoint, setViewDetailsPoint] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectRemark, setRejectRemark] = useState("");
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedHalf, setSelectedHalf] = useState(
    new Date().getMonth() < 6 ? "H1" : "H2",
  );

  useEffect(() => {
    fetchAllData();
  }, [selectedYear, selectedHalf]);

  const fetchAllData = async () => {
    setLoadingStats(true);
    try {
      const [statsRes, partnersRes, appsRes] = await Promise.all([
        getAdminDashboardStats(selectedYear, selectedHalf),
        getPendingAdmissionPoints(),
        getPendingEligibility(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (partnersRes.success) setPendingPoints(partnersRes.data);
      if (appsRes.success) setPendingApplications(appsRes.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setLoadingApps(false);
      setLoadingStats(false);
    }
  };

  const confirmApprove = async () => {
    if (!approveWarningId) return;
    const id = approveWarningId;
    setApproveWarningId(null);

    // Optimistic UI Removal
    setPendingPoints((prev) => prev.filter((p) => p._id !== id));
    try {
      const response = await updateAdmissionPointStatus(id, "approved");
      if (!response.success) {
        console.error("Failed to approve admission point", response.message);
      }

      dispatch(
        showAlert({
          type: "success",
          message: response.message || "Admission Point Approved Successfully!",
        }),
      );
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const confirmReject = async () => {
    if (!rejectWarningId) return;
    const id = rejectWarningId;
    setRejectWarningId(null);

    // Optimistic UI Removal
    setPendingPoints((prev) => prev.filter((p) => p._id !== id));
    try {
      const response = await updateAdmissionPointStatus(id, "rejected");
      if (!response.success) {
        console.error("Failed to reject admission point", response.message);
      }

      dispatch(
        showAlert({
          type: "success",
          message: response.message || "Admission Point Rejected Successfully!",
        }),
      );
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const handleEligibilityApprove = async (id) => {
    setApprovingId(id);
    try {
      const res = await reviewApplication(id, "approve");
      if (res.success) {
        setPendingApplications((prev) => prev.filter((a) => a._id !== id));
        dispatch(
          showAlert({
            type: "success",
            message: "Application approved — student is now Eligible!",
          }),
        );
      }
    } catch (err) {
      handleFormError(err, null, dispatch, navigate);
    } finally {
      setApprovingId(null);
    }
  };

  const handleEligibilityRejectConfirm = async () => {
    if (!rejectTarget || !rejectRemark.trim()) return;
    setRejectingId(rejectTarget);
    try {
      const res = await reviewApplication(rejectTarget, "reject", rejectRemark);
      if (res.success) {
        setPendingApplications((prev) =>
          prev.filter((a) => a._id !== rejectTarget),
        );
        setRejectTarget(null);
        setRejectRemark("");
        dispatch(
          showAlert({
            type: "success",
            message: "Application rejected with remarks.",
          }),
        );
      }
    } catch (err) {
      handleFormError(err, null, dispatch, navigate);
    } finally {
      setRejectingId(null);
    }
  };

  const {
    summary = {},
    revenueData = [],
    enrollmentData = [],
    applicationData = [],
  } = stats || {};

  const isManager = user?.role === "manager";

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">
              System Overview
            </h2>
            <p className="text-muted-foreground font-medium">
              Real-time statistics and enrollment management
            </p>
          </div>
          {/* <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary border border-primary/20 font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              Growth Target: 500
            </div>
          </div> */}
        </div>

        {/* Real Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="New Applications"
            value={loadingApps ? "..." : pendingApplications.length}
            icon={FileText}
            subtext="Eligibility review queue"
            color="blue"
            onClick={() => navigate("/dashboard/eligibility-queue")}
          />
          <StatCard
            title="Total Students"
            value={loadingStats ? "..." : summary.totalStudents || 0}
            icon={Users}
            subtext="Active & Eligible Students"
            color="purple"
            onClick={() => navigate("/dashboard/student-management")}
          />
          <StatCard
            title="Active Partners"
            value={loadingStats ? "..." : summary.totalPartners || 0}
            icon={Building2}
            subtext="Verified Admission Points"
            color="emerald"
            onClick={() => navigate("/dashboard/partner-management")}
          />
          <StatCard
            title="Active Tickets"
            value={loadingStats ? "..." : summary.activeTicketsCount || 0}
            icon={MessageSquare}
            subtext="Open support requests"
            color="rose"
            onClick={() => navigate("/dashboard/tickets")}
          />
        </div>

        {/* Rich Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Area Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-4 sm:p-8 shadow-sm flex flex-col min-h-[400px]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-xl font-black">
                  {isManager ? "Applications Activity" : "Revenue Performance"}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  {isManager
                    ? "Monthly submission trends"
                    : "Monthly collection trends"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-muted transition-colors"
                >
                  {[0, 1, 2, 3].map((i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    );
                  })}
                </select>
                <select
                  value={selectedHalf}
                  onChange={(e) => setSelectedHalf(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-muted transition-colors"
                >
                  <option value="H1">Jan to June</option>
                  <option value="H2">July to Dec</option>
                </select>
              </div>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={isManager ? applicationData : revenueData}>
                  <defs>
                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={isManager ? "#3b82f6" : "var(--primary)"}
                        stopOpacity={0.1}
                      />
                      <stop
                        offset="95%"
                        stopColor={isManager ? "#3b82f6" : "var(--primary)"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    tickFormatter={(val) =>
                      isManager ? val : `₹${val / 1000}k`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "1rem",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ fontWeight: 800, marginBottom: "0.25rem" }}
                  />
                  <Area
                    type="monotone"
                    dataKey={isManager ? "apps" : "revenue"}
                    stroke={isManager ? "#3b82f6" : "var(--primary)"}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMain)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Enrollment Status Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-[2.5rem] p-4 sm:p-8 shadow-sm flex flex-col min-h-[400px]"
          >
            <div className="mb-8">
              <h3 className="text-xl font-black">Enrollment Activity</h3>
              <p className="text-sm text-muted-foreground font-medium">
                New eligible students
              </p>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "var(--primary)", opacity: 0.05 }}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "1rem",
                    }}
                  />
                  <Bar dataKey="students" radius={[6, 6, 0, 0]} barSize={30}>
                    {enrollmentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill="var(--primary)"
                        fillOpacity={0.4 + index * 0.12}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                <span>Enrollment Goal ({ENROLLMENT_GOAL})</span>
                <span>
                  {stats
                    ? summary.totalStudents === 0
                      ? "0%"
                      : (summary.totalStudents / ENROLLMENT_GOAL) * 100 < 1
                        ? (
                            (summary.totalStudents / ENROLLMENT_GOAL) *
                            100
                          ).toFixed(1) + "%"
                        : Math.round(
                            (summary.totalStudents / ENROLLMENT_GOAL) * 100,
                          ) + "%"
                    : "0%"}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${stats ? Math.min((summary.totalStudents / ENROLLMENT_GOAL) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Complex Data Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Pending Admission Points Table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card border border-border rounded-xl shadow-sm flex flex-col"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-purple-500" />
                  <span>Pending Partnerships</span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Admission points awaiting approval
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/partner-management")}
                className="text-sm font-medium text-purple-500 hover:text-purple-400 transition-colors bg-purple-500/10 px-3 py-1.5 rounded-lg flex items-center"
              >
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Center Name
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan="3">
                        <div className="px-6 py-8 text-center text-muted-foreground">
                          Loading pending requests...
                        </div>
                      </td>
                    </tr>
                  ) : pendingPoints.length === 0 ? (
                    <tr>
                      <td colSpan="3">
                        <div className="px-6 py-8 text-center text-muted-foreground flex flex-col items-center">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                            <Activity className="w-6 h-6 text-muted-foreground/50" />
                          </div>
                          No pending admission points.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendingPoints.slice(0, 5).map((point, idx) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={point._id}
                        className="hover:bg-muted/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">
                            {point.centerName}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {point.licenseeEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(
                            point.createdAt || new Date(),
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewDetailsPoint(point)}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 hover:border-blue-500 transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pending Eligibility Table */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card border border-border rounded-xl shadow-sm flex flex-col"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>Eligibility Review Queue</span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Applications awaiting eligibility decision
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/eligibility-queue")}
                className="text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors bg-amber-500/10 px-3 py-1.5 rounded-lg flex items-center"
              >
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Course / University
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingApps ? (
                    <tr>
                      <td colSpan="3">
                        <div className="px-6 py-8 text-center text-muted-foreground">
                          Loading review queue...
                        </div>
                      </td>
                    </tr>
                  ) : pendingApplications.length === 0 ? (
                    <tr>
                      <td colSpan="3">
                        <div className="px-6 py-8 text-center text-muted-foreground flex flex-col items-center">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                            <CheckCircle className="w-6 h-6 text-emerald-500/50" />
                          </div>
                          All caught up! No pending applications.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendingApplications.slice(0, 5).map((app, idx) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={app._id}
                        className="hover:bg-muted/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground text-sm">
                            {app.name}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {app.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground truncate max-w-[150px]">
                            {app.program?.name || app.course || "N/A"}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {app.university?.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setIsReviewModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 transition-all duration-200"
                              title="Review & Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setRejectTarget(app._id);
                                setRejectRemark("");
                              }}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all duration-200"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loadingApps && pendingApplications.length > 0 && (
              <div className="px-6 py-3.5 border-t border-border bg-muted/20 text-sm text-muted-foreground">
                {pendingApplications.length} application
                {pendingApplications.length !== 1 ? "s" : ""} pending
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Reject Eligibility Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setRejectTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border"
            >
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-xl font-bold text-foreground">
                  Reject Application
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Provide a remark explaining the rejection. The partner will see
                this before re-submitting.
              </p>
              <div className="space-y-1.5 mb-6">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Admin Remark{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                  placeholder="Explain why this application is being rejected..."
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm resize-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEligibilityRejectConfirm}
                  disabled={
                    !rejectRemark.trim() || rejectingId === rejectTarget
                  }
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {rejectingId === rejectTarget ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> Confirm Rejection
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve Warning Modal */}
      <AnimatePresence>
        {approveWarningId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setApproveWarningId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border flex flex-col"
            >
              <div className="flex items-center space-x-3 text-amber-500 mb-4">
                <Activity className="w-6 h-6" />
                <h3 className="text-xl font-bold text-foreground">
                  Confirm Approval
                </h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to approve this admission point? This will
                grant them active status and access into the partners portal.
              </p>
              <div className="flex items-center justify-end space-x-3 mt-auto">
                <button
                  onClick={() => setApproveWarningId(null)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium text-sm flex items-center space-x-2 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Yes, Approve</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Reject Warning Modal */}
      <AnimatePresence>
        {rejectWarningId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setRejectWarningId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border flex flex-col"
            >
              <div className="flex items-center space-x-3 text-red-500 mb-4">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-xl font-bold text-foreground">
                  Confirm Rejection
                </h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to permanently reject this admission
                point? This action cannot be undone and they will not be granted
                portal access.
              </p>
              <div className="flex items-center justify-end space-x-3 mt-auto">
                <button
                  onClick={() => setRejectWarningId(null)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium text-sm flex items-center space-x-2 shadow-sm"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Yes, Reject</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewDetailsPoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm"
            onClick={() => setViewDetailsPoint(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl border border-border flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-500" />
                    {viewDetailsPoint.centerName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Submitted on{" "}
                    {new Date(
                      viewDetailsPoint.createdAt || new Date(),
                    ).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setViewDetailsPoint(null)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors border border-transparent hover:border-border"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {/* General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                      <UserIcon className="w-4 h-4 text-purple-500" />
                      Licensee Details
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">
                          Full Name
                        </span>
                        <span className="font-medium">
                          {viewDetailsPoint.licenseeName}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">
                          Email Address
                        </span>
                        <span className="font-medium flex items-center gap-2 text-foreground/80">
                          <Mail className="w-3 h-3" />
                          {viewDetailsPoint.licenseeEmail}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">
                          Contact Number
                        </span>
                        <span className="font-medium flex items-center gap-2 text-foreground/80">
                          <Phone className="w-3 h-3" />
                          {viewDetailsPoint.licenseeContactNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      Geographic Location
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">
                          Address Line
                        </span>
                        <span className="font-medium">
                          {viewDetailsPoint.location?.address || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">
                          City & State
                        </span>
                        <span className="font-medium">
                          {viewDetailsPoint.location?.city || "N/A"},{" "}
                          {viewDetailsPoint.location?.state || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">
                          Country & Pincode
                        </span>
                        <span className="font-medium">
                          {viewDetailsPoint.location?.country || "N/A"} -{" "}
                          {viewDetailsPoint.location?.pincode || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Docs Link Grid */}
                {viewDetailsPoint.documents &&
                  Object.keys(viewDetailsPoint.documents).length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-border pb-2">
                        <FileText className="w-4 h-4 text-purple-500" />
                        Uploaded Documentation
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(viewDetailsPoint.documents).map(
                          ([key, value]) => {
                            if (
                              !value ||
                              (Array.isArray(value) && value.length === 0)
                            )
                              return null;
                            const docLabel = key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase());
                            const formatUrl = (path) =>
                              `${import.meta.env.VITE_BASE_URL}/${path.replace(/\\/g, "/")}`;

                            if (Array.isArray(value)) {
                              return value.map((photoUrl, i) => (
                                <a
                                  key={`${key}-${i}`}
                                  href={formatUrl(photoUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-background hover:bg-muted/50 hover:border-primary/50 transition-all text-center gap-2 group shadow-sm"
                                >
                                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                                    Office Photo {i + 1}
                                  </span>
                                </a>
                              ));
                            }

                            return (
                              <a
                                key={key}
                                href={formatUrl(value)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-background hover:bg-muted/50 hover:border-primary/50 transition-all text-center gap-2 group shadow-sm"
                              >
                                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                                  {docLabel}
                                </span>
                              </a>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-border bg-muted/30 flex gap-4 shrink-0">
                <button
                  onClick={() => {
                    setRejectWarningId(viewDetailsPoint._id);
                    setViewDetailsPoint(null);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 font-bold transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" /> Reject Application
                </button>
                <button
                  onClick={() => {
                    setApproveWarningId(viewDetailsPoint._id);
                    setViewDetailsPoint(null);
                  }}
                  className="flex-[2] py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
                >
                  <CheckCircle className="w-5 h-5" /> Approve Partnership
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        app={selectedApp}
        onApprove={handleEligibilityApprove}
        onReject={(app) => {
          setIsReviewModalOpen(false);
          setRejectTarget(app._id);
          setRejectRemark("");
        }}
        approvingId={approvingId}
      />
    </DashboardLayout>
  );
}
