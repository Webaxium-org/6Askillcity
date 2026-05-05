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
  Loader2,
  ChevronRight,
  User,
  Users,
  GraduationCap,
} from "lucide-react";

// ── Status config ───────────────────────────────────────────────
const STATUS_CONFIG = {
  Draft: {
    color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    icon: FileText,
    label: "Draft",
  },
  Identity: {
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    icon: User,
    label: "Identity Filled",
  },
  Family: {
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    icon: Users,
    label: "Family Filled",
  },
  Academic: {
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    icon: GraduationCap,
    label: "Academic Filled",
  },
  "Pending Eligibility": {
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    icon: Clock,
    label: "Pending Review",
  },
  Eligible: {
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
    label: "Eligible",
  },
  Rejected: {
    color: "text-red-500 bg-red-500/10 border-red-500/20",
    icon: XCircle,
    label: "Rejected",
  },
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
  const [activeTab, setActiveTab] = useState("active");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyApplications();
      if (res.success) setApplications(res.data);
    } catch {
      dispatch(
        showAlert({ type: "error", message: "Failed to load applications." }),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSubmit = async (app) => {
    setSubmittingId(app._id);
    try {
      const res = await submitApplication(app._id);
      if (res.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === app._id ? res.data : a)),
        );
        dispatch(
          showAlert({
            type: "success",
            message: "Application submitted for eligibility review!",
          }),
        );
      }
    } catch (err) {
      dispatch(
        showAlert({
          type: "error",
          message: err.response?.data?.message || "Submission failed.",
        }),
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const filtered = applications.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.program?.name || a.course || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "draft")
      return ["Draft", "Identity", "Family", "Academic"].includes(
        a.applicationStatus,
      );
    if (activeTab === "rejected") return a.applicationStatus === "Rejected";
    // Active includes Pending Eligibility and Eligible
    return ["Pending Eligibility", "Eligible", "Completed"].includes(
      a.applicationStatus,
    );
  });

  const canSubmit = (status) =>
    ["Draft", "Identity", "Family", "Academic", "Rejected"].includes(status);

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
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Applications
            </h1>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">
              Management & Lifecycle Tracking
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={fetchApplications}
              className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => navigate("/dashboard/student/add")}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white hover:scale-105 transition-all shadow-lg font-black text-xs uppercase"
            >
              <UserPlus className="w-4 h-4" />
              New Application
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border p-1 bg-muted/20 rounded-2xl w-fit max-w-full overflow-x-auto flex-nowrap scrollbar-hide">
          {[
            { id: "active", label: "Applications", icon: Clock },
            { id: "draft", label: "Drafts", icon: FileText },
            { id: "rejected", label: "Rejected", icon: XCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const count = applications.filter((a) => {
              if (tab.id === "draft")
                return ["Draft", "Identity", "Family", "Academic"].includes(
                  a.applicationStatus,
                );
              if (tab.id === "rejected")
                return a.applicationStatus === "Rejected";
              return ["Pending Eligibility", "Eligible", "Completed"].includes(
                a.applicationStatus,
              );
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                  activeTab === tab.id
                    ? "bg-card text-primary shadow-sm border border-border"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label.toUpperCase()}
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${activeTab === tab.id ? "bg-primary/10" : "bg-muted"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3.5 w-full sm:max-w-sm rounded-[1.25rem] bg-card border border-border focus:border-primary/20 focus:bg-background outline-none text-sm transition-all shadow-sm font-bold"
          />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  {[
                    "Applicant",
                    "Course / University",
                    "Status",
                    "Schedule",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest ${h === "Actions" ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Loading Records...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-muted/50 flex items-center justify-center">
                          <FileText className="w-8 h-8 opacity-20" />
                        </div>
                        <div>
                          <p className="font-black text-xs uppercase tracking-widest">
                            No Records Found
                          </p>
                          <p className="text-[10px] font-bold mt-1">
                            Try adjusting your search or filter.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((app, idx) => {
                    const cfg =
                      STATUS_CONFIG[app.applicationStatus] ||
                      STATUS_CONFIG.Draft;
                    const StatusIcon = cfg.icon;
                    const isSubmitting = submittingId === app._id;

                    return (
                      <motion.tr
                        key={app._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => {
                          if (
                            ["Draft", "Identity", "Family", "Academic"].includes(
                              app.applicationStatus,
                            )
                          ) {
                            navigate(`/dashboard/student/edit/${app._id}`);
                          } else {
                            navigate(`/dashboard/applications/${app._id}`);
                          }
                        }}
                        className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      >
                        {/* Applicant */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-muted border border-border flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                              {app.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-black text-sm tracking-tight">
                                {app.name}
                              </div>
                              <div className="text-[10px] font-bold text-muted-foreground">
                                {app.email || "No Email Provided"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Course */}
                        <td className="px-6 py-5">
                          <div className="font-black text-xs tracking-tight text-foreground">
                            {app.program?.name || app.course || "N/A"}
                          </div>
                          <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">
                            {app.university?.name || "University Not Selected"}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${cfg.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>

                        {/* Schedule */}
                        <td className="px-6 py-5">
                          {app.nextFollowupDate ? (
                            <div
                              className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${new Date(app.nextFollowupDate) < new Date() ? "text-rose-500" : "text-amber-500"}`}
                            >
                              <Bell className="w-3.5 h-3.5" />
                              {new Date(
                                app.nextFollowupDate,
                              ).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest italic">
                              No Task
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td
                          className="px-6 py-5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            {["Draft", "Identity", "Family", "Academic"].includes(
                              app.applicationStatus,
                            ) ? (
                              <button
                                onClick={() =>
                                  navigate(`/dashboard/student/edit/${app._id}`)
                                }
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-[10px] font-black uppercase hover:scale-105 transition-all shadow-sm"
                              >
                                Continue <ChevronRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  navigate(`/dashboard/applications/${app._id}`)
                                }
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted text-[10px] font-black uppercase transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
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
            <div className="px-6 py-4 border-t border-border bg-muted/5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Displaying {filtered.length} of {applications.length} Student
              Records
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
