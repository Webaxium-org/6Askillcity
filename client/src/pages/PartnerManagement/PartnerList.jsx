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
  Activity,
  ShieldCheck,
  User as UserIcon,
  ShieldAlert,
  FileText,
  ExternalLink,
  Video,
  Image,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPartners, togglePartnerActive, completePartnerInspection, reviewPartner, rejectPartnerInspection } from "../../api/partner.api";
import { getUniversities } from "../../api/university.api.js";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { handleFormError } from "../../utils/handleFormError";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { AuthorisationLetterModal } from "../../components/dashboard/AuthorisationLetterModal";

export default function PartnerList() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("authorisation");
  const [universities, setUniversities] = useState([]);

  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Inspection completion state
  const [inspectionPartnerId, setInspectionPartnerId] = useState(null);
  const [isCompletingInspection, setIsCompletingInspection] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [letterPartner, setLetterPartner] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal states
  const [viewDetailsPoint, setViewDetailsPoint] = useState(null);
  const [approveWarningId, setApproveWarningId] = useState(null);
  const [rejectWarningId, setRejectWarningId] = useState(null);
  
  // Inspection Rejection state
  const [rejectInspectionPartnerId, setRejectInspectionPartnerId] = useState(null);
  const [rejectInspectionReason, setRejectInspectionReason] = useState("");
  const [isRejectingInspection, setIsRejectingInspection] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    activeFilter,
    universityFilter,
    startDate,
    endDate,
  ]);

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

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPartners();
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await getUniversities();
      if (res.success) {
        setUniversities(res.data);
      }
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

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

  const handleCompleteInspection = async (partnerId) => {
    setIsCompletingInspection(true);
    setInspectionPartnerId(partnerId);
    try {
      const res = await completePartnerInspection(partnerId);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Inspection completed & Authorisation Letter generated!" }));
        // Update local state
        setPartners(partners.map(p =>
          p._id === partnerId ? { ...p, onboardingState: "completed", inspectionCompletedAt: new Date().toISOString() } : p
        ));
        setLetterPartner(res.data);
        setShowLetterModal(true);
        setViewDetailsPoint(null);
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setIsCompletingInspection(false);
      setInspectionPartnerId(null);
    }
  };

  const handleRejectInspectionSubmit = async () => {
    if (!rejectInspectionPartnerId || !rejectInspectionReason.trim()) return;
    setIsRejectingInspection(true);
    try {
      const res = await rejectPartnerInspection(rejectInspectionPartnerId, rejectInspectionReason);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Partner inspection rejected. They will need to re-upload media." }));
        // Update local state
        setPartners(partners.map(p =>
          p._id === rejectInspectionPartnerId ? { ...p, inspectionStatus: "rejected", inspectionRejectionReason: rejectInspectionReason } : p
        ));
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setIsRejectingInspection(false);
      setRejectInspectionPartnerId(null);
      setRejectInspectionReason("");
    }
  };

  const confirmApprove = async () => {
    if (!approveWarningId) return;
    const id = approveWarningId;
    setApproveWarningId(null);
    try {
      const res = await reviewPartner(id, "approved");
      if (res.success) {
        setPartners(partners.filter(p => p._id !== id));
        dispatch(showAlert({ type: "success", message: "Partner approved successfully" }));
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const confirmReject = async () => {
    if (!rejectWarningId) return;
    const id = rejectWarningId;
    setRejectWarningId(null);
    try {
      const res = await reviewPartner(id, "rejected");
      if (res.success) {
        setPartners(partners.filter(p => p._id !== id));
        dispatch(showAlert({ type: "success", message: "Partner rejected successfully" }));
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const filteredPartners = partners.filter((p) => {
    // Tab Filter
    let matchesTab = false;
    if (activeTab === "overview") {
      matchesTab = p.status === "approved" && p.onboardingState === "completed";
    } else if (activeTab === "onboarding") {
      matchesTab = p.status === "approved" && p.onboardingState !== "completed";
    } else if (activeTab === "authorisation") {
      matchesTab = p.status === "pending";
    } else {
      matchesTab = true; // fallback
    }

    if (!matchesTab) return false;

    const matchesSearch =
      p.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.licenseeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.licenseeEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" ? p.isActive : !p.isActive);

    const matchesUniversity =
      universityFilter === "all" ||
      p.assignedUnis?.some((u) => u === universityFilter);

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

    return (
      matchesSearch && matchesStatus && matchesActive && matchesUniversity
    );
  });

  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const authCount = partners.filter(p => p.status === "pending").length;
  const onboardingCount = partners.filter(p => p.status === "approved" && p.onboardingState !== "completed").length;

  const tabs = [
    { id: "authorisation", label: "Authorisation Review", icon: ShieldCheck, count: authCount },
    { id: "onboarding", label: "Onboarding & Fees", icon: Clock, count: onboardingCount },
    { id: "overview", label: "Network Overview", icon: Users },
  ];

  return (
    <DashboardLayout title="Partner Network">
      <div className="space-y-6">
        {/* Header / Search Area */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <div className="relative group flex-1 sm:min-w-[350px]">
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
                "px-6 py-3.5 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto",
                statusFilter !== "all" ||
                  activeFilter !== "all" ||
                  universityFilter !== "all" ||
                  startDate ||
                  endDate
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-card border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary",
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              {statusFilter !== "all" ||
              activeFilter !== "all" ||
              startDate ||
              endDate
                ? "Active"
                : "Filters"}
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        <AnimatePresence>
          {(statusFilter !== "all" ||
            activeFilter !== "all" ||
            startDate ||
            endDate) && (
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

              {universityFilter !== "all" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[10px] font-bold text-purple-600 capitalize">
                  University: {universityFilter}
                  <button
                    onClick={() => setUniversityFilter("all")}
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setStatusFilter("all");
                  setActiveFilter("all");
                  setUniversityFilter("all");
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


      </div>

      {/* Tab Navigation Row - Image Style */}
      <div className="overflow-x-auto pt-3 pb-4 -mx-4 px-4 scrollbar-hide">
        <div className="flex items-center gap-3 min-w-max">
          {tabs.map((tab) => (
            <div key={tab.id} className="relative">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all relative overflow-hidden group border",
                  activeTab === tab.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20"
                    : "bg-card border-border/60 text-muted-foreground/80 hover:border-primary/50 hover:text-primary",
                )}
              >
                <tab.icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    activeTab === tab.id
                      ? "text-white"
                      : "text-muted-foreground group-hover:text-primary",
                  )}
                />
                {tab.label}
              </button>
              {tab.count > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse shadow-sm z-10 border-2 border-background">
                  {tab.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="py-20 flex justify-center text-muted-foreground">
            Loading...
          </div>
        ) : activeTab === "authorisation" ? (
          <motion.div
            key="auth-table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Center & Licensee
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPartners.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        <div className="px-6 py-20 text-center text-muted-foreground flex flex-col items-center">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                            <Activity className="w-6 h-6 text-muted-foreground/50" />
                          </div>
                          No pending partners for authorisation review.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedPartners.map((partner) => (
                      <tr
                        key={partner._id}
                        className="hover:bg-muted/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-sm text-foreground mb-0.5">
                            {partner.centerName}
                          </div>
                          <div className="text-xs font-medium text-muted-foreground">
                            {partner.licenseeName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="w-3 h-3" /> {partner.licenseeEmail}
                            </span>
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="w-3 h-3" /> {partner.licenseeContactNumber || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {partner.location?.city}, {partner.location?.state}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(
                            partner.createdAt || new Date(),
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewDetailsPoint(partner)}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/20 hover:border-blue-500 transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : activeTab === "onboarding" ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Center & Licensee
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Onboarding Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPartners.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-20 text-center text-muted-foreground"
                        >
                          No partners currently in the onboarding queue.
                        </td>
                      </tr>
                    ) : (
                      paginatedPartners.map((partner) => (
                        <tr
                          key={partner._id}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="font-bold text-sm text-foreground mb-0.5">
                              {partner.centerName}
                            </div>
                            <div className="text-xs font-medium text-muted-foreground">
                              {partner.licenseeName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 text-xs">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="w-3 h-3" /> {partner.licenseeEmail}
                              </span>
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="w-3 h-3" /> {partner.licenseeContactNumber}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {partner.location?.city}, {partner.location?.state}
                          </td>
                          <td className="px-6 py-4">
                            {partner.onboardingState === "fee_pending" && (
                              <span className="px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> Fee Pending
                              </span>
                            )}
                            {partner.onboardingState === "inspection_pending" && (
                              <span className="px-3 py-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                                <Activity className="w-3 h-3 animate-pulse" /> Awaiting Inspection
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/dashboard/partner-management/${partner._id}`)
                                }
                                className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all border border-blue-500/20"
                                title="View Profile"
                              >
                                <UserIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setViewDetailsPoint(partner)}
                                className={cn(
                                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm",
                                  partner.documents?.officeVideo?.length > 0
                                    ? "bg-purple-500 text-white hover:bg-purple-600 shadow-purple-500/20"
                                    : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                )}
                                disabled={!(partner.documents?.officeVideo?.length > 0)}
                                title={partner.documents?.officeVideo?.length > 0 ? "View Inspection Media" : "Waiting for Upload"}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredPartners.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground bg-card border border-border/50 rounded-3xl">
                No partners found matching your criteria.
              </div>
            ) : (
              paginatedPartners.map((partner) => (
                <div key={partner._id} className="bg-card border border-border/50 rounded-[2rem] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{partner.centerName}</h3>
                        <p className="text-sm text-slate-500 line-clamp-1">{partner.licenseeName}</p>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0 whitespace-nowrap",
                      partner.status === 'approved' ? "bg-emerald-50 text-emerald-600" :
                      partner.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                    )}>
                      {partner.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {partner.status === 'pending' && <Clock className="w-3 h-3" />}
                      {partner.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {partner.status}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{partner.licenseeEmail}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{partner.licenseeContactNumber || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{partner.location?.city}, {partner.location?.state}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                      <div className="flex items-center gap-1.5 mb-1 text-slate-600">
                        <Building2 className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Universities</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500">
                        {partner.assignedUnis?.length > 0 ? `${partner.assignedUnis.length} assigned` : "None assigned"}
                      </p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100/50 rounded-2xl p-3">
                      <div className="flex items-center gap-1.5 mb-1 text-emerald-600">
                        <GraduationCap className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Courses</span>
                      </div>
                      <p className="text-sm font-black text-emerald-600">
                        {partner.programCount || 0} <span className="text-[10px] font-bold opacity-80">PROGRAMS</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors",
                      partner.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {partner.isActive ? <UserCheck className="w-3.5 h-3.5" /> : <UserMinus className="w-3.5 h-3.5" />}
                      {partner.isActive ? "ACTIVE" : "INACTIVE"}
                    </div>

                    <button
                      onClick={() => navigate(`/dashboard/partner-management/${partner._id}`)}
                      className="flex items-center gap-1 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-colors"
                    >
                      View Profile
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

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

                {/* Assigned Universities */}
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/5 flex items-center justify-center text-purple-600">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                        Assigned Universities
                      </h4>
                      <p className="text-[9px] font-bold text-muted-foreground">
                        Filter by university network
                      </p>
                    </div>
                  </div>
                  <div className="relative group">
                    <select
                      value={universityFilter}
                      onChange={(e) => setUniversityFilter(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-purple-500/30 focus:bg-white focus:ring-4 focus:ring-purple-500/5 transition-all appearance-none cursor-pointer"
                    >
                      <option value="all">All Universities</option>
                      {universities.map((uni) => (
                        <option key={uni._id} value={uni.name}>
                          {uni.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-purple-500 transition-colors">
                      <Filter className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Registration Period */}
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/5 flex items-center justify-center text-rose-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                        Registration Period
                      </h4>
                      <p className="text-[9px] font-bold text-muted-foreground">
                        Select onboard date range
                      </p>
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
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-rose-500/30 focus:bg-white focus:ring-4 focus:ring-rose-500/5 transition-all"
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
                    setUniversityFilter("all");
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

      {/* Authorisation Letter Modal */}
      {showLetterModal && letterPartner && (
        <AuthorisationLetterModal
          partner={letterPartner}
          onClose={() => {
            setShowLetterModal(false);
            setLetterPartner(null);
          }}
        />
      )}

      {/* Approve Warning Modal */}
      <AnimatePresence>
        {approveWarningId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setApproveWarningId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border flex flex-col"
            >
              <div className="flex items-center space-x-3 text-emerald-500 mb-4">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-xl font-bold text-foreground">
                  Confirm Approval
                </h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to approve this partner? This will
                grant them active status and access into the partners portal.
              </p>
              <div className="flex items-center justify-end space-x-3 mt-auto">
                <button
                  onClick={() => setApproveWarningId(null)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium text-sm flex items-center space-x-2 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Yes, Approve</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Warning Modal */}
      <AnimatePresence>
        {rejectWarningId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setRejectWarningId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border flex flex-col"
            >
              <div className="flex items-center space-x-3 text-red-500 mb-4">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-xl font-bold text-foreground">
                  Confirm Rejection
                </h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to permanently reject this partner? 
                This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3 mt-auto">
                <button
                  onClick={() => setRejectWarningId(null)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium text-sm flex items-center space-x-2 shadow-sm"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Yes, Reject</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewDetailsPoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm"
            onClick={() => setViewDetailsPoint(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl border border-border flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-500" />
                    {viewDetailsPoint.centerName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Submitted on{" "}
                    {new Date(
                      viewDetailsPoint.createdAt || new Date(),
                    ).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setViewDetailsPoint(null)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors border border-transparent hover:border-border"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {/* General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                      <UserIcon className="w-4 h-4 text-purple-500" />
                      Licensee Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                          Full Name
                        </span>
                        <span className="font-bold text-foreground">
                          {viewDetailsPoint.licenseeName}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                          Email Address
                        </span>
                        <span className="font-bold text-foreground break-all">
                          {viewDetailsPoint.licenseeEmail}
                        </span>
                      </div>
                      <div className="flex flex-col sm:col-span-2">
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                          Center Name
                        </span>
                        <span className="font-black text-primary uppercase italic">
                          {viewDetailsPoint.centerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      Location
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div className="flex flex-col sm:col-span-2">
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                          Address
                        </span>
                        <span className="font-bold text-foreground">
                          {viewDetailsPoint.location?.address || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                          City / State
                        </span>
                        <span className="font-bold text-foreground">
                          {viewDetailsPoint.location?.city || "N/A"},{" "}
                          {viewDetailsPoint.location?.state || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                          Country / PIN
                        </span>
                        <span className="font-bold text-foreground">
                          {viewDetailsPoint.location?.country || "N/A"} -{" "}
                          {viewDetailsPoint.location?.pincode || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      Contact Person
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                          Name
                        </span>
                        <span className="font-bold text-foreground">
                          {viewDetailsPoint.contactPerson?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                          Phone
                        </span>
                        <span className="font-bold text-foreground">
                          {viewDetailsPoint.contactPerson?.phone || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      References
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                      {viewDetailsPoint.references?.length > 0 ? viewDetailsPoint.references.map((ref, i) => (
                        <div key={i} className="flex flex-col">
                          <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                            Ref {i + 1}: {ref.name || "N/A"}
                          </span>
                          <span className="font-bold text-foreground flex items-center gap-2">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {ref.mobileNumber1 || "N/A"}
                          </span>
                        </div>
                      )) : (
                        <div className="text-muted-foreground text-xs italic">No references provided</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Docs Link Grid */}
                {viewDetailsPoint.documents &&
                  Object.keys(viewDetailsPoint.documents).length > 0 && (
                    <div className="pt-8 border-t border-border/50">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-purple-500" />
                          </div>
                          Verification Documents
                        </h4>
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                          {
                            Object.entries(viewDetailsPoint.documents)
                              .filter(([key]) => key !== 'officeVideo' && key !== 'officePhotos')
                              .map(([, value]) => value)
                              .flat()
                              .filter(Boolean).length
                          }{" "}
                          Files Attached
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(viewDetailsPoint.documents).map(
                          ([key, value]) => {
                            if (
                              !value ||
                              (Array.isArray(value) && value.length === 0) ||
                              key === 'officeVideo' ||
                              key === 'officePhotos'
                            )
                              return null;

                            const docLabel = key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase());

                            const formatUrl = (path) =>
                              `${path.replace(/\\/g, "/")}`;

                            const items = Array.isArray(value)
                              ? value
                              : [value];

                            return items.map((docUrl, i) => {
                              return (
                                <a
                                  key={`${key}-${i}`}
                                  href={formatUrl(docUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group relative flex items-center gap-4 p-4 rounded-2xl border border-border bg-muted/5 hover:bg-white dark:hover:bg-slate-900 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                                >
                                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border border-border group-hover:border-primary/10 transition-colors shadow-sm">
                                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors truncate">
                                      {docLabel}
                                    </p>
                                    <p className="text-xs font-bold text-foreground truncate">
                                      {items.length > 1
                                        ? `Attachment ${i + 1}`
                                        : "View Document"}
                                    </p>
                                  </div>
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                  </div>
                                </a>
                              );
                            });
                          },
                        )}
                      </div>
                    </div>
                  )}

                {/* Center Video Section */}
                {viewDetailsPoint.documents &&
                  viewDetailsPoint.documents.officeVideo && viewDetailsPoint.documents.officeVideo.length > 0 && (
                    <div className="pt-8 border-t border-border/50">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Video className="w-4 h-4 text-blue-500" />
                          </div>
                          Center Video
                        </h4>
                      </div>
                      
                      <div className="space-y-6">
                        {viewDetailsPoint.documents.officeVideo.map((docUrl, i) => (
                           <div
                              key={`video-${i}`}
                              className="group relative flex flex-col gap-3 p-4 rounded-2xl border border-border bg-muted/5"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                  <Video className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Center Video</p>
                                  <p className="text-xs font-bold text-foreground">Video Walkthrough</p>
                                </div>
                              </div>
                              <video 
                                src={`${docUrl.replace(/\\/g, "/")}`} 
                                controls 
                                className="w-full rounded-xl bg-black max-h-[400px] object-contain border border-border"
                              />
                            </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Center Photos Section */}
                {viewDetailsPoint.documents &&
                  viewDetailsPoint.documents.officePhotos && viewDetailsPoint.documents.officePhotos.length > 0 && (
                    <div className="pt-8 border-t border-border/50">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                            <Image className="w-4 h-4 text-pink-500" />
                          </div>
                          Center Photos
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {viewDetailsPoint.documents.officePhotos.map((docUrl, i) => (
                          <a
                            key={`photo-${i}`}
                            href={`${docUrl.replace(/\\/g, "/")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative aspect-video rounded-2xl overflow-hidden bg-muted border border-border block"
                          >
                            <img 
                              src={`${docUrl.replace(/\\/g, "/")}`} 
                              alt={`Center Photo ${i + 1}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-full items-center justify-center text-[8px] font-black uppercase text-muted-foreground tracking-widest text-center p-2 bg-muted">
                               Preview not available
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <ExternalLink className="w-5 h-5 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Action Footer for Pending Partners */}
              {viewDetailsPoint.status === 'pending' && (
                <div className="p-6 border-t border-border bg-muted/30 flex gap-4 shrink-0">
                  <button
                    onClick={() => {
                      setRejectWarningId(viewDetailsPoint._id);
                      setViewDetailsPoint(null);
                    }}
                    className="flex-1 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" /> Reject
                  </button>
                  <button
                    onClick={() => {
                      setApproveWarningId(viewDetailsPoint._id);
                      setViewDetailsPoint(null);
                    }}
                    className="flex-[2] py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
                  >
                    <CheckCircle className="w-5 h-5" /> Approve Partner
                  </button>
                </div>
              )}

              {/* Action Footer for Onboarding Partners (Inspection) */}
              {activeTab === 'onboarding' && viewDetailsPoint.documents?.officeVideo?.length > 0 && viewDetailsPoint.inspectionStatus !== "rejected" && (
                <div className="p-6 border-t border-border bg-muted/30 flex gap-4 shrink-0">
                  <button
                    onClick={() => {
                      setRejectInspectionPartnerId(viewDetailsPoint._id);
                      setViewDetailsPoint(null);
                    }}
                    className="flex-1 py-3.5 rounded-2xl bg-orange-500/10 hover:bg-orange-500 text-orange-600 hover:text-white border border-orange-500/20 hover:border-orange-500 font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" /> Reject Inspection
                  </button>
                  <button
                    onClick={() => {
                      handleCompleteInspection(viewDetailsPoint._id);
                    }}
                    disabled={isCompletingInspection}
                    className="flex-[2] py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isCompletingInspection && inspectionPartnerId === viewDetailsPoint._id ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Complete Inspection
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Inspection Modal */}
      <AnimatePresence>
        {rejectInspectionPartnerId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-border"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-black mb-2">Reject Inspection</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Please provide a reason for rejecting the inspection. The partner will be notified and asked to re-upload their media.
                </p>
                
                <textarea
                  value={rejectInspectionReason}
                  onChange={(e) => setRejectInspectionReason(e.target.value)}
                  placeholder="E.g., Video is blurry, please provide a clear walkthrough of the center..."
                  className="w-full min-h-[100px] p-3 rounded-xl border border-border bg-muted/30 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm resize-none mb-6"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setRejectInspectionPartnerId(null);
                      setRejectInspectionReason("");
                    }}
                    className="flex-1 py-3 px-4 rounded-xl border border-border hover:bg-muted font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectInspectionSubmit}
                    disabled={isRejectingInspection || !rejectInspectionReason.trim()}
                    className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isRejectingInspection ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Submit Rejection"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Loading Overlay */}
      {isCompletingInspection && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-4" />
          <h3 className="text-2xl font-black text-foreground">Completing Inspection...</h3>
          <p className="text-muted-foreground mt-2 font-medium">Please wait while we verify the details and generate the authorization letter.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
