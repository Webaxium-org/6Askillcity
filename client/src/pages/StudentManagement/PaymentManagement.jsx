import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import {
  CreditCard,
  Calendar,
  History,
  Users,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  BadgeDollarSign,
  Receipt,
  ChevronRight,
  Clock,
  X,
  Hash,
  Building2,
  Plus,
  Check,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getGlobalPaymentStats, approvePayment, rejectPayment } from "../../api/payment.api";
import { getUniversities } from "../../api/university.api";
import { cn } from "../../lib/utils";
import { showAlert } from "../../redux/alertSlice";
import { useNavigate } from "react-router-dom";
import InvoiceModal from "../../components/payment/InvoiceModal";
import DocViewerModal from "../../components/common/DocViewerModal";
import { useDispatch, useSelector } from "react-redux";

export default function PaymentManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin" || user?.type === "admin";

  const [data, setData] = useState({
    recentPayments: [],
    upcomingSchedules: [],
    pendingPayments: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(isAdmin ? "pending" : "recent");
  const [search, setSearch] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUni, setSelectedUni] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState("all");
  const [universities, setUniversities] = useState([]);
  const [partners, setPartners] = useState([]);

  // Verification Logic
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectingPaymentId, setRejectingPaymentId] = useState(null);
  const [approvingPayment, setApprovingPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user?.role === "manager") {
      navigate("/dashboard");
      return;
    }
    fetchStats();
    fetchUniversities();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, startDate, endDate, selectedUni, selectedPartner]);

  const setQuickRange = (range) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
      case "today":
        start = today;
        end = today;
        break;
      case "week":
        const diff = today.getDate() - today.getDay();
        start = new Date(today.setDate(diff));
        end = new Date();
        break;
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      case "year":
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date();
        break;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const fetchUniversities = async () => {
    try {
      const { getUniversities } = await import("../../api/university.api");

      if (isAdmin) {
        const { getAllApprovedAdmissionPoints } =
          await import("../../api/admissionPoint.api");
        const [uniRes, partnerRes] = await Promise.all([
          getUniversities(),
          getAllApprovedAdmissionPoints(),
        ]);
        if (uniRes.success) setUniversities(uniRes.data);
        if (partnerRes.success) setPartners(partnerRes.data);
      } else {
        const { getPermittedCourses } = await import("../../api/partner.api");
        const res = await getPermittedCourses();
        if (res.success) {
          const permittedUnis = [];
          const uniIds = new Set();
          res.data.forEach((item) => {
            const uni = item.university;
            if (uni && !uniIds.has(uni._id)) {
              uniIds.add(uni._id);
              permittedUnis.push(uni);
            }
          });
          setUniversities(permittedUnis);
        }
      }
    } catch (error) {
      console.error("Failed to load filter data", error);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getGlobalPaymentStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      dispatch(
        showAlert({
          type: "error",
          message: "Failed to load payment tracking",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (list, isSchedule = false, isPending = false) => {
    return list.filter((item) => {
      const matchesSearch =
        item.student?.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.transactionId || "").toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // University Filter
      if (
        selectedUni !== "all" &&
        item.student?.university?._id !== selectedUni
      )
        return false;

      // Partner Filter
      if (
        isAdmin &&
        selectedPartner !== "all" &&
        item.partner?._id !== selectedPartner
      )
        return false;

      // Date Range Filter
      const itemDate = new Date(isSchedule ? item.dueDate : (isPending ? item.createdAt : item.date));
      if (startDate && itemDate < new Date(startDate)) return false;
      if (endDate && itemDate > new Date(endDate)) return false;

      return true;
    });
  };

  const filteredPayments = applyFilters(data.recentPayments);
  const filteredSchedules = applyFilters(data.upcomingSchedules, true);
  const filteredPending = applyFilters(data.pendingPayments || [], false, true);

  const currentList =
    activeTab === "pending"
      ? filteredPending
      : activeTab === "recent"
        ? filteredPayments
        : filteredSchedules;

  const totalPages = Math.ceil(currentList.length / itemsPerPage);
  const paginatedData = currentList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleApprove = (payment) => {
    setApprovingPayment(payment);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!approvingPayment) return;
    setIsProcessing(true);
    try {
      const res = await approvePayment(approvingPayment._id);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Payment approved!" }));
        setShowApproveModal(false);
        setApprovingPayment(null);
        fetchStats();
      }
    } catch (error) {
      dispatch(
        showAlert({
          type: "error",
          message: error.response?.data?.message || "Approval failed",
        }),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      dispatch(
        showAlert({ type: "warning", message: "Please provide a reason" }),
      );
      return;
    }
    setIsProcessing(true);
    try {
      const res = await rejectPayment(rejectingPaymentId, rejectionReason);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Payment rejected" }));
        setShowRejectModal(false);
        setRejectingPaymentId(null);
        setRejectionReason("");
        fetchStats();
      }
    } catch (error) {
      dispatch(
        showAlert({
          type: "error",
          message: error.response?.data?.message || "Rejection failed",
        }),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout title="Payment Management">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="sm:col-span-2 bg-gradient-to-br from-slate-900 via-primary to-blue-700 rounded-[2.5rem] p-10 text-primary-foreground shadow-2xl shadow-primary/30 relative overflow-hidden group min-h-[240px] flex flex-col justify-between">
            <div className="relative z-10 flex justify-between items-start">
              <div className="w-14 h-11 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-lg relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px opacity-30">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-black/20" />
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                  Global Ledger
                </p>
                <div className="flex justify-end gap-1 mt-1">
                  <div className="w-6 h-6 rounded-full bg-rose-500/80 mix-blend-screen" />
                  <div className="w-6 h-6 rounded-full bg-amber-500/80 -ml-3 mix-blend-screen" />
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mb-2">
                Total Revenue Balance
              </p>
              <h2 className="text-5xl font-black tracking-tighter flex items-baseline gap-2">
                <span className="text-2xl font-medium opacity-70 italic">
                  ₹
                </span>
                {data.recentPayments
                  .reduce((acc, p) => acc + p.amount, 0)
                  .toLocaleString()}
              </h2>
            </div>

            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] opacity-40 uppercase mb-1">
                  Card Holder
                </p>
                <p className="text-xs font-black uppercase tracking-widest">
                  6A SkillCity
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold tracking-[0.2em] opacity-40 uppercase mb-1">
                  Network ID
                </p>
                <p className="text-xs font-black tracking-widest font-mono">
                  **** **** **** 2026
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-white/10 transition-colors duration-700" />
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Recent Payments
              </p>
              <h4 className="text-2xl font-black mt-1">
                {filteredPayments.length}
              </h4>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Upcoming Schedules
              </p>
              <h4 className="text-2xl font-black mt-1">
                {filteredSchedules.length}
              </h4>
            </div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <div className="flex bg-muted/50 p-1.5 rounded-[1.5rem] border border-border w-fit whitespace-nowrap">
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === "pending" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Verification Queue
                  {data.pendingPayments?.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                      {data.pendingPayments.length}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setActiveTab("recent")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "recent" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Recent Payments
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "upcoming" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Upcoming Schedules
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border/50 bg-card focus:border-primary/50 outline-none transition-all text-sm shadow-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                "px-6 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                startDate || endDate || selectedUni !== "all" || selectedPartner !== "all"
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-card border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest">Loading...</p>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead className="hidden md:table-header-group bg-muted/50 border-y border-border/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        {activeTab === "pending" ? "Requested Date" : activeTab === "upcoming" ? "Due Date" : "Date"}
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        Type
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        Student Details
                      </th>
                      {isAdmin && (
                        <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                          Partner
                        </th>
                      )}
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                        Amount
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginatedData.map((item, idx) => (
                      <tr key={idx} className="flex flex-col md:table-row group hover:bg-muted/20 transition-all border-b md:border-b-0 border-border/50 last:border-b-0">
                        <td className="px-6 md:px-8 py-4 md:py-6">
                          <div className="flex md:flex-col items-center md:items-start justify-between">
                            <span className="md:hidden text-[10px] font-black uppercase text-muted-foreground tracking-widest">Date</span>
                            <div className="flex flex-col text-right md:text-left">
                              <span className="text-sm font-black">
                                {new Date(activeTab === "upcoming" ? item.dueDate : (activeTab === "pending" ? item.createdAt : item.date)).toLocaleDateString("en-IN")}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                {new Date(activeTab === "upcoming" ? item.dueDate : (activeTab === "pending" ? item.createdAt : item.date)).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-3 md:py-6">
                          <div className="flex md:flex-col items-center md:items-start justify-between">
                            <span className="md:hidden text-[10px] font-black uppercase text-muted-foreground tracking-widest">Type</span>
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                item.type === "Course Fee"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : "bg-emerald-500/10 text-emerald-500",
                              )}
                            >
                              {item.type || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-3 md:py-6">
                          <div className="flex md:flex-col items-center md:items-start justify-between">
                            <span className="md:hidden text-[10px] font-black uppercase text-muted-foreground tracking-widest">Student</span>
                            <div className="flex flex-col text-right md:text-left">
                              <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                                {item.student?.name}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">
                                {item.student?.university?.name}
                              </span>
                            </div>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-6 md:px-8 py-3 md:py-6">
                            <div className="flex md:flex-col items-center md:items-start justify-between">
                              <span className="md:hidden text-[10px] font-black uppercase text-muted-foreground tracking-widest">Partner</span>
                              <div className="flex flex-col text-right md:text-left">
                                <span className="text-sm font-black">{item.partner?.centerName || item.partner?.name}</span>
                                <span className="text-[10px] font-bold text-muted-foreground">ID: {item.partner?.centerId || "N/A"}</span>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 md:px-8 py-3 md:py-6 md:text-right">
                          <div className="flex md:flex-col items-center md:items-end justify-between">
                            <span className="md:hidden text-[10px] font-black uppercase text-muted-foreground tracking-widest">Amount</span>
                            <div className="flex flex-col items-end">
                              <p className="text-lg font-black text-foreground">₹{item.amount.toLocaleString()}</p>
                              {activeTab === "pending" && item.receipt && (
                                <button
                                  onClick={() => setViewingDoc({ url: item.receipt, title: "Payment Receipt" })}
                                  className="flex items-center gap-1 text-[8px] font-black text-primary hover:underline uppercase mt-1"
                                >
                                  <Eye className="w-3 h-3" /> View Receipt
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-5 md:py-6 text-center">
                          <div className="flex md:flex-col items-center justify-between gap-3">
                            <span className="md:hidden text-[10px] font-black uppercase text-muted-foreground tracking-widest">Actions</span>
                            {activeTab === "pending" ? (
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => handleApprove(item)}
                                  className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center"
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectingPaymentId(item._id);
                                    setShowRejectModal(true);
                                  }}
                                  className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            ) : activeTab === "recent" ? (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(item);
                                  setShowInvoiceModal(true);
                                }}
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-2xl transition-all border border-blue-600/10"
                              >
                                <Receipt className="w-4 h-4" /> Invoice
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate(`/dashboard/student-management/${item.student?._id}?tab=payment`)}
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:bg-primary hover:text-white px-4 py-2.5 rounded-2xl transition-all border border-primary/10"
                              >
                                <Users className="w-4 h-4" /> Profile
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Footer */}
              <div className="p-8 bg-muted/10 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Displaying {Math.min(paginatedData.length, itemsPerPage)} of {currentList.length} results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-6 py-3 rounded-xl border border-border/50 bg-white text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-muted transition-all"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-6 py-3 rounded-xl border border-border/50 bg-white text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-muted transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Reject Payment</h2>
                    <p className="text-muted-foreground font-medium text-sm">Provide reason for rejection.</p>
                  </div>
                  <button onClick={() => setShowRejectModal(false)} className="p-3 hover:bg-muted rounded-2xl"><X size={20} /></button>
                </div>
                <div className="space-y-6">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason..."
                    className="w-full p-4 rounded-[1.5rem] border border-border bg-muted/50 focus:border-primary outline-none transition-all text-sm h-32"
                  />
                  <div className="flex gap-4">
                    <button onClick={() => setShowRejectModal(false)} className="flex-1 py-4 rounded-3xl border border-border font-black text-sm">Cancel</button>
                    <button onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()} className="flex-1 py-4 rounded-3xl bg-rose-500 text-white font-black text-sm">Confirm Reject</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Approval Confirmation Modal */}
      <AnimatePresence>
        {showApproveModal && approvingPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApproveModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight leading-none">Verify Payment</h2>
                      <p className="text-muted-foreground font-medium text-xs mt-1 uppercase tracking-widest">Confirmation Required</p>
                    </div>
                  </div>
                  <button onClick={() => setShowApproveModal(false)} className="p-3 hover:bg-muted rounded-2xl transition-colors"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="p-6 rounded-3xl bg-muted/30 border border-border space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Student Name</p>
                        <p className="text-lg font-black text-foreground">{approvingPayment.student?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Amount</p>
                        <p className="text-2xl font-black text-primary">₹{approvingPayment.amount?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">University</p>
                        <p className="text-xs font-bold truncate">{approvingPayment.student?.university?.name || "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Partner</p>
                        <p className="text-xs font-bold truncate">{approvingPayment.partner?.centerName || approvingPayment.partner?.name || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="grid grid-cols-2 gap-4 px-2">
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Method</p>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold">{approvingPayment.method || "N/A"}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Transaction ID</p>
                      <span className="text-xs font-mono font-bold text-muted-foreground">{approvingPayment.transactionId || "N/A"}</span>
                    </div>
                  </div>

                  {/* Receipt Preview if exists */}
                  {approvingPayment.receipt && (
                    <div className="px-2">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Attachment</p>
                      <button 
                        onClick={() => setViewingDoc({ url: approvingPayment.receipt, title: "Payment Receipt" })}
                        className="w-full p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 text-primary">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-widest">Preview Receipt</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setShowApproveModal(false)} 
                      className="flex-1 py-4 rounded-3xl border border-border font-black text-sm hover:bg-muted transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmApprove} 
                      disabled={isProcessing} 
                      className="flex-1 py-4 rounded-3xl bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? "Verifying..." : "Approve Payment"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Doc Viewer Modal */}
      {viewingDoc && (
        <DocViewerModal
          isOpen={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
          url={viewingDoc.url}
          title={viewingDoc.title}
        />
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          payment={selectedInvoice}
        />
      )}
    </DashboardLayout>
  );
}
