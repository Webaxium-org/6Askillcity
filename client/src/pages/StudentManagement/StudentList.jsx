import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import {
  Users,
  Search,
  Filter,
  ChevronRight,
  GraduationCap,
  Building2,
  BadgeDollarSign,
  ArrowUpDown,
  Download,
  Mail,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getManagementStudents } from "../../api/payment.api";
import { useDispatch, useSelector } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { StatCard } from "../../components/dashboard/StatCard";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../components/dashboard/StatCard";

export default function StudentList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin" || user?.type === "admin";
  const isManager = user?.role === "manager";

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, paid, pending

  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUni, setSelectedUni] = useState("all");
  const [selectedProg, setSelectedProg] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [partners, setPartners] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("created"); // created, approved
  
  const batches = (() => {
    const b = [];
    const currentYear = new Date().getFullYear();
    for (let y = 2024; y <= currentYear + 3; y++) {
      b.push(`Jan-${y}`, `June-${y}`);
    }
    return b;
  })();
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, startDate, endDate, selectedUni, selectedProg, filterType, selectedPartner, selectedBatch, dateFilterType]);

  const setQuickRange = (range) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch(range) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'week':
        const diff = today.getDate() - today.getDay();
        start = new Date(today.setDate(diff));
        end = new Date();
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date();
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchFilterData();
  }, []);

  const fetchFilterData = async () => {
    try {
      const { getUniversities, getPrograms } = await import("../../api/university.api");
      
      if (isAdmin || isManager) {
        const { getAllApprovedAdmissionPoints } = await import("../../api/admissionPoint.api");
        const [uniRes, partnerRes, progRes] = await Promise.all([
          getUniversities(),
          getAllApprovedAdmissionPoints(),
          getPrograms()
        ]);
        if (uniRes.success) setUniversities(uniRes.data);
        if (partnerRes.success) setPartners(partnerRes.data);
        if (progRes.success) setPrograms(progRes.data);
      } else {
        const { getPermittedCourses } = await import("../../api/partner.api");
        const res = await getPermittedCourses();
        if (res.success) {
          const permittedUnis = [];
          const permittedProgs = [];
          const uniIds = new Set();
          const progIds = new Set();
          res.data.forEach(item => {
            const uni = item.university;
            const prog = item.program;
            if (uni && !uniIds.has(uni._id)) {
              uniIds.add(uni._id);
              permittedUnis.push(uni);
            }
            if (prog && !progIds.has(prog._id)) {
              progIds.add(prog._id);
              permittedProgs.push(prog);
            }
          });
          setUniversities(permittedUnis);
          setPrograms(permittedProgs);
        }
      }
    } catch (error) {
      console.error("Failed to load filter data", error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getManagementStudents();
      if (res.success) {
        setStudents(res.data);
      }
    } catch (error) {
      dispatch(
        showAlert({
          type: "error",
          message: "Failed to load student management list",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.university?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.program?.name || "").toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    // Payment Filter
    if (filterType === "paid" && s.paymentStatus !== "Paid") return false;
    if (filterType === "pending" && s.paymentStatus === "Paid") return false;

    // University/Program Filter
    if (selectedUni !== "all" && s.university?._id !== selectedUni)
      return false;
    if (selectedProg !== "all" && s.program?._id !== selectedProg) return false;

    // Date Range Filter
    if (startDate || endDate) {
      const dateToCompare = dateFilterType === "created" ? s.createdAt : s.eligibilityApprovalDate;
      
      if (!dateToCompare) return false;

      const studentDate = new Date(dateToCompare);
      
      if (startDate) {
        const start = new Date(startDate);
        if (studentDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (studentDate > end) return false;
      }
    }

    // Partner Filter
    if ((isAdmin || isManager) && selectedPartner !== "all" && s.registeredBy !== selectedPartner) return false;

    // Batch Filter
    if (selectedBatch !== "all" && s.batch !== selectedBatch) return false;

    return true;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Partially Paid":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const totals = students.reduce(
    (acc, curr) => {
      const isPaid = curr.paymentStatus === "Paid";
      return {
        total: acc.total + 1,
        paidAmount: acc.paidAmount + (curr.totalFeePaid || 0),
        pendingAmount:
          acc.pendingAmount +
          Math.max(
            0,
            (curr.programFee?.totalFee || 0) - (curr.totalFeePaid || 0),
          ),
        paidCount: acc.paidCount + (isPaid ? 1 : 0),
        pendingCount: acc.pendingCount + (isPaid ? 0 : 1),
      };
    },
    {
      total: 0,
      paidAmount: 0,
      pendingAmount: 0,
      paidCount: 0,
      pendingCount: 0,
    },
  );

  return (
    <DashboardLayout title="Student Management">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        {/* Quick Stats Overview */}
        <div
          className={cn(
            "grid gap-6",
            isManager
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          <StatCard
            title="Total Students"
            value={totals.total}
            icon={Users}
            subtext="Full Database Record"
            color="purple"
            onClick={() => setFilterType("all")}
            className={
              filterType === "all"
                ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20"
                : ""
            }
          />
          {!isManager && (
            <>
              <StatCard
                title="Fee Paid Students"
                value={totals.paidCount}
                icon={CheckCircle2}
                subtext={`Collected: ₹${totals.paidAmount.toLocaleString()}`}
                color="emerald"
                onClick={() => setFilterType("paid")}
                className={
                  filterType === "paid"
                    ? "ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20"
                    : ""
                }
              />
              <StatCard
                title="Fee Pending Students"
                value={totals.pendingCount}
                icon={Clock}
                subtext={`Pending: ₹${totals.pendingAmount.toLocaleString()}`}
                color="rose"
                onClick={() => setFilterType("pending")}
                className={
                  filterType === "pending"
                    ? "ring-2 ring-rose-500 shadow-lg shadow-rose-500/20"
                    : ""
                }
              />
            </>
          )}
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card border border-border p-4 rounded-[2rem] shadow-sm">
          <div className="flex flex-1 items-center gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, university or program..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-muted/30 focus:border-primary outline-none transition-all text-sm"
              />
            </div>
            {filterType !== "all" && (
              <button
                onClick={() => setFilterType("all")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-widest transition-all shrink-0"
              >
                <X className="w-3 h-3" />
                Clear {filterType} Filter
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "relative group px-6 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden border",
                  showFilters || startDate || endDate || selectedUni !== "all"
                    ? "bg-primary text-white border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                    : "bg-card/40 backdrop-blur-xl border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary",
                )}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <Filter
                    className={cn(
                      "w-4 h-4 transition-transform duration-500",
                      showFilters && "rotate-180",
                    )}
                  />
                  {showFilters
                    ? "Collapse"
                    : startDate || endDate || selectedUni !== "all" || selectedPartner !== "all"
                      ? "Active"
                      : "Filters"}
                </div>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-3 px-8 py-4 rounded-[1.5rem] bg-card/40 backdrop-blur-xl border border-border/50 text-xs font-black uppercase tracking-[0.2em] hover:bg-muted/50 hover:border-primary/30 transition-all group">
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        <AnimatePresence>
          {(startDate || endDate || selectedUni !== "all" || selectedProg !== "all" || selectedPartner !== "all" || selectedBatch !== "all") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap items-center gap-2 px-2"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">
                Active:
              </span>

              {selectedUni !== "all" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-bold text-primary">
                  University:{" "}
                  {universities.find((u) => u._id === selectedUni)?.name}
                  <button
                    onClick={() => {
                      setSelectedUni("all");
                      setSelectedProg("all");
                    }}
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedProg !== "all" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-bold text-indigo-600">
                  Course:{" "}
                  {programs.find((p) => p._id === selectedProg)?.name}
                  <button
                    onClick={() => setSelectedProg("all")}
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedPartner !== "all" && (isAdmin || isManager) && (
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

              {startDate || endDate ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-600">
                  {dateFilterType === "created" ? "Registration" : "Approval"}: {startDate || "Start"} to {endDate || "End"}
                  <button onClick={() => { setStartDate(""); setEndDate(""); }} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
                </div>
              ) : null}

              {selectedBatch !== "all" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] font-bold text-amber-600">
                  Batch: {selectedBatch}
                  <button
                    onClick={() => setSelectedBatch("all")}
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
                  setSelectedProg("all");
                  setSelectedPartner("all");
                  setSelectedBatch("all");
                }}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 hover:underline ml-2"
              >
                Clear All
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table/Card Container */}
        <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    <div className="flex items-center gap-2">
                      Student Info <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    University & Program
                  </th>
                  {!isManager && (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        Payment Status
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                        Fee Progress
                      </th>
                    </>
                  )}
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="font-bold uppercase tracking-tighter text-xs">
                          Fetching Dataset...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-20 text-center space-y-3"
                    >
                      <Users className="w-12 h-12 mx-auto opacity-10" />
                      <p className="text-muted-foreground font-medium">
                        No students found matching your criteria.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student, idx) => {
                    const totalFee = student.programFee?.totalFee || 1;
                    const percent = Math.round(
                      (student.totalFeePaid / totalFee) * 100,
                    );

                    return (
                      <motion.tr
                        key={student._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.01 }}
                        onClick={() =>
                          navigate(
                            `/dashboard/student-management/${student._id}`,
                          )
                        }
                        className="group cursor-pointer hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg group-hover:scale-110 transition-transform">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                                {student.name}
                              </p>
                              <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" /> {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                              <Building2 className="w-3.5 h-3.5 text-primary" />
                              <span className="truncate max-w-[150px]">
                                {student.university?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[150px]">
                                {student.program?.name}
                              </span>
                            </div>
                          </div>
                        </td>
                        {!isManager && (
                          <>
                            <td className="px-8 py-6">
                              <span
                                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(student.paymentStatus)}`}
                              >
                                {student.paymentStatus}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right min-w-[200px]">
                              <div className="space-y-1.5 inline-block w-full max-w-[180px]">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                                  <span>
                                    ₹{student.totalFeePaid.toLocaleString()}
                                  </span>
                                  <span>{percent}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50 p-[1px]">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    className={`h-full rounded-full ${percent === 100 ? "bg-emerald-500" : "bg-primary"}`}
                                  />
                                </div>
                              </div>
                            </td>
                          </>
                        )}
                        <td className="px-8 py-6 text-right">
                          <button className="p-3 rounded-2xl bg-muted/50 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border/50">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase text-muted-foreground">
                  Loading Students...
                </p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground font-bold">
                  No students found.
                </p>
              </div>
            ) : (
              paginatedStudents.map((student, idx) => {
                const totalFee = student.programFee?.totalFee || 1;
                const percent = Math.round(
                  (student.totalFeePaid / totalFee) * 100,
                );

                return (
                  <motion.div
                    key={student._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    onClick={() =>
                      navigate(`/dashboard/student-management/${student._id}`)
                    }
                    className="p-6 space-y-4 active:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-black">{student.name}</h4>
                          <p className="text-[10px] font-bold text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">
                          University
                        </p>
                        <p className="text-[10px] font-bold truncate">
                          {student.university?.name}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">
                          Status
                        </p>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(student.paymentStatus)}`}
                        >
                          {student.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground">
                        <span>
                          Paid: ₹{student.totalFeePaid.toLocaleString()}
                        </span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className={`h-full rounded-full ${percent === 100 ? "bg-emerald-500" : "bg-primary"}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Table Footer / Pagination */}
          <div className="p-8 bg-muted/10 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Displaying {Math.min(paginatedStudents.length, itemsPerPage)} of {filteredStudents.length} results
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
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
                        : "bg-white border border-border/50 text-slate-500 hover:bg-muted"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-6 py-3 rounded-xl border border-border/50 bg-white text-[10px] font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Futuristic Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 h-screen w-screen bg-slate-900/40 backdrop-blur-md z-[9999]"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 h-screen w-full max-w-md bg-white border-l border-border/50 z-[10000] shadow-[-20px_0_80px_rgba(0,0,0,0.15)] flex flex-col"
              >
                {/* Header */}
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
                    Data Filtering Protocol
                  </p>
                </div>

                {/* Filter Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12">
                  {/* University */}
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
                          Select partner institution
                        </p>
                      </div>
                    </div>
                    <select
                      value={selectedUni}
                      onChange={(e) => {
                        setSelectedUni(e.target.value);
                        setSelectedProg("all");
                      }}
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

                  {/* Program/Course */}
                  {selectedUni !== "all" && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/5 flex items-center justify-center text-indigo-600">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                            Course
                          </h4>
                          <p className="text-[9px] font-bold text-muted-foreground">
                            Select academic program
                          </p>
                        </div>
                      </div>
                      <select
                        value={selectedProg}
                        onChange={(e) => setSelectedProg(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-indigo-500/30 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none"
                      >
                        <option value="all">All Courses</option>
                        {programs
                          .filter((prog) => (prog.university?._id || prog.university) === selectedUni)
                          .map((prog) => (
                            <option key={prog._id} value={prog._id}>
                              {prog.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {(isAdmin || isManager) && (
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

                  {/* Batch */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/5 flex items-center justify-center text-amber-600">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                          Enrollment Batch
                        </h4>
                        <p className="text-[9px] font-bold text-muted-foreground">
                          Filter by student intake
                        </p>
                      </div>
                    </div>
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-amber-500/30 focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all appearance-none"
                    >
                      <option value="all">Global (All Batches)</option>
                      {batches.map((batch) => (
                        <option key={batch} value={batch}>
                          {batch}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Registration Range */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                          Date Range
                        </h4>
                        <p className="text-[9px] font-bold text-muted-foreground">
                          Select enrollment period
                        </p>
                      </div>
                    </div>

                    {/* Date Type Toggle */}
                    <div className="flex p-1 bg-slate-100 rounded-2xl">
                      {['created', 'approved'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setDateFilterType(type)}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                            dateFilterType === type 
                              ? "bg-white text-emerald-600 shadow-sm" 
                              : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          {type === 'created' ? 'Registration Date' : 'Approval Date'}
                        </button>
                      ))}
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
                          Start Date
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
                          End Date
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

                {/* Footer Actions */}
                <div className="p-10 border-t border-border/5 bg-slate-50/50 flex gap-4">
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setSelectedUni("all");
                      setSelectedProg("all");
                      setSelectedPartner("all");
                      setSelectedBatch("all");
                      setFilterType("all");
                      setDateFilterType("created");
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
      </div>
    </DashboardLayout>
  );
}
