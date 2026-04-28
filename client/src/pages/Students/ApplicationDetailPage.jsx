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
import {
  getUniversities,
  getPrograms,
  getProgramFees,
} from "../../api/university.api";
import { getMyProfile } from "../../api/partner.api";
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
  Building2,
  GraduationCap,
  BadgeDollarSign,
  Hash,
  Baby,
  Users,
  School,
  ShieldCheck,
  Briefcase,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────
const STATUS_CONFIG = {
  Draft: {
    color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    icon: FileText,
    label: "Draft",
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

const CATEGORY_COLORS = {
  general: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  document: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  eligibility: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  callback: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  other: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

// ── Form Field component ───────────────────────────────────────
function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  readOnly,
  options,
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-muted-foreground/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
        )}
        {options && !readOnly ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary outline-none transition-all text-sm appearance-none font-medium`}
          >
            <option value="">Select {label}</option>
            {options.map((opt, idx) => {
              const optLabel = typeof opt === "object" ? opt.label : opt;
              const optValue = typeof opt === "object" ? opt.value : opt;
              return (
                <option key={idx} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium ${readOnly ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        )}
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
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [fees, setFees] = useState([]);
  const [myPermissions, setMyPermissions] = useState({
    universities: [],
    programs: [],
  });

  const fetchApp = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getApplicationById(id);
      if (res.success) {
        setApp(res.data);
        setFormData({
          name: res.data.name || "",
          dob: res.data.dob ? res.data.dob.split("T")[0] : "",
          gender: res.data.gender || "",
          religion: res.data.religion || "",
          caste: res.data.caste || "",
          country: res.data.country || "",
          address: res.data.address || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          alternativePhone: res.data.alternativePhone || "",
          otherPhone: res.data.otherPhone || "",
          fatherName: res.data.fatherName || "",
          motherName: res.data.motherName || "",
          fatherPhone: res.data.fatherPhone || "",
          motherPhone: res.data.motherPhone || "",
          university: res.data.university?._id || res.data.university || "",
          program: res.data.program?._id || res.data.program || "",
          completionYear: res.data.completionYear || "",
          highestQualification: res.data.highestQualification || "Plus Two",
          tenthCompletionYear: res.data.tenth?.completionYear || "",
          tenthBoard: res.data.tenth?.board || "",
          tenthTotalMarks: res.data.tenth?.totalMarks || "",
          tenthObtainedMarks: res.data.tenth?.obtainedMarks || "",
          tenthPercentage: res.data.tenth?.percentage || "",
          plusTwoCompletionYear: res.data.plusTwo?.completionYear || "",
          plusTwoBoard: res.data.plusTwo?.board || "",
          plusTwoPercentage: res.data.plusTwo?.percentage || "",
          bachelorsUniversity: res.data.bachelors?.university || "",
          bachelorsCourse: res.data.bachelors?.course || "",
          bachelorsBranch: res.data.bachelors?.branch || "",
          bachelorsPapersPassed: res.data.bachelors?.papersPassed || "",
          bachelorsPapersEqualised: res.data.bachelors?.papersEqualised || "",
          mastersUniversity: res.data.masters?.university || "",
          mastersCourse: res.data.masters?.course || "",
          mastersBranch: res.data.masters?.branch || "",
          mastersPapersPassed: res.data.masters?.papersPassed || "",
          mastersPapersEqualised: res.data.masters?.papersEqualised || "",
          videoKycStatus: res.data.videoKycStatus || "Pending",
          employmentStatus: res.data.employmentStatus || "Unemployed",
        });
      }
    } catch (err) {
      dispatch(
        showAlert({
          type: "error",
          message: err.response?.data?.message || "Failed to load application.",
        }),
      );
      navigate("/dashboard/applications");
    } finally {
      setLoading(false);
    }
  }, [id, dispatch, navigate]);

  useEffect(() => {
    fetchApp();
  }, [fetchApp]);

  useEffect(() => {
    const fetchSupportData = async () => {
      try {
        const profile = await getMyProfile();
        if (profile.success) {
          const perms = profile.data.permissions;
          const allowedUniIds = perms
            .filter((p) => p.type === "university")
            .map((p) => p.universityId?._id || p.universityId);
          const allowedProgIds = perms
            .filter((p) => p.type === "program")
            .map((p) => p.programId?._id || p.programId);

          setMyPermissions({
            universities: allowedUniIds,
            programs: allowedProgIds,
          });

          const [uniRes, progRes] = await Promise.all([
            getUniversities(),
            getPrograms(),
          ]);

          if (uniRes.success) {
            setUniversities(
              uniRes.data.filter((u) => allowedUniIds.includes(u._id)),
            );
          }
          if (progRes.success) {
            setPrograms(
              progRes.data.filter((p) => allowedProgIds.includes(p._id)),
            );
          }
        }
      } catch (error) {
        console.error("Error fetching support data", error);
      }
    };
    fetchSupportData();
  }, []);

  useEffect(() => {
    if (formData.program) {
      getProgramFees(formData.program).then((res) => {
        if (res.success) {
          const current = res.data.find((f) => f.isCurrent);
          if (!current) {
            dispatch(
              showAlert({
                type: "error",
                message: "Program fee is empty, please contact the admin",
              }),
            );
            setFormData((p) => ({ ...p, program: "" }));
          } else {
            setFees(res.data);
          }
        }
      });
    } else {
      setFees([]);
    }
  }, [formData.program, dispatch]);

  useEffect(() => {
    const total = parseFloat(formData.tenthTotalMarks);
    const obtained = parseFloat(formData.tenthObtainedMarks);
    if (total > 0 && obtained >= 0) {
      const percentage = ((obtained / total) * 100).toFixed(2);
      setFormData((prev) => ({ ...prev, tenthPercentage: percentage }));
    }
  }, [formData.tenthTotalMarks, formData.tenthObtainedMarks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => {
      const next = { ...p, [name]: value };
      if (name === "university") {
        next.program = "";
      }
      return next;
    });
  };

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
        dispatch(
          showAlert({
            type: "success",
            message: "Application updated successfully!",
          }),
        );
      }
    } catch (err) {
      dispatch(
        showAlert({
          type: "error",
          message: err.response?.data?.message || "Update failed.",
        }),
      );
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
      setSubmitting(false);
    }
  };

  const canEdit = app && ["Draft", "Rejected"].includes(app.applicationStatus);
  const canSubmit =
    app && ["Draft", "Rejected"].includes(app.applicationStatus);

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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
              <p className="text-muted-foreground text-sm mt-0.5">
                {app.email} · {app.phone}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${cfg.color}`}
                >
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
                  <>
                    <RotateCcw className="w-4 h-4" /> Re-submit
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit for Review
                  </>
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
              <p className="text-sm font-semibold text-red-500">
                Application Rejected — Admin Feedback
              </p>
              <p className="text-sm text-foreground/80 mt-1">
                {app.admin_remarks}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Please address the feedback above, edit the application, and
                re-submit.
              </p>
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
            // className="xl:col-span-3 space-y-5"
            className="xl:col-span-4 space-y-5"
          >
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Card accent bar */}
              <div
                className={`h-1 w-full ${app.applicationStatus === "Eligible" ? "bg-gradient-to-r from-emerald-500 to-teal-500" : app.applicationStatus === "Rejected" ? "bg-gradient-to-r from-red-500 to-rose-500" : app.applicationStatus === "Pending Eligibility" ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-blue-500 to-purple-500"}`}
              />
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

                <form onSubmit={handleSave} className="space-y-8">
                  {/* Profile Identity section */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b border-border pb-2">
                      <User className="w-3.5 h-3.5" /> Profile Identity
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Field
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Rahul Sharma"
                        icon={User}
                        readOnly={!editing}
                      />
                      <Field
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                        icon={Calendar}
                        readOnly={!editing}
                      />
                      <Field
                        label="Gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        options={["Male", "Female", "Other"]}
                        icon={Baby}
                        readOnly={!editing}
                      />
                      <Field
                        label="Religion"
                        name="religion"
                        value={formData.religion}
                        onChange={handleChange}
                        readOnly={!editing}
                      />
                      <Field
                        label="Caste"
                        name="caste"
                        value={formData.caste}
                        onChange={handleChange}
                        readOnly={!editing}
                      />
                      <Field
                        label="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        icon={MapPin}
                        readOnly={!editing}
                      />
                      <Field
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="rahul@example.com"
                        icon={Mail}
                        readOnly={!editing}
                      />
                      <Field
                        label="Primary Phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        icon={Phone}
                        readOnly={!editing}
                      />
                      <Field
                        label="Alternative Phone"
                        name="alternativePhone"
                        type="tel"
                        value={formData.alternativePhone}
                        onChange={handleChange}
                        icon={Phone}
                        readOnly={!editing}
                      />
                      <Field
                        label="Other Phone"
                        name="otherPhone"
                        type="tel"
                        value={formData.otherPhone}
                        onChange={handleChange}
                        icon={Phone}
                        readOnly={!editing}
                      />
                      <div className="sm:col-span-2">
                        <Field
                          label="Permanent Address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          icon={MapPin}
                          readOnly={!editing}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Family Details */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-500 flex items-center gap-2 border-b border-border pb-2">
                      <Users className="w-3.5 h-3.5" /> Family Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Father's Name"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                        icon={User}
                        readOnly={!editing}
                      />
                      <Field
                        label="Father's Phone"
                        name="fatherPhone"
                        value={formData.fatherPhone}
                        onChange={handleChange}
                        icon={Phone}
                        readOnly={!editing}
                      />
                      <Field
                        label="Mother's Name"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleChange}
                        icon={User}
                        readOnly={!editing}
                      />
                      <Field
                        label="Mother's Phone"
                        name="motherPhone"
                        value={formData.motherPhone}
                        onChange={handleChange}
                        icon={Phone}
                        readOnly={!editing}
                      />
                    </div>
                  </div>

                  {/* Academic History */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2 border-b border-border pb-2">
                      <GraduationCap className="w-3.5 h-3.5" /> Academic History
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Highest Qualification"
                        name="highestQualification"
                        value={formData.highestQualification}
                        onChange={handleChange}
                        options={["Plus Two", "Bachelors", "Masters"]}
                        icon={GraduationCap}
                        readOnly={!editing}
                      />
                    </div>

                    {/* 10th Standard */}
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        10th Standard / SSLC
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field
                          label="Completion Year"
                          name="tenthCompletionYear"
                          value={formData.tenthCompletionYear}
                          onChange={handleChange}
                          icon={Calendar}
                          readOnly={!editing}
                        />
                        <Field
                          label="Board"
                          name="tenthBoard"
                          value={formData.tenthBoard}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                        <Field
                          label="Total Marks"
                          name="tenthTotalMarks"
                          type="number"
                          value={formData.tenthTotalMarks}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                        <Field
                          label="Obtained Marks"
                          name="tenthObtainedMarks"
                          type="number"
                          value={formData.tenthObtainedMarks}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                        <Field
                          label="Percentage"
                          name="tenthPercentage"
                          value={formData.tenthPercentage}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                      </div>
                    </div>

                    {/* Plus Two */}
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                        Plus Two
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field
                          label="Completion Year"
                          name="plusTwoCompletionYear"
                          value={formData.plusTwoCompletionYear}
                          onChange={handleChange}
                          icon={Calendar}
                          readOnly={!editing}
                        />
                        <Field
                          label="Board"
                          name="plusTwoBoard"
                          value={formData.plusTwoBoard}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                        <Field
                          label="Percentage"
                          name="plusTwoPercentage"
                          value={formData.plusTwoPercentage}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                      </div>
                    </div>

                    {/* Bachelors */}
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                        Bachelors
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field
                          label="University"
                          name="bachelorsUniversity"
                          value={formData.bachelorsUniversity}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                        <Field
                          label="Course"
                          name="bachelorsCourse"
                          value={formData.bachelorsCourse}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                        <Field
                          label="Branch"
                          name="bachelorsBranch"
                          value={formData.bachelorsBranch}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                        <Field
                          label="Papers Passed"
                          name="bachelorsPapersPassed"
                          type="number"
                          value={formData.bachelorsPapersPassed}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                        <Field
                          label="Equalised"
                          name="bachelorsPapersEqualised"
                          type="number"
                          value={formData.bachelorsPapersEqualised}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                      </div>
                    </div>

                    {/* Masters */}
                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-4">
                      <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                        Masters
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field
                          label="University"
                          name="mastersUniversity"
                          value={formData.mastersUniversity}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                        <Field
                          label="Course"
                          name="mastersCourse"
                          value={formData.mastersCourse}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                        <Field
                          label="Branch"
                          name="mastersBranch"
                          value={formData.mastersBranch}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                        <Field
                          label="Papers Passed"
                          name="mastersPapersPassed"
                          type="number"
                          value={formData.mastersPapersPassed}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                        <Field
                          label="Equalised"
                          name="mastersPapersEqualised"
                          type="number"
                          value={formData.mastersPapersEqualised}
                          onChange={handleChange}
                          readOnly={!editing}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enrollment selection */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2 border-b border-border pb-2">
                      <Briefcase className="w-3.5 h-3.5" /> Enrollment Selection
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* University Selection */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          University
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-muted-foreground/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          {editing ? (
                            <select
                              name="university"
                              value={formData.university}
                              onChange={handleChange}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary outline-none transition-all text-sm appearance-none font-medium"
                            >
                              <option value="">Select University</option>
                              {universities.map((u) => (
                                <option key={u._id} value={u._id}>
                                  {u.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm font-medium opacity-60">
                              {app.university?.name || "Not assigned"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Program Selection */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          Program
                        </label>
                        <div className="relative">
                          <GraduationCap className="w-4 h-4 text-muted-foreground/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          {editing ? (
                            <select
                              name="program"
                              value={formData.program}
                              onChange={handleChange}
                              disabled={!formData.university}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary outline-none transition-all text-sm appearance-none disabled:opacity-50 font-medium"
                            >
                              <option value="">Select Program</option>
                              {programs
                                .filter(
                                  (p) =>
                                    p.university?._id === formData.university ||
                                    p.university === formData.university,
                                )
                                .map((p) => (
                                  <option key={p._id} value={p._id}>
                                    {p.name}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <div className="pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm font-medium opacity-60">
                              {app.program?.name || "Not assigned"}
                            </div>
                          )}
                        </div>
                      </div>

                      <Field
                        label="Completion Year"
                        name="completionYear"
                        value={formData.completionYear}
                        onChange={handleChange}
                        icon={Calendar}
                        readOnly={!editing}
                      />
                    </div>

                    {/* Display current fee info if program selected */}
                    {formData.program && fees.find((f) => f.isCurrent) && (
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <BadgeDollarSign className="w-3.5 h-3.5" /> Total
                            Program Fee
                          </span>
                          <span className="text-sm font-black text-blue-600">
                            ₹{fees.find((f) => f.isCurrent).totalFee}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compliance */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2 border-b border-border pb-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> Compliance
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Video KYC Status"
                        name="videoKycStatus"
                        value={formData.videoKycStatus}
                        onChange={handleChange}
                        options={["Pending", "Completed", "Rejected"]}
                        readOnly={!editing}
                      />
                      <Field
                        label="Employment Status"
                        name="employmentStatus"
                        value={formData.employmentStatus}
                        onChange={handleChange}
                        options={[
                          "Employed",
                          "Unemployed",
                          "Self-Employed",
                          "Student",
                        ]}
                        readOnly={!editing}
                      />
                    </div>
                  </div>

                  {/* Edit action buttons */}
                  {editing && (
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          fetchApp();
                        }}
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
                          <>
                            <Save className="w-4 h-4" /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Documents section */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 border-b border-border pb-3">
                <FileText className="w-4 h-4 text-primary" /> Application
                Documents
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Identity Proof", path: app.idProof },
                  { label: "10th Certificate", path: app.tenthCertificate },
                  {
                    label: "Plus Two Certificate",
                    path: app.plusTwoCertificate,
                  },
                  { label: "Affidavit", path: app.affidavit },
                  {
                    label: "Migration Certificate",
                    path: app.migrationCertificate,
                  },
                  { label: "Project Submission", path: app.projectSubmission },
                ].map(
                  (doc, i) =>
                    doc.path && (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between group hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <span className="text-xs font-bold text-foreground">
                            {doc.label}
                          </span>
                        </div>
                        <a
                          href={`${import.meta.env.VITE_BASE_URL || "http://localhost:4040"}/${doc.path.replace(/\\/g, "/")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-background border border-border hover:bg-primary hover:text-white hover:border-primary text-[10px] font-black transition-all"
                        >
                          VIEW
                        </a>
                      </div>
                    ),
                )}
              </div>

              {/* Multiple Certificates */}
              {((app.bachelorsCertificates &&
                app.bachelorsCertificates.length > 0) ||
                (app.mastersCertificates &&
                  app.mastersCertificates.length > 0)) && (
                <div className="space-y-4 pt-4 border-t border-border">
                  {app.bachelorsCertificates?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Bachelors Certificates
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {app.bachelorsCertificates.map((path, idx) => (
                          <a
                            key={idx}
                            href={`${import.meta.env.VITE_BASE_URL || "http://localhost:4040"}/${path.replace(/\\/g, "/")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-lg border border-border bg-muted/10 text-[10px] font-bold flex items-center gap-2 hover:bg-muted/30 transition-all"
                          >
                            <FileText className="w-3 h-3 text-indigo-500" />
                            Cert {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.mastersCertificates?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Masters Certificates
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {app.mastersCertificates.map((path, idx) => (
                          <a
                            key={idx}
                            href={`${import.meta.env.VITE_BASE_URL || "http://localhost:4040"}/${path.replace(/\\/g, "/")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-lg border border-border bg-muted/10 text-[10px] font-bold flex items-center gap-2 hover:bg-muted/30 transition-all"
                          >
                            <FileText className="w-3 h-3 text-rose-500" />
                            Cert {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Follow-up Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="xl:col-span-2 space-y-4 hidden"
          >
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-bold text-base flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-primary" />
                Follow-up Log
                <span className="ml-auto text-xs text-muted-foreground font-normal">
                  Newest first
                </span>
              </h2>
              <FollowupTimeline studentId={id} canAdd={true} />
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
