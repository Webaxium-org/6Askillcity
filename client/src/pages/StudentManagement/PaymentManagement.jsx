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
    rejectedPayments: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recent");
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
        item.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.partner?.centerName?.toLowerCase().includes(search.toLowerCase()) ||
        item.partner?.name?.toLowerCase().includes(search.toLowerCase()) ||
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
  const filteredRejected = applyFilters(data.rejectedPayments || [], false, true);

  const currentList =
    activeTab === "pending"
      ? filteredPending
      : activeTab === "rejected"
        ? filteredRejected
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

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
              <button
                onClick={() => setActiveTab("recent")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "recent" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Recent Payments
              </button>
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
                onClick={() => setActiveTab("rejected")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === "rejected" ? "bg-card text-rose-500 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Rejected Payments
                {data.rejectedPayments?.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">
                    {data.rejectedPayments.length}
                  </span>
                )}
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
              {startDate || endDate || selectedUni !== "all" || selectedPartner !== "all"
                ? "Active"
                : "Filters"}
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        <AnimatePresence>
          {(startDate ||
            endDate ||
            selectedUni !== "all" ||
            selectedPartner !== "all") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">
                Active Filters:
              </span>

              {selectedUni !== "all" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-bold text-primary">
                  University:{" "}
                  {universities.find((u) => u._id === selectedUni)?.name}
                  <button
                    onClick={() => setSelectedUni("all")}
                    className="hover:text-rose-500 animate-pulse"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedPartner !== "all" && isAdmin && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-bold text-blue-600">
                  Partner:{" "}
                  {partners.find((p) => p._id === selectedPartner)?.centerName || partners.find((p) => p._id === selectedPartner)?.name}
                  <button
                    onClick={() => setSelectedPartner("all")}
                    className="hover:text-rose-500 animate-pulse"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {(startDate || endDate) && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-600">
                  Period: {startDate || "Start"} to {endDate || "End"}
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="hover:text-rose-500 animate-pulse"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSelectedUni("all");
                  setSelectedPartner("all");
                }}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 hover:underline ml-2"
              >
                Clear All
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
                        {activeTab === "pending" || activeTab === "rejected" ? "Requested Date" : activeTab === "upcoming" ? "Due Date" : "Date"}
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        Type
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        Payment For
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
                                {new Date(activeTab === "upcoming" ? item.dueDate : (activeTab === "pending" || activeTab === "rejected" ? item.createdAt : item.date)).toLocaleDateString("en-IN")}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                {new Date(activeTab === "upcoming" ? item.dueDate : (activeTab === "pending" || activeTab === "rejected" ? item.createdAt : item.date)).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-3 md:py-6">
                          <div className="flex md:flex-col items-center md:items-start justify-between">
                            <span className="md:hidden text-[10px] font-black uppercase text-muted-foreground tracking-widest">Type</span>
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap",
                                item.type === "Course Fee"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : item.type === "Onboarding Inspection Fee"
                                    ? "bg-violet-500/10 text-violet-500"
                                    : "bg-emerald-500/10 text-emerald-500",
                              )}
                            >
                              {item.type || "N/A"}
                            </span>
                            {activeTab === "rejected" && item.rejectionReason && (
                              <div className="mt-2 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1.5 rounded-lg border border-rose-100 max-w-[150px] md:max-w-[200px]" title={item.rejectionReason}>
                                <span className="line-clamp-2">Reason: {item.rejectionReason}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-3 md:py-6">
                          <div className="flex md:flex-col items-center md:items-start justify-between">
                            <span className="md:hidden text-[10px] font-black uppercase text-muted-foreground tracking-widest">Payment For</span>
                            <div className="flex flex-col text-right md:text-left">
                              <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                                {item.student?.name || item.partner?.centerName || item.partner?.name || "Partner onboarding"}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">
                                {item.student?.university?.name || (item.type === "Onboarding Inspection Fee" ? "Admission Point" : "")}
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
                              {(activeTab === "pending" || activeTab === "rejected") && item.receipt && (
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
                            {activeTab === "pending" || activeTab === "rejected" ? (
                              <div className="flex items-center justify-center gap-3">
                                {isAdmin && activeTab === "pending" && (
                                  <button
                                    onClick={() => handleApprove(item)}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white border border-blue-500/20 hover:border-blue-500 transition-all duration-200 text-[10px] font-black uppercase tracking-widest"
                                    title="View Payment Details"
                                  >
                                    <Check className="w-4 h-4" />
                                    View Details
                                  </button>
                                )}
                                {(activeTab === "rejected" || !isAdmin) && item.student?._id && (
                                  <button
                                    onClick={() => navigate(`/dashboard/student-management/${item.student?._id}?tab=payment`)}
                                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:bg-primary hover:text-white px-4 py-2.5 rounded-2xl transition-all border border-primary/10"
                                  >
                                    <Users className="w-4 h-4" /> Profile
                                  </button>
                                )}
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
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Payment For</p>
                        <p className="text-lg font-black text-foreground">{approvingPayment.student?.name || approvingPayment.partner?.centerName || approvingPayment.partner?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Amount</p>
                        <p className="text-2xl font-black text-primary">₹{approvingPayment.amount?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">University</p>
                        <p className="text-xs font-bold truncate">{approvingPayment.student?.university?.name || (approvingPayment.type === "Onboarding Inspection Fee" ? "Admission Point Onboarding" : "N/A")}</p>
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
                      onClick={() => {
                        setShowApproveModal(false);
                        setRejectingPaymentId(approvingPayment._id);
                        setShowRejectModal(true);
                      }}
                      className="flex-1 py-4 rounded-3xl border border-rose-500/30 text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white font-black text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Reject
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

      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 h-screen w-screen bg-slate-900/40 backdrop-blur-md z-[9999]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-screen w-full max-w-md bg-white border-l border-border/50 z-[10000] shadow-[-20px_0_80px_rgba(0,0,0,0.15)] flex flex-col"
            >
              <div className="p-10 border-b border-border/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Financial Data Protocol
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                        University
                      </h4>
                      <p className="text-[9px] font-bold text-muted-foreground">
                        Filter by institution
                      </p>
                    </div>
                  </div>
                  <select
                    value={selectedUni}
                    onChange={(e) => setSelectedUni(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                  >
                    <option value="all">Global (All)</option>
                    {universities.map((uni) => (
                      <option key={uni._id} value={uni._id}>
                        {uni.name}
                      </option>
                    ))}
                  </select>
                </div>

                {isAdmin && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                          Admission Point
                        </h4>
                        <p className="text-[9px] font-bold text-muted-foreground">
                          Filter by registered partner
                        </p>
                      </div>
                    </div>
                    <select
                      value={selectedPartner}
                      onChange={(e) => setSelectedPartner(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-blue-500/30 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none"
                    >
                      <option value="all">Global (All Partners)</option>
                      {partners.map((partner) => (
                        <option key={partner._id} value={partner._id}>
                          {partner.centerName || partner.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                        Transaction Period
                      </h4>
                      <p className="text-[9px] font-bold text-muted-foreground">
                        Select date range
                      </p>
                    </div>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {["today", "week", "month", "year"].map((range) => (
                      <button
                        key={range}
                        onClick={() => setQuickRange(range)}
                        className="py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                      >
                        {range === "week"
                          ? "This Week"
                          : range === "month"
                            ? "This Month"
                            : range === "year"
                              ? "This Year"
                              : "Today"}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-emerald-500/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-emerald-500/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-border/5 bg-slate-50/50 flex gap-4">
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setSelectedUni("all");
                    setSelectedPartner("all");
                  }}
                  className="flex-1 py-4 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Close Console
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          payment={selectedInvoice}
          student={
            selectedInvoice.student ||
            (selectedInvoice.type === "Onboarding Inspection Fee"
              ? {
                  name: selectedInvoice.partner?.centerName || selectedInvoice.partner?.name,
                  email: selectedInvoice.partner?.licenseeEmail,
                  phone: selectedInvoice.partner?.licenseeContactNumber,
                }
              : undefined)
          }
        />
      )}
    </DashboardLayout>
  );
}
