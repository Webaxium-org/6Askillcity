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
  Plus,
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPendingAdmissionPoints,
  updateAdmissionPointStatus,
} from "../../api/admissionPoint.api";
import { handleFormError } from "../../utils/handleFormError";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../../redux/alertSlice";

// Dummy Students Data
const DUMMY_STUDENTS = [
  {
    id: "STU-001",
    name: "Aarav Patel",
    course: "Web Development",
    status: "Active",
    date: "2026-04-20",
  },
  {
    id: "STU-002",
    name: "Priya Sharma",
    course: "Data Science",
    status: "Pending",
    date: "2026-04-19",
  },
  {
    id: "STU-003",
    name: "Rohan Gupta",
    course: "UI/UX Design",
    status: "Active",
    date: "2026-04-18",
  },
  {
    id: "STU-004",
    name: "Neha Singh",
    course: "Web Development",
    status: "Active",
    date: "2026-04-15",
  },
  {
    id: "STU-005",
    name: "Aditya Kumar",
    course: "Cloud Computing",
    status: "Graduated",
    date: "2026-04-10",
  },
];

export default function UserDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pendingPoints, setPendingPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approveWarningId, setApproveWarningId] = useState(null);
  const [rejectWarningId, setRejectWarningId] = useState(null);
  const [viewDetailsPoint, setViewDetailsPoint] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPendingAdmissionPoints();
        if (response.success) {
          setPendingPoints(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch pending admission points:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  return (
    <DashboardLayout title="Overview">
      <div className="space-y-8">
        {/* KPI Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Students"
            value="1,248"
            icon={Users}
            trend={12.5}
            subtext="vs last month"
            color="purple"
          />
          <StatCard
            title="Pending Partners"
            value={loading ? "..." : pendingPoints.length}
            icon={Clock}
            trend={-2.4}
            subtext="Requires review"
            color="rose"
          />
          <StatCard
            title="Active Centers"
            value="34"
            icon={Building2}
            trend={8.1}
            subtext="Across 12 cities"
            color="emerald"
          />
          <StatCard
            title="Live Courses"
            value="156"
            icon={BookOpen}
            trend={5.0}
            subtext="New added this week"
            color="blue"
          />
        </motion.div>

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
              <button className="text-sm font-medium text-purple-500 hover:text-purple-400 transition-colors bg-purple-500/10 px-3 py-1.5 rounded-lg flex items-center">
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
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewDetailsPoint(point);
                              }}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 hover:border-blue-500 transition-all duration-200 shadow-sm"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setApproveWarningId(point._id);
                              }}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 hover:border-emerald-500 transition-all duration-200 shadow-sm"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRejectWarningId(point._id);
                              }}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all duration-200 shadow-sm"
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
          </motion.div>

          {/* Dummy Students Table */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card border border-border rounded-xl shadow-sm flex flex-col"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>Recent Enrolls</span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Latest student registrations
                </p>
              </div>
              <button className="p-2 bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {DUMMY_STUDENTS.map((student, idx) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={student.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-foreground text-sm">
                              {student.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {student.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">
                          {student.course}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
                            student.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : student.status === "Pending"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-primary/10 text-primary border-primary/20",
                          )}
                        >
                          {student.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/20 text-center">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                View Full Roster
              </button>
            </div>
          </motion.div>
        </div>
      </div>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
