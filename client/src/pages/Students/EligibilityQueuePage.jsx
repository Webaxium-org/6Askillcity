import React, { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { getPendingEligibility, reviewApplication } from "../../api/student.api";
import { FollowupTimeline } from "../../components/students/FollowupTimeline";
import { ReviewModal } from "../../components/students/ReviewModal";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Search,
  RefreshCw,
  Building2,
  MessageSquare,
  X,
  ShieldAlert,
  User,
  Users,
  Mail,
  Phone,
  CalendarDays,
  BookOpen,
  MapPin,
} from "lucide-react";

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

// ── Reject Modal with remark input ─────────────────────────────
function RejectModal({ app, onClose, onConfirm }) {
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!remark.trim()) return;
    setSubmitting(true);
    await onConfirm(app._id, remark);
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
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
          <h3 className="text-xl font-bold text-foreground">Reject Application</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Rejecting <span className="font-semibold text-foreground">{app.name}</span>'s application. The partner will be notified and will see your remark before re-submitting.
        </p>

        <div className="space-y-1.5 mb-6">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Admin Remark <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Explain why this application is being rejected..."
            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm resize-none"
            autoFocus
          />
          {!remark.trim() && (
            <p className="text-xs text-red-500">A remark is required.</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!remark.trim() || submitting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><XCircle className="w-4 h-4" /> Confirm Rejection</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Application Detail Side Panel ──────────────────────────────
// DetailPanel is replaced by ReviewModal

// ── Main Page ──────────────────────────────────────────────────
export default function EligibilityQueuePage() {
  const dispatch = useDispatch();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingEligibility();
      if (res.success) setApplications(res.data);
    } catch {
      dispatch(showAlert({ type: "error", message: "Failed to load review queue." }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const res = await reviewApplication(id, "approve");
      if (res.success) {
        setApplications((prev) => prev.filter((a) => a._id !== id));
        if (selectedApp?._id === id) setSelectedApp(null);
        dispatch(showAlert({ type: "success", message: "Application approved — student is now Eligible!" }));
      }
    } catch (err) {
      dispatch(showAlert({ type: "error", message: err.response?.data?.message || "Approval failed." }));
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectConfirm = async (id, remark) => {
    try {
      const res = await reviewApplication(id, "reject", remark);
      if (res.success) {
        setApplications((prev) => prev.filter((a) => a._id !== id));
        if (selectedApp?._id === id) setSelectedApp(null);
        setRejectTarget(null);
        dispatch(showAlert({ type: "success", message: "Application rejected with remarks." }));
      }
    } catch (err) {
      dispatch(showAlert({ type: "error", message: err.response?.data?.message || "Rejection failed." }));
    }
  };

  const filtered = applications.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.registeredBy?.centerName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Eligibility Review Queue">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-500" />
              Eligibility Review Queue
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Review student applications submitted by partners for eligibility.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-sm font-semibold">
              {applications.length} pending
            </span>
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by applicant or partner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full sm:max-w-xs rounded-xl bg-card border border-border focus:border-primary outline-none text-sm transition-all"
          />
        </div>

        {/* Queue Table */}
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
                  {["Applicant", "Course", "Submitted By", "Date", "Actions"].map((h) => (
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
                        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        Loading review queue...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                          <FileText className="w-7 h-7 text-muted-foreground/40" />
                        </div>
                        <p className="font-medium">No applications pending review.</p>
                        <p className="text-xs">All caught up! 🎉</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((app, idx) => (
                    <motion.tr
                      key={app._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`hover:bg-muted/40 transition-colors cursor-pointer ${selectedApp?._id === app._id ? "bg-amber-500/5" : ""}`}
                      onClick={() => setSelectedApp(app)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{app.name}</div>
                            <div className="text-xs text-muted-foreground">{app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-foreground truncate max-w-[150px]">
                          {app.program?.name || app.course || "N/A"}
                        </div>
                        <div className="text-[10px] text-primary/70 font-bold uppercase tracking-tight truncate max-w-[150px]">
                          {app.branch?.name || "N/A"}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {app.university?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {app.registeredBy ? (
                          <div>
                            <div className="text-sm font-medium">{app.registeredBy.centerName}</div>
                            <div className="text-xs text-muted-foreground">{app.registeredBy.licenseeEmail}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {app.applicationSubmittedDate 
                          ? new Date(app.applicationSubmittedDate).toLocaleDateString() 
                          : "N/A"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setRejectTarget(app)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 text-xs font-medium transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button
                            onClick={() => {
                               setSelectedApp(app);
                               setIsReviewModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-all shadow-sm"
                          >
                             <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3.5 border-t border-border bg-muted/20 text-sm text-muted-foreground">
              {filtered.length} application{filtered.length !== 1 ? "s" : ""} awaiting review
            </div>
          )}
        </motion.div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        app={selectedApp}
        onApprove={handleApprove}
        onReject={(app) => {
          setIsReviewModalOpen(false);
          setRejectTarget(app);
        }}
        approvingId={approvingId}
      />

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            app={rejectTarget}
            onClose={() => setRejectTarget(null)}
            onConfirm={handleRejectConfirm}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
