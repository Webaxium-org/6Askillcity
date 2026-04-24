import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import {
  getApplicationById,
  updateApplication,
  submitApplication,
} from "../../api/student.api";
import { FollowupTimeline } from "../../components/students/FollowupTimeline";
import {
  ChevronLeft,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Save,
  Send,
  RotateCcw,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  MapPin,
  Edit2,
  MessageSquare,
  Trash2,
  Plus,
  RefreshCw,
  Tag,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────
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

const CATEGORY_COLORS = {
  general: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  document: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  eligibility: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  callback: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  other: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

// ── Form Field component ───────────────────────────────────────
function Field({ label, name, type = "text", value, onChange, placeholder, icon: Icon, readOnly }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm ${readOnly ? "opacity-60 cursor-not-allowed" : ""}`}
        />
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchApp = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getApplicationById(id);
      if (res.success) {
        setApp(res.data);
        setFormData({
          name: res.data.name || "",
          dob: res.data.dob ? res.data.dob.split("T")[0] : "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          qualification: res.data.qualification || "",
          course: res.data.course || "",
        });
      }
    } catch (err) {
      dispatch(showAlert({ type: "error", message: err.response?.data?.message || "Failed to load application." }));
      navigate("/dashboard/applications");
    } finally {
      setLoading(false);
    }
  }, [id, dispatch, navigate]);

  useEffect(() => { fetchApp(); }, [fetchApp]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((k) => payload.append(k, formData[k]));
      const res = await updateApplication(id, payload);
      if (res.success) {
        setApp(res.data);
        setEditing(false);
        dispatch(showAlert({ type: "success", message: "Application updated successfully!" }));
      }
    } catch (err) {
      dispatch(showAlert({ type: "error", message: err.response?.data?.message || "Update failed." }));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitApplication(id);
      if (res.success) {
        setApp(res.data);
        dispatch(showAlert({ type: "success", message: "Application submitted for eligibility review!" }));
      }
    } catch (err) {
      dispatch(showAlert({ type: "error", message: err.response?.data?.message || "Submission failed." }));
    } finally {
      setSubmitting(false);
    }
  };

  const canEdit = app && ["Draft", "Rejected"].includes(app.applicationStatus);
  const canSubmit = app && ["Draft", "Rejected"].includes(app.applicationStatus);

  if (loading) {
    return (
      <DashboardLayout title="Application Detail">
        <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading application...
        </div>
      </DashboardLayout>
    );
  }

  if (!app) return null;

  const cfg = STATUS_CONFIG[app.applicationStatus] || STATUS_CONFIG.Draft;
  const StatusIcon = cfg.icon;

  return (
    <DashboardLayout title="Application Detail">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Breadcrumb / Back */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate("/dashboard/applications")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Applications
          </button>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-2xl font-bold shrink-0">
              {app.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{app.name}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{app.email} · {app.phone}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${cfg.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {cfg.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(app.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchApp}
              className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {canEdit && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
            {canSubmit && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : app.applicationStatus === "Rejected" ? (
                  <><RotateCcw className="w-4 h-4" /> Re-submit</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit for Review</>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Rejection Banner */}
        {app.applicationStatus === "Rejected" && app.admin_remarks && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-500">Application Rejected — Admin Feedback</p>
              <p className="text-sm text-foreground/80 mt-1">{app.admin_remarks}</p>
              <p className="text-xs text-muted-foreground mt-2">Please address the feedback above, edit the application, and re-submit.</p>
            </div>
          </motion.div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* Left: Application Details Form */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-3 space-y-5"
          >
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Card accent bar */}
              <div className={`h-1 w-full ${app.applicationStatus === "Eligible" ? "bg-gradient-to-r from-emerald-500 to-teal-500" : app.applicationStatus === "Rejected" ? "bg-gradient-to-r from-red-500 to-rose-500" : app.applicationStatus === "Pending Eligibility" ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-blue-500 to-purple-500"}`} />
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Application Details
                  </h2>
                  {editing && (
                    <span className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md font-medium">
                      Editing Mode
                    </span>
                  )}
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                  {/* Personal section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-4">
                      Personal Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Full Legal Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Rahul Sharma" icon={User} readOnly={!editing} />
                      <Field label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} icon={Calendar} readOnly={!editing} />
                      <Field label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="rahul@example.com" icon={Mail} readOnly={!editing} />
                      <Field label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" icon={Phone} readOnly={!editing} />
                    </div>
                  </div>

                  {/* Academic section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-4">
                      Academic Path
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Qualification */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Highest Qualification</label>
                        <div className="relative">
                          <BookOpen className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          {editing ? (
                            <select
                              name="qualification"
                              value={formData.qualification}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary outline-none transition-all text-sm appearance-none"
                            >
                              <option value="" disabled>Select qualification</option>
                              <option value="12th">12th Grade / PUC</option>
                              <option value="diploma">Diploma</option>
                              <option value="bachelors">Bachelor's Degree</option>
                              <option value="masters">Master's Degree</option>
                            </select>
                          ) : (
                            <div className="pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm opacity-60">
                              {QUALIFICATION_LABELS[formData.qualification] || formData.qualification}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Course */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Course</label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          {editing ? (
                            <select
                              name="course"
                              value={formData.course}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary outline-none transition-all text-sm appearance-none"
                            >
                              <option value="" disabled>Assign a course</option>
                              <option value="uiux">Advanced UI/UX Design</option>
                              <option value="fsd">Full Stack Web Development</option>
                              <option value="ds">Data Science & AI</option>
                              <option value="dm">Digital Marketing Masterclass</option>
                            </select>
                          ) : (
                            <div className="pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm opacity-60">
                              {COURSE_LABELS[formData.course] || formData.course}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit action buttons */}
                  {editing && (
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setEditing(false); fetchApp(); }}
                        className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><Save className="w-4 h-4" /> Save Changes</>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* ID Proof */}
            {app.idProof && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2 mb-3 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Uploaded ID Proof
                </h3>
                <a
                  href={`${import.meta.env.VITE_BASE_URL || "http://localhost:4040"}/${app.idProof.replace(/\\/g, "/")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm transition-colors"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  View Uploaded Document
                </a>
              </div>
            )}
          </motion.div>

          {/* Right: Follow-up Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="xl:col-span-2 space-y-4"
          >
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold text-base flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-primary" />
                Follow-up Log
                <span className="ml-auto text-xs text-muted-foreground font-normal">Newest first</span>
              </h2>
              <FollowupTimeline studentId={id} canAdd={true} />
            </div>
          </motion.div>

        </div>
      </div>
    </DashboardLayout>
  );
}
