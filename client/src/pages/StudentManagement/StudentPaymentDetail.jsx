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
} from "lucide-react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { getStudentById } from "../../api/student.api";
import {
  recordPayment,
  getStudentPayments,
  setPaymentSchedule,
  getStudentSchedules,
  deletePaymentSchedule,
} from "../../api/payment.api";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import InvoiceModal from "../../components/payment/InvoiceModal";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([
    { dueDate: "", amount: "", description: "" },
  ]);
  const [activeTab, setActiveTab] = useState("payment");

  const { user } = useSelector((state) => state.user);
  const isPartner = user?.role === "partner" || user?.type === "partner";

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, paymentsRes, schedulesRes] = await Promise.all([
        getStudentById(id),
        getStudentPayments(id),
        getStudentSchedules(id),
      ]);

      if (studentRes.success) setStudent(studentRes.data);
      if (paymentsRes.success) setPayments(paymentsRes.data);
      if (schedulesRes.success) setSchedules(schedulesRes.data);
    } catch (error) {
      dispatch(
        showAlert({ type: "error", message: "Failed to load payment details" }),
      );
    } finally {
      setLoading(false);
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
      const res = await recordPayment(id, {
        amount: paymentAmount,
        remarks: paymentRemarks,
        method: "Offline (Dummy)",
      });
      if (res.success) {
        dispatch(
          showAlert({
            type: "success",
            message: "Payment recorded successfully!",
          }),
        );
        // Refresh all data to sync totals
        await fetchData();
        setShowPayModal(false);
        setPaymentAmount("");
        setPaymentRemarks("");
      }
    } catch (error) {
      dispatch(
        showAlert({
          type: "error",
          message: error.response?.data?.message || "Payment failed",
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

  if (loading || !student)
    return (
      <DashboardLayout title="Student Payment">
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
    { id: "history", label: "Transaction History", icon: History },
  ];

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

          <div className="absolute -bottom-10 left-12 flex flex-col md:flex-row md:items-end gap-6 w-[calc(100%-6rem)]">
            <div className="p-1.5 bg-card rounded-[2.5rem] border border-border shadow-2xl">
              <div className="w-32 h-32 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary text-5xl font-black">
                {student.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-4xl font-black tracking-tight">
                  {student.name}
                </h1>
                <span
                  className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${student.paymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}
                >
                  {student.paymentStatus}
                </span>
                {!isPartner && (
                  <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground border border-border">
                    Read-Only Mode
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-bold text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  {student.university?.name}
                </span>
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  {student.program?.name}
                </span>
              </div>
            </div>

            {isPartner && (
              <div className="flex gap-3 pb-2">
                <button
                  onClick={() => setShowPayModal(true)}
                  disabled={totalFee > 0 && remaining <= 0}
                  className="px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <CreditCard className="w-5 h-5" />
                  Make Payment
                </button>
              </div>
            )}
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
                  <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm h-full">
                    <div className="p-8 border-b border-border flex items-center justify-between bg-muted/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-widest">
                          Payment Schedule
                        </h3>
                      </div>
                      {isPartner && (
                        <button
                          onClick={() => setShowScheduleModal(true)}
                          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-all border border-primary/20"
                        >
                          <Plus className="w-4 h-4" />
                          Modify Plan
                        </button>
                      )}
                    </div>
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
                                {isPartner && item.status === "Pending" && (
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
                                {new Date(item.dueDate).toLocaleDateString(
                                  "en-IN",
                                  { dateStyle: "medium" },
                                )}
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
                  </div>
                </div>
              </div>
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
                          <div className="grid grid-cols-2 gap-4">
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
                                Course
                              </p>
                              <p className="text-sm font-bold">
                                {student.bachelors.course}
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
                    {
                      label: "Identity Proof (Aadhar/Passport)",
                      key: "identityProof",
                    },
                    { label: "10th Marksheet", key: "tenthMarksheet" },
                    { label: "Plus Two Marksheet", key: "plusTwoMarksheet" },
                    { label: "Degree Certificate", key: "degreeCertificate" },
                    {
                      label: "TC / Conduct Certificate",
                      key: "tcConductCertificate",
                    },
                  ].map((doc, idx) => {
                    const docPath = student.documents?.[doc.key];
                    return (
                      <div
                        key={idx}
                        className="bg-muted/30 border border-border rounded-3xl p-6 flex flex-col gap-4 group hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground truncate max-w-[150px]">
                            {doc.label}
                          </p>
                          {docPath ? (
                            <a
                              href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${docPath.replace(/\\/g, "/")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-[8px] font-black bg-muted px-2 py-1 rounded-lg">
                              Missing
                            </span>
                          )}
                        </div>
                        <div className="aspect-[4/3] rounded-2xl bg-card border border-border/50 overflow-hidden flex items-center justify-center relative group-hover:shadow-lg transition-all">
                          {docPath ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${docPath.replace(/\\/g, "/")}`}
                              alt={doc.label}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`flex w-full h-full items-center justify-center text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center p-4 ${docPath ? "hidden" : "flex"}`}
                          >
                            {docPath ? "PDF Document" : "Not Uploaded"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border flex items-center justify-between bg-muted/10">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground/80">
                      Transaction Ledger
                    </h3>
                  </div>
                  <span className="text-xs font-black text-muted-foreground bg-muted px-4 py-2 rounded-full border border-border/50">
                    {payments.length} Transactions Found
                  </span>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                          Timestamp
                        </th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                          Method
                        </th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                          Transaction Ref
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
                                {new Date(payment.date).toLocaleDateString(
                                  "en-IN",
                                  { dateStyle: "medium" },
                                )}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                {new Date(payment.date).toLocaleTimeString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1.5 rounded-xl uppercase tracking-widest border border-primary/10">
                              {payment.method}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-xs font-mono font-black text-muted-foreground">
                              <Hash className="w-3.5 h-3.5 opacity-40" />
                              {payment.transactionId}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <p className="text-lg font-black text-foreground">
                              ₹{payment.amount.toLocaleString()}
                            </p>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-2xl transition-all border border-blue-600/10"
                              onClick={() => {
                                setSelectedInvoice(payment);
                                setShowInvoiceModal(true);
                              }}
                            >
                              <Receipt className="w-4 h-4" />
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-8 py-32 text-center">
                            <div className="opacity-10 mb-4">
                              <History className="w-16 h-16 mx-auto" />
                            </div>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                              No financial history yet.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-10 pr-4 py-4 rounded-[1.5rem] border border-border bg-muted/50 focus:border-primary outline-none transition-all font-black text-lg"
                      />
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
                      onClick={() => setShowPayModal(false)}
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

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        payment={selectedInvoice}
        student={student}
      />
    </DashboardLayout>
  );
}
