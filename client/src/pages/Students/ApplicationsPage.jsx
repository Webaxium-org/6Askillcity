import React, { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { useNavigate } from "react-router-dom";
import { getMyApplications, submitApplication } from "../../api/student.api";
import {
  FileText,
  Send,
  Eye,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  UserPlus,
  Bell,
} from "lucide-react";

// ── Status config ───────────────────────────────────────────────
const STATUS_CONFIG = {
  Draft: { color: "text-slate-500 bg-slate-500/10 border-slate-500/20", icon: FileText, label: "Draft" },
  "Pending Eligibility": { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock, label: "Pending Review" },
  Eligible: { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2, label: "Eligible" },
  Rejected: { color: "text-red-500 bg-red-500/10 border-red-500/20", icon: XCircle, label: "Rejected" },
};

const COURSE_LABELS = {
  uiux: "Advanced UI/UX Design",
  fsd: "Full Stack Web Development",
  ds: "Data Science & AI",
  dm: "Digital Marketing Masterclass",
};

const QUALIFICATION_LABELS = {
  "12th": "12th Grade / PUC",
  diploma: "Diploma",
  bachelors: "Bachelor's Degree",
  masters: "Master's Degree",
};

// ── Main Page ──────────────────────────────────────────────────
export default function ApplicationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittingId, setSubmittingId] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyApplications();
      if (res.success) setApplications(res.data);
    } catch {
      dispatch(showAlert({ type: "error", message: "Failed to load applications." }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleSubmit = async (app) => {
    setSubmittingId(app._id);
    try {
      const res = await submitApplication(app._id);
      if (res.success) {
        setApplications((prev) => prev.map((a) => (a._id === app._id ? res.data : a)));
        dispatch(showAlert({ type: "success", message: "Application submitted for eligibility review!" }));
      }
    } catch (err) {
      dispatch(showAlert({ type: "error", message: err.response?.data?.message || "Submission failed." }));
    } finally {
      setSubmittingId(null);
    }
  };

  const filtered = applications.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (COURSE_LABELS[a.course] || a.course).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canSubmit = (status) => ["Draft", "Rejected"].includes(status);

  return (
    <DashboardLayout title="My Applications">
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" />
              Applications
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Click <strong>View</strong> on any row to open the full detail page with editing and follow-up notes.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={fetchApplications}
              className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => navigate("/dashboard/student/add")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm font-medium text-sm"
            >
              <UserPlus className="w-4 h-4" />
              New Application
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full sm:max-w-xs rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
          />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Applicant", "Course", "Status", "Next Follow-up", "Actions"].map((h) => (
                    <th
                      key={h}
                      className={`px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${h === "Actions" ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Loading applications...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                          <FileText className="w-7 h-7 text-muted-foreground/50" />
                        </div>
                        <p className="font-medium">No applications found.</p>
                        <button
                          onClick={() => navigate("/dashboard/student/add")}
                          className="text-sm text-primary hover:underline"
                        >
                          Create your first application →
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((app, idx) => {
                    const cfg = STATUS_CONFIG[app.applicationStatus] || STATUS_CONFIG.Draft;
                    const StatusIcon = cfg.icon;
                    const isSubmitting = submittingId === app._id;

                    return (
                      <motion.tr
                        key={app._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => navigate(`/dashboard/applications/${app._id}`)}
                        className="hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        {/* Applicant */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                              {app.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{app.name}</div>
                              <div className="text-xs text-muted-foreground">{app.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Course */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-sm text-foreground">
                            {app.program?.name || app.course}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            {app.university?.name || "Other"}
                          </div>
                          {app.programFee && (
                            <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
                              Fee: ₹{app.programFee.totalFee.toLocaleString()}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <div className="space-y-1.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${cfg.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </div>
                        </td>

                        {/* Next Follow-up */}
                        <td className="px-5 py-4">
                          {app.nextFollowupDate ? (
                            <div className={`flex items-center gap-1.5 text-xs font-medium ${new Date(app.nextFollowupDate) < new Date() ? "text-red-500" : "text-amber-600"}`}>
                              <Bell className="w-3.5 h-3.5" />
                              {new Date(app.nextFollowupDate).toLocaleDateString([], { dateStyle: 'medium' })}
                              {new Date(app.nextFollowupDate) < new Date() && (
                                <span className="text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">Overdue</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No schedule</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/applications/${app._id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            {canSubmit(app.applicationStatus) && (
                              <button
                                onClick={() => handleSubmit(app)}
                                disabled={isSubmitting}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                              >
                                {isSubmitting ? (
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : app.applicationStatus === "Rejected" ? (
                                  <><RotateCcw className="w-3.5 h-3.5" /> Re-submit</>
                                ) : (
                                  <><Send className="w-3.5 h-3.5" /> Submit</>
                                )}
                              </button>
                            )}
                            {app.applicationStatus === "Pending Eligibility" && (
                              <span className="text-xs text-amber-500 italic">Under Review</span>
                            )}
                            {app.applicationStatus === "Eligible" && (
                              <span className="text-xs text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3.5 border-t border-border bg-muted/20 text-sm text-muted-foreground">
              Showing {filtered.length} of {applications.length} applications
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
