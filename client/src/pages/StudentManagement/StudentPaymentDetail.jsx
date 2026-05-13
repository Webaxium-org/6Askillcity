import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import {
  CreditCard,
  Calendar,
  History,
  Plus,
  ArrowLeft,
  BadgeDollarSign,
  Receipt,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Hash,
  Wallet,
  Activity,
  ChevronRight,
  Printer,
  Trash2,
  X,
  User,
  BookOpen,
  School,
  FileDigit,
  Phone,
  Mail,
  MapPin,
  Baby,
  Building2,
  GraduationCap,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import DocViewerModal from "../../components/common/DocViewerModal";
import InvoiceModal from "../../components/payment/InvoiceModal";
import { getStudentById } from "../../api/student.api";
import {
  recordPayment,
  getStudentPayments,
  setPaymentSchedule,
  getStudentSchedules,
  deletePaymentSchedule,
} from "../../api/payment.api";
import {
  getFollowups,
  addFollowup,
  deleteFollowup,
  updateStudentStatus,
} from "../../api/student.api";
import { showAlert } from "../../redux/alertSlice";
import { getTickets } from "../../api/ticket.api";
import TicketChat from "../Tickets/TicketChat";

const getFileUrl = (path) => {
  if (!path) return "";
  const normalizedPath = path.replace(/\\/g, "/");
  if (normalizedPath.startsWith("http")) return normalizedPath;
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  if (normalizedPath.startsWith("uploads/"))
    return `${baseUrl}/${normalizedPath}`;
  return `${baseUrl}/uploads/${normalizedPath}`;
};

const handleDownload = async (url, label, studentName) => {
  try {
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
    const proxyUrl = `${baseUrl}/api/students/download-proxy?url=${encodeURIComponent(url)}`;
    const link = document.createElement("a");
    link.href = proxyUrl;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Download failed:", error);
    window.open(url, "_blank");
  }
};

export default function StudentPaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([
    { dueDate: "", amount: "", description: "" },
  ]);

  // Follow-up state
  const [followups, setFollowups] = useState([]);
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [newFollowup, setNewFollowup] = useState({
    note: "",
    status: "",
    enrollmentNumber: "",
    nextFollowupDate: "",
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);

  const { user } = useSelector((state) => state.user);
  const isPartner = user?.role === "partner" || user?.type === "partner";
  const isManager = user?.role === "manager";
  const isAdmin = user?.role === "admin" || user?.type === "admin";

  const [activeTab, setActiveTab] = useState(
    user?.role === "manager" ? "profile" : "payment",
  );

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [activePaymentSubTab, setActivePaymentSubTab] = useState("schedule");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, paymentsRes, schedulesRes, followupsRes] =
        await Promise.all([
          getStudentById(id),
          getStudentPayments(id),
          getStudentSchedules(id),
          getFollowups(id),
        ]);

      if (studentRes.success) setStudent(studentRes.data);
      if (paymentsRes.success) setPayments(paymentsRes.data);
      if (schedulesRes.success) setSchedules(schedulesRes.data);
      if (followupsRes.success) setFollowups(followupsRes.data);
      fetchStudentTickets();
    } catch (error) {
      dispatch(showAlert({ type: "error", message: "Failed to load details" }));
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowups = async () => {
    setIsFollowupLoading(true);
    try {
      const res = await getFollowups(id);
      if (res.success) setFollowups(res.data);
    } catch (error) {
      console.error("Failed to fetch followups", error);
    } finally {
      setIsFollowupLoading(false);
    }
  };

  const fetchStudentTickets = async () => {
    setIsTicketsLoading(true);
    try {
      const res = await getTickets({ studentId: id, limit: 100 });
      if (res.success) setTickets(res.data);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setIsTicketsLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) return;

    const totalFee = student?.programFee?.totalFee || 0;
    const remaining = totalFee - (student.totalFeePaid || 0);

    if (Number(paymentAmount) > remaining) {
      dispatch(
        showAlert({
          type: "error",
          message: `Amount exceeds remaining fee (₹${remaining.toLocaleString()})`,
        }),
      );
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("amount", paymentAmount);
      formData.append("remarks", paymentRemarks);
      formData.append("method", "Offline (Direct)");
      if (paymentReceipt) {
        formData.append("receipt", paymentReceipt);
      }

      const res = await recordPayment(id, formData);
      if (res.success) {
        dispatch(
          showAlert({
            type: "success",
            message: "Payment submitted for verification!",
          }),
        );
        // Refresh all data to sync totals
        await fetchData();
        setShowPayModal(false);
        setPaymentAmount("");
        setPaymentRemarks("");
        setPaymentReceipt(null);
      }
    } catch (error) {
      dispatch(
        showAlert({
          type: "error",
          message: error.response?.data?.message || "Payment submission failed",
        }),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddScheduleRow = () => {
    setScheduleItems([
      ...scheduleItems,
      { dueDate: "", amount: "", description: "" },
    ]);
  };

  const handleRemoveScheduleRow = (idx) => {
    setScheduleItems(scheduleItems.filter((_, i) => i !== idx));
  };

  const handleUpdateSchedule = async () => {
    try {
      const res = await setPaymentSchedule(id, scheduleItems);
      if (res.success) {
        dispatch(
          showAlert({
            type: "success",
            message: "Schedule updated successfully",
          }),
        );
        await fetchData();
        setShowScheduleModal(false);
      }
    } catch (error) {
      dispatch(
        showAlert({ type: "error", message: "Failed to update schedule" }),
      );
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;
    try {
      const res = await deletePaymentSchedule(scheduleId);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Schedule deleted" }));
        setSchedules(schedules.filter((s) => s._id !== scheduleId));
      }
    } catch (error) {
      dispatch(
        showAlert({ type: "error", message: "Failed to delete schedule" }),
      );
    }
  };

  const handleStatusUpdate = async (newStatus, enrollmentNumber = "") => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateStudentStatus(id, newStatus, enrollmentNumber);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: res.message }));
        setStudent({
          ...student,
          status: newStatus,
          enrollmentNumber: enrollmentNumber || student.enrollmentNumber,
        });
      }
    } catch (error) {
      dispatch(
        showAlert({ type: "error", message: "Failed to update status" }),
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddFollowup = async (e) => {
    e.preventDefault();
    if (!newFollowup.note.trim()) return;

    setIsFollowupLoading(true);
    try {
      // 1. Update status if changed in the form
      if (newFollowup.status && newFollowup.status !== student.status) {
        await updateStudentStatus(
          id,
          newFollowup.status,
          newFollowup.enrollmentNumber,
        );
      }

      // 2. Save followup with category 'eligibility'
      const res = await addFollowup(
        id,
        newFollowup.note,
        "eligibility", // Forced category as per request
        null, // Removed nextFollowupDate
        newFollowup.status || student.status, // Pass current or new status
      );

      if (res.success) {
        dispatch(
          showAlert({
            type: "success",
            message: "Interaction logged and status updated",
          }),
        );
        setNewFollowup({ note: "", status: "", enrollmentNumber: "" });
        await Promise.all([fetchData(), fetchFollowups()]);
      }
    } catch (error) {
      dispatch(
        showAlert({
          type: "error",
          message: error.response?.data?.message || "Failed to log interaction",
        }),
      );
    } finally {
      setIsFollowupLoading(false);
    }
  };

  const handleDeleteFollowup = async (followupId) => {
    if (!window.confirm("Delete this follow-up?")) return;
    try {
      const res = await deleteFollowup(followupId);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: res.message }));
        await fetchFollowups();
      }
    } catch (error) {
      dispatch(
        showAlert({ type: "error", message: "Failed to delete follow-up" }),
      );
    }
  };

  if (loading || !student)
    return (
      <DashboardLayout title="Student Profile">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );

  const totalFee = student?.programFee?.totalFee || 0;
  const remaining = totalFee - (student.totalFeePaid || 0);

  const tabs = [
    { id: "payment", label: "Payment Overview", icon: CreditCard },
    { id: "profile", label: "Student Profile", icon: User },
    { id: "documents", label: "Documents", icon: FileDigit },
    { id: "tickets", label: "Tickets", icon: MessageSquare },
    { id: "followup", label: "Status", icon: History },
  ].filter((tab) => {
    if (isManager) {
      return tab.id !== "payment";
    }
    if (isPartner) {
      return tab.id !== "followup";
    }
    return true;
  });

  return (
    <DashboardLayout title="Student Profile">
      <div className="max-w-7xl mx-auto pb-20">
        {/* Profile Header */}
        <div className="relative mb-12">
          <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-[3rem] border border-border/50 relative overflow-hidden">
            <div className="absolute top-8 left-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group bg-card/80 backdrop-blur-md px-4 py-2 rounded-xl border border-border shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
            </div>
          </div>

          <div className="relative px-6 md:px-12 -mt-16 flex flex-col md:flex-row md:items-end gap-6">
            <div className="p-1.5 bg-card rounded-[2.5rem] border border-border shadow-2xl w-fit">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary text-3xl md:text-5xl font-black">
                {student.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight">
                  {student.name}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${student.paymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}
                  >
                    {student.paymentStatus}
                  </span>

                  {/* Lifecycle Status - Read Only here, update via Followup */}
                  <div
                    className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2 ${
                      student.status === "Enrolled"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : student.status === "Cancelled"
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}
                  >
                    <Activity className="w-3 h-3" />
                    {student.status || "On Progress"}
                  </div>

                  {!isPartner && !isAdmin && !isManager && (
                    <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground border border-border">
                      Read-Only Mode
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm font-bold text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  {student.university?.name}
                </span>
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  {student.program?.name}
                </span>
                {(isAdmin || isManager) && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {student.registeredBy?.centerName || "Head Office"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pb-2">
              {!isPartner && !isManager && (
                <span className="px-4 py-3 rounded-2xl bg-muted text-muted-foreground border border-border font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  View Only
                </span>
              )}

              {isPartner && (
                <button
                  onClick={() => setShowPayModal(true)}
                  disabled={totalFee > 0 && remaining <= 0}
                  className="px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
                >
                  <CreditCard className="w-5 h-5" />
                  Make Payment
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-20 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 p-1.5 bg-card border border-border rounded-[2rem] shadow-sm w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {activeTab === "payment" && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Financial Stats */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
                      <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8">
                        Financial Overview
                      </h3>

                      <div className="space-y-4 flex-1">
                        <div className="p-6 rounded-3xl bg-muted/30 border border-border flex justify-between items-center group hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                              <BadgeDollarSign className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                Total Fee
                              </p>
                              <p className="text-xl font-black">
                                ₹{totalFee?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                              <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-60">
                                Paid Amount
                              </p>
                              <p className="text-xl font-black text-emerald-600">
                                ₹{(student.totalFeePaid || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                              <Activity className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-60">
                                Remaining
                              </p>
                              <p className="text-xl font-black text-blue-600">
                                ₹{remaining.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-border">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Completion
                          </span>
                          <span className="text-lg font-black text-primary">
                            {Math.round(
                              ((student.totalFeePaid || 0) / (totalFee || 1)) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.round(((student.totalFeePaid || 0) / (totalFee || 1)) * 100)}%`,
                            }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Schedule */}
                  <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm h-full flex flex-col">
                      <div className="p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-muted/10">
                        <div className="flex items-center gap-2 p-1 bg-background border border-border rounded-2xl w-fit">
                          <button
                            onClick={() => setActivePaymentSubTab("schedule")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              activePaymentSubTab === "schedule"
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            Schedule
                          </button>
                          <button
                            onClick={() => setActivePaymentSubTab("history")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              activePaymentSubTab === "history"
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            History
                          </button>
                        </div>
                        {isPartner && activePaymentSubTab === "schedule" && (
                          <button
                            onClick={() => setShowScheduleModal(true)}
                            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-all border border-primary/20"
                          >
                            <Plus className="w-4 h-4" />
                            Modify Plan
                          </button>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {activePaymentSubTab === "schedule" ? (
                          <div className="p-8">
                            {schedules.length === 0 ? (
                              <div className="py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                                  <Clock className="w-10 h-10 text-muted-foreground opacity-20" />
                                </div>
                                <p className="text-sm font-bold text-muted-foreground">
                                  No upcoming payment milestones.
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {schedules.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col p-6 bg-muted/30 rounded-[2rem] border border-border/50 group hover:border-primary/30 transition-all relative overflow-hidden"
                                  >
                                    <div className="flex justify-between items-start mb-6">
                                      <div
                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.status === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}
                                      >
                                        {item.status}
                                      </div>
                                      {isPartner &&
                                        item.status === "Pending" && (
                                          <button
                                            onClick={() =>
                                              handleDeleteSchedule(item._id)
                                            }
                                            className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        )}
                                    </div>
                                    <h4 className="text-lg font-black mb-1">
                                      {item.description}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-6">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {new Date(
                                        item.dueDate,
                                      ).toLocaleDateString("en-IN", {
                                        dateStyle: "medium",
                                      })}
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-border/50">
                                      <p className="text-2xl font-black text-foreground">
                                        ₹{item.amount.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-0">
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead className="bg-muted/30">
                                  <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                      Timestamp
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">
                                      Status
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                      Method
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                                      Amount
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                                      Invoice
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                  {payments.map((payment, idx) => (
                                    <tr
                                      key={idx}
                                      className="group hover:bg-muted/20 transition-all"
                                    >
                                      <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                          <span className="text-sm font-black">
                                            {new Date(
                                              payment.date,
                                            ).toLocaleDateString("en-IN", {
                                              dateStyle: "medium",
                                            })}
                                          </span>
                                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                            {new Date(
                                              payment.date,
                                            ).toLocaleTimeString()}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-8 py-6 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                          <span
                                            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                              payment.approvalStatus ===
                                              "approved"
                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                : payment.approvalStatus ===
                                                    "rejected"
                                                  ? "bg-red-500/10 text-red-600 border-red-500/20"
                                                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                            }`}
                                          >
                                            {payment.approvalStatus ||
                                              "pending"}
                                          </span>
                                          {payment.receipt && (
                                            <button
                                              onClick={() =>
                                                setViewingDoc({
                                                  url: getFileUrl(
                                                    payment.receipt,
                                                  ),
                                                  title: "Payment Receipt",
                                                })
                                              }
                                              className="flex items-center gap-1 text-[8px] font-black text-primary hover:underline uppercase tracking-widest"
                                            >
                                              <Eye className="w-3 h-3" /> View
                                              Receipt
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-8 py-6">
                                        <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1.5 rounded-xl uppercase tracking-widest border border-primary/10">
                                          {payment.method}
                                        </span>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                        <p className="text-lg font-black text-foreground">
                                          ₹{payment.amount.toLocaleString()}
                                        </p>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                        <button
                                          disabled={
                                            payment.approvalStatus !==
                                            "approved"
                                          }
                                          className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-2xl transition-all border border-blue-600/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-blue-600"
                                          onClick={() => {
                                            setSelectedInvoice(payment);
                                            setShowInvoiceModal(true);
                                          }}
                                        >
                                          <Receipt className="w-4 h-4" />
                                          Invoice
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4 p-4 bg-muted/5">
                              {payments.map((payment, idx) => (
                                <div
                                  key={idx}
                                  className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        {new Date(
                                          payment.date,
                                        ).toLocaleDateString("en-IN", {
                                          dateStyle: "medium",
                                        })}
                                      </span>
                                      <span className="text-xs font-black">
                                        {new Date(
                                          payment.date,
                                        ).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <p className="text-lg font-black text-primary">
                                      ₹{payment.amount.toLocaleString()}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                        Payment Method
                                      </span>
                                      <span className="text-[10px] font-black uppercase">
                                        {payment.method}
                                      </span>
                                    </div>
                                    <button
                                      className="flex items-center gap-2 text-[10px] font-black uppercase bg-primary/10 text-primary px-4 py-2 rounded-xl transition-all border border-primary/5"
                                      onClick={() => {
                                        setSelectedInvoice(payment);
                                        setShowInvoiceModal(true);
                                      }}
                                    >
                                      <Receipt className="w-3.5 h-3.5" />
                                      Invoice
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {payments.length === 0 && (
                              <div className="px-8 py-32 text-center">
                                <div className="opacity-10 mb-4">
                                  <History className="w-16 h-16 mx-auto" />
                                </div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                  No financial history yet.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Personal & Contact */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <User className="w-5 h-5" />
                      </div>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          Full Name
                        </p>
                        <p className="text-base font-bold">{student.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          Date of Birth
                        </p>
                        <p className="text-base font-bold flex items-center gap-2">
                          <Baby className="w-4 h-4 text-primary" />
                          {student.dob
                            ? new Date(student.dob).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          Gender
                        </p>
                        <p className="text-base font-bold">
                          {student.gender || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          Email Address
                        </p>
                        <p className="text-base font-bold flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          {student.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          Primary Phone
                        </p>
                        <p className="text-base font-bold flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          {student.phone}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          Alternative Phone
                        </p>
                        <p className="text-base font-bold">
                          {student.alternativePhone || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-border">
                      <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">
                        Address & Location
                      </h3>
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                          <MapPin className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-base font-medium leading-relaxed">
                          {student.address || "No address provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      Academic History
                    </h3>
                    <div className="space-y-6">
                      {/* 10th */}
                      <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-black text-base">
                            SSLC / 10th Standard
                          </h4>
                          <p className="text-xs font-bold text-muted-foreground uppercase">
                            {student.tenth?.board || "N/A"}
                          </p>
                        </div>
                        <div className="flex gap-8">
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Year
                            </p>
                            <p className="font-bold">
                              {student.tenth?.completionYear || "N/A"}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Percentage
                            </p>
                            <p className="font-bold text-primary">
                              {student.tenth?.percentage}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 12th */}
                      <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-black text-base">
                            Plus Two / 12th Standard
                          </h4>
                          <p className="text-xs font-bold text-muted-foreground uppercase">
                            {student.plusTwo?.board || "N/A"}
                          </p>
                        </div>
                        <div className="flex gap-8">
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Year
                            </p>
                            <p className="font-bold">
                              {student.plusTwo?.completionYear || "N/A"}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Percentage
                            </p>
                            <p className="font-bold text-primary">
                              {student.plusTwo?.percentage}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bachelors if any */}
                      {student.bachelors?.university && (
                        <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-base">
                              Bachelor's Degree
                            </h4>
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                              Higher Ed
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">
                                University
                              </p>
                              <p className="text-sm font-bold">
                                {student.bachelors.university}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">
                                Course / Branch
                              </p>
                              <p className="text-sm font-bold">
                                {student.bachelors.course}
                                {student.bachelors.branch &&
                                  ` (${student.bachelors.branch})`}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">
                                Year
                              </p>
                              <p className="text-sm font-bold">
                                {student.bachelors.completionYear || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Masters if any */}
                      {student.masters?.university && (
                        <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-base">
                              Master's Degree
                            </h4>
                            <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                              Higher Ed
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">
                                University
                              </p>
                              <p className="text-sm font-bold">
                                {student.masters.university}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">
                                Course / Branch
                              </p>
                              <p className="text-sm font-bold">
                                {student.masters.course}
                                {student.masters.branch &&
                                  ` (${student.masters.branch})`}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">
                                Year
                              </p>
                              <p className="text-sm font-bold">
                                {student.masters.completionYear || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Family Details */}
                <div className="lg:col-span-1">
                  <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                      Guardian Details
                    </h3>

                    <div className="space-y-8">
                      <div className="relative pl-8 border-l-2 border-primary/20">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-card" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Father's Name
                        </p>
                        <p className="text-base font-black">
                          {student.fatherName}
                        </p>
                        <p className="text-sm font-bold text-muted-foreground mt-1">
                          {student.fatherPhone}
                        </p>
                      </div>

                      <div className="relative pl-8 border-l-2 border-primary/20">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-card" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Mother's Name
                        </p>
                        <p className="text-base font-black">
                          {student.motherName}
                        </p>
                        <p className="text-sm font-bold text-muted-foreground mt-1">
                          {student.motherPhone}
                        </p>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-border">
                      <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                          Employment Status
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-black">
                            {student.employmentStatus || "Not Specified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                    <FileDigit className="w-5 h-5" />
                  </div>
                  Uploaded Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: "Identity Proof", doc: student.idProof },
                    {
                      label: "10th Certificate",
                      doc: student.tenth?.certificate,
                    },
                    {
                      label: "Plus Two Certificate",
                      doc: student.plusTwo?.certificate,
                    },
                    { label: "Affidavit", doc: student.affidavit },
                    {
                      label: "Migration Certificate",
                      doc: student.migrationCertificate,
                    },
                    {
                      label: "Project Submission",
                      doc: student.projectSubmission,
                    },
                  ].map((item, idx) => {
                    const docPath = item.doc?.path;
                    return (
                      <div
                        key={idx}
                        className="bg-muted/30 border border-border rounded-3xl p-6 flex flex-col gap-4 group hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground truncate max-w-[150px]">
                            {item.label}
                          </p>
                          {docPath ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setViewingDoc({
                                    url: getFileUrl(docPath),
                                    title: item.label,
                                  })
                                }
                                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDownload(
                                    getFileUrl(docPath),
                                    item.label,
                                    student.name,
                                  )
                                }
                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[8px] font-black bg-rose-500/10 text-rose-600 px-2 py-1 rounded-lg">
                              Missing
                            </span>
                          )}
                        </div>
                        <div className="aspect-[4/3] rounded-2xl bg-card border border-border/50 overflow-hidden flex items-center justify-center relative group-hover:shadow-lg transition-all">
                          {docPath ? (
                            /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(docPath) ? (
                              <img
                                src={getFileUrl(docPath)}
                                alt={item.label}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                                <FileDigit className="w-10 h-10" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  PDF Document
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground/20">
                              <AlertCircle className="w-10 h-10" />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                Not Uploaded
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Higher Ed Certificates */}
                {((student.bachelors?.certificates &&
                  student.bachelors.certificates.length > 0) ||
                  (student.masters?.certificates &&
                    student.masters.certificates.length > 0)) && (
                  <div className="mt-12 pt-12 border-t border-border space-y-8">
                    {student.bachelors?.certificates?.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Bachelors Certificates
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {student.bachelors.certificates.map((cert, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-muted/20 border border-border rounded-2xl flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <FileDigit className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-bold">
                                  Cert {idx + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setViewingDoc({
                                      url: getFileUrl(cert.path),
                                      title: `Bachelor Certificate ${idx + 1}`,
                                    })
                                  }
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-all"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDownload(
                                      getFileUrl(cert.path),
                                      `Bachelor Certificate ${idx + 1}`,
                                      student.name,
                                    )
                                  }
                                  className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-all"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {student.masters?.certificates?.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Masters Certificates
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {student.masters.certificates.map((cert, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-muted/20 border border-border rounded-2xl flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <FileDigit className="w-4 h-4 text-rose-500" />
                                <span className="text-[10px] font-bold">
                                  Cert {idx + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setViewingDoc({
                                      url: getFileUrl(cert.path),
                                      title: `Master Certificate ${idx + 1}`,
                                    })
                                  }
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-all"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDownload(
                                      getFileUrl(cert.path),
                                      `Master Certificate ${idx + 1}`,
                                      student.name,
                                    )
                                  }
                                  className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-all"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "tickets" && (
              <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-xl font-black mb-1">Support Tickets</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      Tickets raised for this student
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTicket({ isNew: true, studentName: student.name })}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Raise Ticket
                  </button>
                </div>

                {isTicketsLoading ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare className="w-10 h-10 text-muted-foreground opacity-20" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      No tickets found for this student.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket._id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-6 bg-muted/20 rounded-[2rem] border border-border/50 hover:border-primary/30 cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                              ticket.status === "Open"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : ticket.status === "Closed"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            }`}
                          >
                            {ticket.status}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            #{ticket._id.slice(-6)}
                          </span>
                        </div>
                        <h4 className="text-sm font-black mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                          {ticket.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">
                          {ticket.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "followup" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Log New Followup */}
                {!isPartner && (
                  <div className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm sticky top-24">
                      <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <Plus className="w-5 h-5" />
                        </div>
                        Update Student Status
                      </h3>
                      {student.status === "Enrolled" ? (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 text-center space-y-4">
                          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-emerald-600">
                              Enrolled
                            </h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                              Process Completed
                            </p>
                          </div>
                          {student.enrollmentNumber && (
                            <div className="pt-4 border-t border-emerald-500/10">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                Enrollment ID
                              </p>
                              <p className="text-sm font-black text-foreground">
                                {student.enrollmentNumber}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <form
                          onSubmit={handleAddFollowup}
                          className="space-y-6"
                        >
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Student Status
                            </label>
                            <select
                              value={newFollowup.status}
                              onChange={(e) =>
                                setNewFollowup({
                                  ...newFollowup,
                                  status: e.target.value,
                                })
                              }
                              className="w-full p-4 rounded-2xl border border-border bg-muted/50 focus:border-primary outline-none transition-all text-xs font-bold uppercase tracking-wider"
                            >
                              <option value="">
                                No Change (Current: {student.status})
                              </option>
                              <option value="On Progress">On Progress</option>
                              <option value="Enrolled">Enrolled</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          {newFollowup.status === "Enrolled" && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Enrollment Number
                              </label>
                              <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                  type="text"
                                  required
                                  value={newFollowup.enrollmentNumber}
                                  onChange={(e) =>
                                    setNewFollowup({
                                      ...newFollowup,
                                      enrollmentNumber: e.target.value,
                                    })
                                  }
                                  placeholder="Enter official enrollment ID"
                                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-muted/50 focus:border-primary outline-none transition-all text-sm font-bold"
                                />
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Note / Remark
                            </label>
                            <textarea
                              required
                              value={newFollowup.note}
                              onChange={(e) =>
                                setNewFollowup({
                                  ...newFollowup,
                                  note: e.target.value,
                                })
                              }
                              className="w-full p-4 rounded-2xl border border-border bg-muted/50 focus:border-primary outline-none transition-all text-sm h-32 leading-relaxed"
                              placeholder="What was discussed during this interaction?"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isFollowupLoading}
                            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {isFollowupLoading ? (
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Update Status
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* Right: History Timeline */}
                <div className={isPartner ? "lg:col-span-3" : "lg:col-span-2"}>
                  <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm min-h-[600px]">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                        <History className="w-5 h-5" />
                      </div>
                      Interaction History
                    </h3>

                    <div className="relative space-y-8 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/50">
                      {followups.length === 0 ? (
                        <div className="py-20 text-center space-y-4">
                          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                            <Clock className="w-10 h-10 text-muted-foreground opacity-20" />
                          </div>
                          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            No follow-up history found.
                          </p>
                        </div>
                      ) : (
                        followups.map((item, idx) => (
                          <div key={item._id} className="relative pl-12 group">
                            <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-card border-2 border-border flex items-center justify-center z-10 group-hover:border-primary transition-colors">
                              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors" />
                            </div>

                            <div className="p-6 bg-muted/20 rounded-[2rem] border border-border/50 group-hover:border-primary/20 transition-all">
                              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-primary/10 ${
                                      item.status === "Enrolled"
                                        ? "bg-emerald-500/10 text-emerald-600"
                                        : item.status === "Cancelled"
                                          ? "bg-red-500/10 text-red-600"
                                          : "bg-blue-500/10 text-blue-600"
                                    }`}
                                  >
                                    {item.status || "On Progress"}
                                  </span>
                                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.createdAt).toLocaleString(
                                      "en-IN",
                                      {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      },
                                    )}
                                  </span>
                                </div>
                                {(isAdmin ||
                                  String(item.authorId) ===
                                    String(user._id)) && (
                                  <button
                                    onClick={() =>
                                      handleDeleteFollowup(item._id)
                                    }
                                    className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <p className="text-sm font-medium leading-relaxed text-foreground/80 mb-4 whitespace-pre-wrap">
                                {item.note}
                              </p>

                              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                                    {item.authorName?.charAt(0) || "U"}
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    {item.authorName} • {item.authorType}
                                  </span>
                                </div>
                                {item.nextFollowupDate && (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/10">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">
                                      Next:{" "}
                                      {new Date(
                                        item.nextFollowupDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals are kept below (no changes to their functionality) */}
      {/* Pay Modal */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card border border-border w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Make Payment</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      Remaining: ₹{remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Payment Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary">
                        ₹
                      </span>
                      <input
                        type="number"
                        required
                        max={remaining}
                        value={paymentAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (Number(val) > remaining) {
                            setPaymentAmount(remaining.toString());
                          } else {
                            setPaymentAmount(val);
                          }
                        }}
                        placeholder="Enter amount"
                        className="w-full pl-10 pr-4 py-4 rounded-[1.5rem] border border-border bg-muted/50 focus:border-primary outline-none transition-all font-black text-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Attach Receipt (Optional)
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setPaymentReceipt(e.target.files[0])}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="flex items-center gap-3 w-full p-4 rounded-[1.5rem] border border-dashed border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                            {paymentReceipt
                              ? paymentReceipt.name
                              : "Choose File"}
                          </p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase">
                            {paymentReceipt
                              ? `${(paymentReceipt.size / 1024 / 1024).toFixed(2)} MB`
                              : "JPG, PNG or PDF (Max 5MB)"}
                          </p>
                        </div>
                        {paymentReceipt && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setPaymentReceipt(null);
                            }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Remarks (Optional)
                    </label>
                    <textarea
                      value={paymentRemarks}
                      onChange={(e) => setPaymentRemarks(e.target.value)}
                      className="w-full p-4 rounded-[1.5rem] border border-border bg-muted/50 focus:border-primary outline-none transition-all text-sm h-24"
                      placeholder="Add some notes about this payment..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPayModal(false);
                        setPaymentReceipt(null);
                      }}
                      className="flex-1 py-4 rounded-3xl border border-border font-black text-sm hover:bg-muted transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-[2] py-4 rounded-3xl bg-primary text-primary-foreground font-black text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Confirm Payment"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduleModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card border border-border w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">
                        Plan Payment Schedule
                      </h3>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                        Define future installments
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleAddScheduleRow}
                    className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:rotate-90 transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {scheduleItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-4 p-5 bg-muted/30 rounded-3xl border border-border/50 items-end"
                    >
                      <div className="col-span-3 space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          required
                          value={item.dueDate}
                          onChange={(e) => {
                            const newItems = [...scheduleItems];
                            newItems[idx].dueDate = e.target.value;
                            setScheduleItems(newItems);
                          }}
                          className="w-full p-3 rounded-xl border border-border bg-card text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          required
                          value={item.amount}
                          placeholder="₹ 0.00"
                          onChange={(e) => {
                            const newItems = [...scheduleItems];
                            newItems[idx].amount = e.target.value;
                            setScheduleItems(newItems);
                          }}
                          className="w-full p-3 rounded-xl border border-border bg-card text-xs font-black outline-none"
                        />
                      </div>
                      <div className="col-span-5 space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                          Description
                        </label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          placeholder="e.g. 2nd Installment"
                          onChange={(e) => {
                            const newItems = [...scheduleItems];
                            newItems[idx].description = e.target.value;
                            setScheduleItems(newItems);
                          }}
                          className="w-full p-3 rounded-xl border border-border bg-card text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => handleRemoveScheduleRow(idx)}
                          className="p-3 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-8">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 py-4 rounded-3xl border border-border font-black text-sm hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSchedule}
                    className="flex-1 py-4 rounded-3xl bg-primary text-primary-foreground font-black text-sm shadow-lg shadow-primary/20"
                  >
                    Save Schedule
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DocViewerModal
        isOpen={!!viewingDoc}
        url={viewingDoc?.url}
        title={viewingDoc?.title}
        onClose={() => setViewingDoc(null)}
      />

      <AnimatePresence>
        {selectedTicket && (
          <TicketChat
            ticket={selectedTicket}
            prefilledStudentId={id}
            onClose={() => {
              setSelectedTicket(null);
              fetchStudentTickets();
            }}
          />
        )}
      </AnimatePresence>

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        payment={selectedInvoice}
        student={student}
      />
    </DashboardLayout>
  );
}
