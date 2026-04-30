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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getGlobalPaymentStats } from "../../api/payment.api";
import { getUniversities } from "../../api/university.api";
import { cn } from "../../lib/utils";
import { showAlert } from "../../redux/alertSlice";
import { useNavigate } from "react-router-dom";
import InvoiceModal from "../../components/payment/InvoiceModal";
import { useDispatch, useSelector } from "react-redux";

export default function PaymentManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin" || user?.type === "admin";

  const [data, setData] = useState({
    recentPayments: [],
    upcomingSchedules: [],
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
        const { getAllApprovedAdmissionPoints } = await import(
          "../../api/admissionPoint.api"
        );
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

  const applyFilters = (list, isSchedule = false) => {
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
      if (isAdmin && selectedPartner !== "all" && item.partner?._id !== selectedPartner)
        return false;

      // Date Range Filter
      const itemDate = new Date(isSchedule ? item.dueDate : item.date);
      if (startDate && itemDate < new Date(startDate)) return false;
      if (endDate && itemDate > new Date(endDate)) return false;

      return true;
    });
  };

  const filteredPayments = applyFilters(data.recentPayments);
  const filteredSchedules = applyFilters(data.upcomingSchedules, true);

  const currentList =
    activeTab === "recent" ? filteredPayments : filteredSchedules;
  const totalPages = Math.ceil(currentList.length / itemsPerPage);
  const paginatedData = currentList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <DashboardLayout title="Payment Management">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="sm:col-span-2 bg-gradient-to-br from-slate-900 via-primary to-blue-700 rounded-[2.5rem] p-10 text-primary-foreground shadow-2xl shadow-primary/30 relative overflow-hidden group min-h-[240px] flex flex-col justify-between">
            {/* Holographic Chip */}
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
                {filteredPayments
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

            {/* Decorative Elements */}
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

        {/* Search and Filters Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <div className="flex bg-muted/50 p-1.5 rounded-[1.5rem] border border-border w-fit whitespace-nowrap">
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
                placeholder={`Search ${activeTab === "recent" ? "payments" : "schedules"}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border/50 bg-card focus:border-primary/50 outline-none transition-all text-sm shadow-sm"
              />
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                "px-6 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2",
                startDate ||
                  endDate ||
                  selectedUni !== "all" ||
                  selectedPartner !== "all"
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-card border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary",
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              {startDate ||
              endDate ||
              selectedUni !== "all" ||
              selectedPartner !== "all"
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
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedPartner !== "all" && isAdmin && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-bold text-blue-600">
                  Partner:{" "}
                  {partners.find((p) => p._id === selectedPartner)?.centerName}
                  <button
                    onClick={() => setSelectedPartner("all")}
                    className="hover:text-rose-500"
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
                    className="hover:text-rose-500"
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

        {/* Content Area */}
        <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest">
                Loading Global Ledger...
              </p>
            </div>
          ) : (
            <div>
              {activeTab === "recent" ? (
                <>
                  {/* Desktop Recent Payments Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Student
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Transaction Info
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Date & Method
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                            Amount
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {paginatedData.map((p, idx) => (
                          <motion.tr
                            key={p._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.01 }}
                            className="group hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                  {p.student?.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-black group-hover:text-primary transition-colors">
                                    {p.student?.name}
                                  </p>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                    {p.student?.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit">
                                <Hash className="w-3 h-3" /> {p.transactionId}
                              </div>
                              <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">
                                Ref: {p.invoiceId}
                              </p>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-sm font-black">
                                {new Date(p.date).toLocaleDateString()}
                              </p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                {p.method}
                              </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <p className="text-lg font-black text-emerald-600">
                                ₹{p.amount.toLocaleString()}
                              </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(p);
                                    setShowInvoiceModal(true);
                                  }}
                                  className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase"
                                >
                                  <Receipt className="w-3.5 h-3.5" /> Invoice
                                </button>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/student-management/${p.student?._id}`,
                                    )
                                  }
                                  className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white transition-all"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Recent Payments Card View */}
                  <div className="md:hidden divide-y divide-border/50">
                    {paginatedData.map((p, idx) => (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.01 }}
                        className="p-6 space-y-4 active:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                              {p.student?.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black">
                                {p.student?.name}
                              </p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                {new Date(p.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-base font-black text-emerald-600">
                            ₹{p.amount.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase">
                            <span className="opacity-50">Ref:</span>{" "}
                            {p.invoiceId}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(p);
                                setShowInvoiceModal(true);
                              }}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-600"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/student-management/${p.student?._id}`,
                                )
                              }
                              className="p-2 rounded-lg bg-muted text-muted-foreground"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {filteredPayments.length === 0 && (
                    <div className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                      No recent transactions found
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Desktop Upcoming Schedules Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Student
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Due Date
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Description
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                            Scheduled Amount
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right whitespace-nowrap">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {paginatedData.map((s, idx) => (
                          <motion.tr
                            key={s._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.01 }}
                            className="group hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-black text-lg">
                                  {s.student?.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-black group-hover:text-primary transition-colors">
                                    {s.student?.name}
                                  </p>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                    {s.student?.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <p className="text-sm font-black">
                                  {new Date(s.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-tighter text-amber-500">
                                PENDING
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-sm font-bold text-muted-foreground">
                                {s.description}
                              </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <p className="text-lg font-black text-blue-600">
                                ₹{s.amount.toLocaleString()}
                              </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/dashboard/student-management/${s.student?._id}`,
                                  )
                                }
                                className="p-3 rounded-2xl bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white transition-all"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Upcoming Schedules Card View */}
                  <div className="md:hidden divide-y divide-border/50">
                    {paginatedData.map((s, idx) => (
                      <motion.div
                        key={s._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.01 }}
                        className="p-6 space-y-4 active:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-black">
                              {s.student?.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black">
                                {s.student?.name}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase">
                                <Clock className="w-3 h-3" />{" "}
                                {new Date(s.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <p className="text-base font-black text-blue-600">
                            ₹{s.amount.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-muted-foreground">
                            {s.description}
                          </p>
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/student-management/${s.student?._id}`,
                              )
                            }
                            className="p-2 rounded-lg bg-muted text-muted-foreground"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {filteredSchedules.length === 0 && (
                    <div className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                      No upcoming schedules found
                    </div>
                  )}
                </>
              )}

              {/* Pagination Footer */}
              <div className="p-8 bg-muted/10 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Displaying {Math.min(paginatedData.length, itemsPerPage)} of{" "}
                  {currentList.length} results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-6 py-3 rounded-xl border border-border/50 bg-white text-[10px] font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-all"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1.5 px-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={cn(
                          "w-10 h-10 rounded-xl text-[10px] font-black transition-all",
                          currentPage === i + 1
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                            : "bg-white border border-border/50 text-slate-500 hover:bg-muted",
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="px-6 py-3 rounded-xl border border-border/50 bg-white text-[10px] font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
                          {partner.centerName}
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

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        payment={selectedInvoice}
        student={selectedInvoice?.student}
      />
    </DashboardLayout>
  );
}
