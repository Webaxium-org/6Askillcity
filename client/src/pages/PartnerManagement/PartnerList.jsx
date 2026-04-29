import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserMinus,
  Mail,
  Phone,
  MapPin,
  Building2,
  GraduationCap,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPartners, togglePartnerActive } from "../../api/partner.api";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { handleFormError } from "../../utils/handleFormError";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

export default function PartnerList() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeFilter, startDate, endDate]);

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

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await getPartners();
      if (res.success) {
        setPartners(res.data);
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await togglePartnerActive(id, !currentStatus);
      if (res.success) {
        setPartners(
          partners.map((p) =>
            p._id === id ? { ...p, isActive: !currentStatus } : p,
          ),
        );
        dispatch(
          showAlert({
            type: "success",
            message: `Partner ${!currentStatus ? "activated" : "deactivated"} successfully`,
          }),
        );
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.licenseeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.licenseeEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" ? p.isActive : !p.isActive);

    // Date Range Filter
    if (startDate) {
      const start = new Date(startDate);
      const partnerDate = new Date(p.createdAt);
      if (partnerDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      const partnerDate = new Date(p.createdAt);
      if (partnerDate > end) return false;
    }

    return matchesSearch && matchesStatus && matchesActive;
  });

  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <DashboardLayout title="Partner Management">
      <div className="space-y-6">
        {/* Header / Search Area */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative group flex-1 min-w-[350px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border/50 bg-card focus:border-primary/50 outline-none transition-all text-sm shadow-sm"
              />
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                "px-6 py-3.5 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm",
                statusFilter !== "all" || activeFilter !== "all" || startDate || endDate
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-card border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary",
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              {statusFilter !== "all" || activeFilter !== "all" || startDate || endDate
                ? "Active"
                : "Filters"}
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        <AnimatePresence>
          {(statusFilter !== "all" || activeFilter !== "all" || startDate || endDate) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap items-center gap-2 mb-8"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">
                Active Nodes:
              </span>

              {statusFilter !== "all" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-bold text-primary capitalize">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {activeFilter !== "all" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-600 capitalize">
                  State: {activeFilter}
                  <button
                    onClick={() => setActiveFilter("all")}
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {(startDate || endDate) && (
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-bold text-rose-600">
                  Joined: {startDate || "Start"} to {endDate || "End"}
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="hover:text-slate-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setStatusFilter("all");
                  setActiveFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 hover:underline ml-2"
              >
                Clear Network Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array(8)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-2xl p-6 animate-pulse"
                  >
                    <div className="flex justify-between mb-4">
                      <div className="w-12 h-12 bg-muted rounded-xl" />
                      <div className="w-20 h-6 bg-muted rounded-lg" />
                    </div>
                    <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2 mb-6" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </div>
                  </div>
                ))
            ) : paginatedPartners.length === 0 ? (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-muted-foreground bg-card/40 border-2 border-dashed border-border rounded-[3rem]">
                <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                  No matching nodes found
                </p>
              </div>
            ) : (
              paginatedPartners.map((partner) => (
                <motion.div
                  layout
                  key={partner._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className="absolute top-0 right-0 p-4">
                    <div
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        partner.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : partner.status === "pending"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {partner.status === "approved" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : partner.status === "pending" ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {partner.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate leading-tight">
                        {partner.centerName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {partner.licenseeName}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="truncate">{partner.licenseeEmail}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span>{partner.licenseeContactNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="truncate">
                        {partner.location.city}, {partner.location.state}
                      </span>
                    </div>

                    {/* Universities & Courses Summary */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-primary/5 border border-primary/10 p-2.5 rounded-xl">
                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-primary/70 mb-1 flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5" /> Universities
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {partner.assignedUnis?.length > 0 ? (
                            partner.assignedUnis.map((uni, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase"
                              >
                                {uni}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">
                              None assigned
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-600/70 mb-1 flex items-center gap-1">
                          <GraduationCap className="w-2.5 h-2.5" /> Courses
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-emerald-600 leading-none">
                            {partner.programCount || 0}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600/60 uppercase">
                            Programs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleToggleActive(partner._id, partner.isActive)
                        }
                        className={`p-2 rounded-xl transition-all border ${
                          partner.isActive
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                            : "bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white"
                        }`}
                        title={
                          partner.isActive
                            ? "Deactivate Partner"
                            : "Activate Partner"
                        }
                      >
                        {partner.isActive ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserMinus className="w-4 h-4" />
                        )}
                      </button>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {partner.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/dashboard/partner-management/${partner._id}`)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all group/btn"
                    >
                      View Profile
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Standardized Pagination Footer */}
        {filteredPartners.length > 0 && (
          <div className="mt-12 p-8 bg-muted/10 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-[2.5rem]">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Displaying {Math.min(paginatedPartners.length, itemsPerPage)} of{" "}
              {filteredPartners.length} results
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
        )}
      </div>

      {/* Futuristic Filter Console */}
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
                    Network Filters
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Partner Node Protocol
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                {/* Approval Status */}
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                        Approval Status
                      </h4>
                      <p className="text-[9px] font-bold text-muted-foreground">
                        Filter by verification state
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["all", "approved", "pending", "rejected"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={cn(
                            "py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                            statusFilter === status
                              ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                              : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-primary/20 hover:text-primary",
                          )}
                        >
                          {status}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Account State */}
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-600">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                        Account State
                      </h4>
                      <p className="text-[9px] font-bold text-muted-foreground">
                        Filter by active toggle
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["all", "active", "inactive"].map((state) => (
                      <button
                        key={state}
                        onClick={() => setActiveFilter(state)}
                        className={cn(
                          "py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          activeFilter === state
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                            : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-primary/20 hover:text-primary",
                        )}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Registration Period */}
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/5 flex items-center justify-center text-rose-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Registration Period</h4>
                      <p className="text-[9px] font-bold text-muted-foreground">Select onboard date range</p>
                    </div>
                  </div>
                  
                  {/* Quick Select Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {["today", "week", "month", "year"].map((range) => (
                      <button
                        key={range}
                        onClick={() => setQuickRange(range)}
                        className="py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                      >
                        {range === "week" ? "This Week" : range === "month" ? "This Month" : range === "year" ? "This Year" : "Today"}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">From Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-rose-500/30 focus:bg-white focus:ring-4 focus:ring-rose-500/5 transition-all"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">To Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-rose-500/30 focus:bg-white focus:ring-4 focus:ring-rose-500/5 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-border/5 bg-slate-50/50 flex gap-4">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setActiveFilter("all");
                    setSearchTerm("");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="flex-1 py-4 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                >
                  Reset Protocol
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
    </DashboardLayout>
  );
}
