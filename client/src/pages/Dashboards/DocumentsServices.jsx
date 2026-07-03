import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { load } from "@cashfreepayments/cashfree-js";
import {
  Layers,
  Search,
  Filter,
  Plus,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  Package,
  Stamp,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  X,
  Upload,
  ArrowUpDown,
  MoreHorizontal,
  Mail,
  Users,
  CreditCard,
  PlusCircle,
  Settings,
  History,
  Trash2,
  Activity,
  Truck,
  Globe,
  Briefcase,
  Plane,
  Building2,
} from "lucide-react";

const ICON_MAP = {
  Layers,
  ClipboardCheck,
  GraduationCap,
  Package,
  Stamp,
  ShieldCheck,
  FileText,
  CreditCard,
  Users,
  Activity,
  Truck,
  Globe,
  Briefcase,
  History,
  Settings,
  Plane,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);

const CATEGORY_OPTIONS = [
  "Academic Documents",
  "Overseas Education Documents",
  "Job Overseas Documents",
  "Working In India Documents",
  "Studying In India Documents",
  "Embassy Attestion Services",
  "Study Abroad services"
];
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { StatCard } from "../../components/dashboard/StatCard";
import { cn } from "../../components/dashboard/StatCard";
import { useNavigate } from "react-router-dom";
import * as serviceApi from "../../api/documentsServices.api";
import { getManagementStudents } from "../../api/payment.api";

export default function DocumentsServices() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState("applications"); // applications, management
  const [stats, setStats] = useState({
    totalApps: 0,
    pendingApps: 0,
    inProgressApps: 0,
    totalRevenue: 0
  });
  const [applications, setApplications] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPartner, setSelectedPartner] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [partners, setPartners] = useState([]);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null); // service object
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(null); // application object
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [selectedApps, setSelectedApps] = useState([]);
  const [selectedManageCategory, setSelectedManageCategory] = useState("all");

  const [cashfree, setCashfree] = useState(null);

  useEffect(() => {
    const initializeCashfree = async () => {
      const cf = await load({
        mode: import.meta.env.MODE === "production" ? "production" : "sandbox",
      });
      setCashfree(cf);
    };
    initializeCashfree();
  }, []);

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const status = searchParams.get("payment_status");
    const type = searchParams.get("type");

    if (orderId && status) {
      const verifyPayment = async () => {
        try {
          let res;
          if (type === "bulk") {
            res = await serviceApi.verifyBulkServiceCashfreePayment(orderId);
          } else {
            res = await serviceApi.verifyServiceCashfreePayment(orderId);
          }

          if (res.success) {
            dispatch(
              showAlert({
                type: "success",
                message: "Service payment verified successfully!",
              }),
            );
            fetchData();
          } else {
            dispatch(
              showAlert({
                type: "error",
                message: "Service payment verification failed",
              }),
            );
          }
        } catch (error) {
          dispatch(
            showAlert({ type: "error", message: "Failed to verify payment" }),
          );
        }
      };
      verifyPayment();
      navigate(window.location.pathname, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const status = searchParams.get("status");
    const payment = searchParams.get("paymentStatus");
    const service = searchParams.get("serviceType");
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    if (status) setStatusFilter(status);
    if (payment) setPaymentStatusFilter(payment);
    if (service) setServiceTypeFilter(service);
    if (start) setStartDate(start);
    if (end) setEndDate(end);


  }, [searchParams, services]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, servicesRes] = await Promise.all([
        serviceApi.getServiceDashboardStats(),
        serviceApi.getServiceApplications(),
        serviceApi.getServiceDefinitions()
      ]);

      if (statsRes.success) setStats(statsRes.data.stats);
      if (appsRes.success) setApplications(appsRes.data);
      if (servicesRes.success) setServices(servicesRes.data);

      // Fetch partners for filter if admin/manager
      const isPartner = user?.type === "partner" || user?.role === "partner";
      if (!isPartner) {
        const { getAllApprovedAdmissionPoints } = await import("../../api/admissionPoint.api");
        const partnerRes = await getAllApprovedAdmissionPoints();
        if (partnerRes.success) setPartners(partnerRes.data);
      }

    } catch (error) {
      dispatch(showAlert({ type: "error", message: "Failed to load system data" }));
    } finally {
      setLoading(false);
    }
  };


  const groupedApplications = useMemo(() => {
    const filtered = applications.filter(app => {
      const matchesSearch = 
        app.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        app.service?.title?.toLowerCase().includes(search.toLowerCase()) ||
        app.subCategory?.toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;

      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (serviceTypeFilter !== "all" && app.service?.title !== serviceTypeFilter) return false;
      if (selectedPartner !== "all" && app.student?.registeredBy?._id !== selectedPartner) return false;
      if (paymentStatusFilter !== "all" && app.paymentStatus !== paymentStatusFilter) return false;

      if (startDate || endDate) {
        const appDate = new Date(app.createdAt);
        if (startDate && appDate < new Date(startDate)) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (appDate > end) return false;
        }
      }
      return true;
    });

    const groups = [];
    const studentMandatoryMap = new Map();

    filtered.forEach(app => {
      const serviceDef = services.find(s => s._id === (app.service?._id || app.service));
      if (serviceDef?.documentType === "Mandatory") {
        const studentId = app.student?._id;
        if (!studentId) {
          groups.push(app);
          return;
        }
        if (studentMandatoryMap.has(studentId)) {
          const group = studentMandatoryMap.get(studentId);
          group.bundledApplications.push(app);
          group.feeAmount += (app.feeAmount || 0);
          group.service.title = group.bundledApplications.map(a => a.service?.title).join(" + ");
        } else {
          const groupItem = { 
            ...app, 
            isBundle: true, 
            bundledApplications: [app],
            service: { ...app.service }
          };
          studentMandatoryMap.set(studentId, groupItem);
          groups.push(groupItem);
        }
      } else {
        groups.push(app);
      }
    });

    return groups;
  }, [applications, search, statusFilter, serviceTypeFilter, selectedPartner, paymentStatusFilter, startDate, endDate]);

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

  const handleUpdateStatusClick = (app) => {
    const serviceDef = services.find(s => s._id === (app.service?._id || app.service));
    if (app.isBundle || serviceDef?.documentType === "Mandatory") {
      const bundledApps = app.isBundle ? app.bundledApplications : [app];
      // If for some reason they aren't bundled but are mandatory, we fetch them
      const studentMandatoryApps = app.isBundle ? bundledApps : applications.filter(a => {
        const sDef = services.find(s => s._id === (a.service?._id || a.service));
        return a.student?._id === app.student?._id && sDef?.documentType === "Mandatory";
      });
      setSelectedApps(studentMandatoryApps.map(a => a._id));
      setShowBulkStatusModal(true);
    } else {
      setShowStatusModal(app);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Waiting for Payment": return "rose";
      case "Pending Applications": return "blue";
      case "Application On Progress": return "amber";
      case "Documents Received": return "emerald";
      case "Documents Sent Courier": return "purple";
      default: return "slate";
    }
  };

  return (
    <DashboardLayout title="Documents & Services">
      <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-card border border-border p-8 rounded-[2.5rem] shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2 whitespace-nowrap">
              <Layers size={14} />
              <span>Service Fulfillment Pipeline</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight">
              Documents & <span className="text-primary">Services</span>
            </h2>
            <p className="text-muted-foreground text-lg font-medium max-w-2xl">
              Centralized management system for student document requests, certifications, and attestations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.type !== "partner" && user?.role !== "partner" && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-4 rounded-2xl bg-card border border-border text-foreground font-black text-xs uppercase tracking-widest hover:bg-muted transition-all flex items-center gap-2"
              >
                <Settings size={18} />
                Create Service
              </button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Active Applications" 
            value={stats.totalApps} 
            icon={FileText} 
            color="blue" 
            subtext="Total requests received"
          />
          <StatCard 
            title="Pending Approval" 
            value={stats.pendingApps} 
            icon={Clock} 
            color="amber" 
            subtext="Awaiting initial review"
          />
          <StatCard 
            title="Processing" 
            value={stats.inProgressApps} 
            icon={Activity} 
            color="emerald" 
            subtext="Currently in pipeline"
          />
          <StatCard 
            title="Service Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString()}`} 
            icon={CreditCard} 
            color="purple" 
            subtext="Total fees collected"
          />
        </div>

        {/* Main Content Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
          <button 
            onClick={() => setActiveTab("applications")}
            className={cn(
              "flex items-center gap-2.5 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group border shrink-0",
              activeTab === "applications" 
                ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20" 
                : "bg-card border-border/60 text-muted-foreground/80 hover:border-primary/50 hover:text-primary"
            )}
          >
            <Activity className={cn("w-4 h-4", activeTab === "applications" ? "text-white" : "text-primary/70")} />
            Applications
          </button>
          {user?.type !== "partner" && user?.role !== "partner" && (
            <button 
              onClick={() => setActiveTab("management")}
              className={cn(
                "flex items-center gap-2.5 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group border shrink-0",
                activeTab === "management" 
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20" 
                  : "bg-card border-border/60 text-muted-foreground/80 hover:border-primary/50 hover:text-primary"
              )}
            >
              <Settings className={cn("w-4 h-4", activeTab === "management" ? "text-white" : "text-primary/70")} />
              Manage Services
            </button>
          )}
        </div>

        {activeTab === "applications" ? (
          <div className="space-y-6">
            {/* Filters Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card border border-border p-4 rounded-[2rem] shadow-sm">
              <div className="flex flex-1 items-center gap-3 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by student, service or sub-category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-muted/30 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "relative group px-6 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all border flex items-center gap-2",
                    showFilters || startDate || endDate || selectedPartner !== "all" || serviceTypeFilter !== "all" || paymentStatusFilter !== "all" || statusFilter !== "all"
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-primary",
                  )}
                >
                  <Filter className={cn("w-3.5 h-3.5", showFilters && "rotate-180")} />
                  {showFilters ? "Close" : "Filters"}
                </button>
                
                <button className="flex items-center gap-3 px-8 py-4 rounded-[1.5rem] bg-card/40 backdrop-blur-xl border border-border/50 text-xs font-black uppercase tracking-[0.2em] hover:bg-muted/50 hover:border-primary/30 transition-all group">
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  Export
                </button>
              </div>
            </div>


            {/* Filter Drawer */}
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
                    className="fixed right-0 top-0 h-screen w-full max-w-md bg-card border-l border-border z-[10000] shadow-[-20px_0_80px_rgba(0,0,0,0.15)] flex flex-col"
                  >
                    {/* Header */}
                    <div className="p-10 border-b border-border/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Filters</h3>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Service Fulfillment Protocol</p>
                    </div>

                    {/* Filter Content */}
                    <div className="flex-1 overflow-y-auto p-10 space-y-10">
                      

                      {/* Partner */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-600">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Admission Point</h4>
                            <p className="text-[9px] font-bold text-muted-foreground">Select partner center</p>
                          </div>
                        </div>
                        <select
                          value={selectedPartner}
                          onChange={(e) => setSelectedPartner(e.target.value)}
                          className="w-full px-6 py-4 bg-muted/30 border border-border rounded-2xl text-xs font-black outline-none focus:border-blue-500/30 focus:bg-card transition-all appearance-none"
                        >
                          <option value="all">Global (All Partners)</option>
                          {partners.map(p => (
                            <option key={p._id} value={p._id}>{p.centerName}</option>
                          ))}
                        </select>
                      </div>

                      {/* Service Type */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-600">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Service Title</h4>
                            <p className="text-[9px] font-bold text-muted-foreground">Filter by specific service</p>
                          </div>
                        </div>
                        <select
                          value={serviceTypeFilter}
                          onChange={(e) => setServiceTypeFilter(e.target.value)}
                          className="w-full px-6 py-4 bg-muted/30 border border-border rounded-2xl text-xs font-black outline-none focus:border-emerald-500/30 focus:bg-card transition-all appearance-none"
                        >
                          <option value="all">All Service Categories</option>
                          {services.map(s => (
                            <option key={s._id} value={s.title}>{s.title}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/5 flex items-center justify-center text-purple-600">
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Pipeline Status</h4>
                            <p className="text-[9px] font-bold text-muted-foreground">Current application phase</p>
                          </div>
                        </div>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-6 py-4 bg-muted/30 border border-border rounded-2xl text-xs font-black outline-none focus:border-purple-500/30 focus:bg-card transition-all appearance-none"
                        >
                          <option value="all">All Application States</option>
                          <option value="Waiting for Payment">Waiting for Payment</option>
                          <option value="Pending Applications">Pending Applications</option>
                          <option value="Application On Progress">Application On Progress</option>
                          <option value="Documents Received">Documents Received</option>
                          <option value="Documents Sent Courier">Documents Sent Courier</option>
                        </select>
                      </div>

                      {/* Payment Status */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/5 flex items-center justify-center text-amber-600">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Payment Tracking</h4>
                            <p className="text-[9px] font-bold text-muted-foreground">Financial settlement status</p>
                          </div>
                        </div>
                        <select
                          value={paymentStatusFilter}
                          onChange={(e) => setPaymentStatusFilter(e.target.value)}
                          className="w-full px-6 py-4 bg-muted/30 border border-border rounded-2xl text-xs font-black outline-none focus:border-amber-500/30 focus:bg-card transition-all appearance-none"
                        >
                          <option value="all">All Financial States</option>
                          <option value="Unpaid">Unpaid</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </div>

                      {/* Date Range */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-600">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Date Range</h4>
                            <p className="text-[9px] font-bold text-muted-foreground">Filter by application date</p>
                          </div>
                        </div>

                        {/* Quick Select Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          {["today", "week", "month", "year"].map((range) => (
                            <button
                              key={range}
                              onClick={() => setQuickRange(range)}
                              className="py-2.5 rounded-xl border border-border bg-muted/30 text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
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

                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl text-xs font-black outline-none focus:border-emerald-500/30 focus:bg-card transition-all"
                          />
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl text-xs font-black outline-none focus:border-emerald-500/30 focus:bg-card transition-all"
                          />
                        </div>
                      </div>

                    </div>

                    {/* Footer */}
                    <div className="p-10 border-t border-border/10">
                      <button
                        onClick={() => {
                          setStartDate("");
                          setEndDate("");
                          setSelectedPartner("all");
                          setServiceTypeFilter("all");
                          setStatusFilter("all");
                          setPaymentStatusFilter("all");
                          setShowFilters(false);
                        }}
                        className="w-full py-5 rounded-2xl bg-rose-50 text-rose-600 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                      >
                        Reset All Parameters
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Active Filter Chips */}
            <AnimatePresence>
              {(startDate || endDate || selectedPartner !== "all" || serviceTypeFilter !== "all" || paymentStatusFilter !== "all" || statusFilter !== "all") && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Active Filters:</span>
                  
                  {startDate && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-bold text-primary">
                      From: {startDate}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setStartDate("")} />
                    </div>
                  )}
                  {endDate && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-bold text-primary">
                      To: {endDate}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setEndDate("")} />
                    </div>
                  )}
                  {selectedPartner !== "all" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-bold text-blue-600">
                      Partner: {partners.find(p => p._id === selectedPartner)?.centerName}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedPartner("all")} />
                    </div>
                  )}
                  {serviceTypeFilter !== "all" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-bold text-amber-600">
                      Service: {serviceTypeFilter}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setServiceTypeFilter("all")} />
                    </div>
                  )}
                  {statusFilter !== "all" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[10px] font-bold text-purple-600">
                      Status: {statusFilter.replace(" Applications", "")}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
                    </div>
                  )}
                   {paymentStatusFilter !== "all" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-600">
                      Payment: {paymentStatusFilter}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setPaymentStatusFilter("all")} />
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setSelectedPartner("all");
                      setServiceTypeFilter("all");
                      setStatusFilter("all");
                      setPaymentStatusFilter("all");
                    }}
                    className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:underline ml-2"
                  >
                    Clear All
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Student Info</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Partner / Source</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Requested Service</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Fee Tracking</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center">
                          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Synchronizing Data...</p>
                        </td>
                      </tr>
                    ) : groupedApplications.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-8 py-20 text-center space-y-3">
                          <Layers className="w-12 h-12 mx-auto opacity-10" />
                          <p className="text-muted-foreground font-medium">No applications found matching your criteria.</p>
                        </td>
                      </tr>
                    ) : (
                      groupedApplications.map((app, idx) => (
                        <motion.tr 
                          key={app._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black group-hover:scale-110 transition-transform">
                                {app.student?.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-black group-hover:text-primary transition-colors">{app.student?.name}</p>
                                <p className="text-[10px] font-medium text-muted-foreground">{app.student?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                <Users size={14} />
                              </div>
                              <span className="text-xs font-bold text-foreground">
                                {app.student?.registeredBy?.centerName || "Direct / Admin"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                <span className="truncate">{app.service?.title}</span>
                              </div>
                              <div className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md w-fit">
                                {app.subCategory}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className={cn(
                              "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                              app.status === "Waiting for Payment" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                               app.status === "Pending Applications" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                              app.status === "Application On Progress" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                              app.status === "Documents Received" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                              "bg-purple-500/10 text-purple-600 border-purple-500/20"
                            )}>
                              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                                app.status === "Waiting for Payment" ? "bg-rose-500" :
                                 app.status === "Pending Applications" ? "bg-blue-500" :
                                app.status === "Application On Progress" ? "bg-amber-500" :
                                app.status === "Documents Received" ? "bg-emerald-500" :
                                "bg-purple-500"
                              )} />
                              {app.status.replace(" Applications", "")}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <p className="text-xs font-black text-foreground">₹{app.feeAmount?.toLocaleString()}</p>
                              <div className={cn(
                                "text-[9px] font-bold uppercase tracking-tighter",
                                app.paymentStatus === "Paid" ? "text-emerald-500" : "text-amber-500"
                              )}>
                                {app.paymentStatus}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => handleUpdateStatusClick(app)}
                              className="p-3 rounded-xl bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                              <ArrowUpDown size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {loading ? (
                <div className="p-8 text-center bg-card border border-border rounded-3xl">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing...</p>
                </div>
              ) : groupedApplications.length === 0 ? (
                <div className="p-12 text-center bg-card border border-border rounded-3xl space-y-2">
                  <Layers className="w-8 h-8 mx-auto opacity-10" />
                  <p className="text-xs font-medium text-muted-foreground">No matches found.</p>
                </div>
              ) : (
                groupedApplications.map((app, idx) => (
                  <motion.div 
                    key={app._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shrink-0">
                          {app.student?.name?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-black truncate">{app.student?.name}</p>
                          <p className="text-[10px] font-medium text-muted-foreground truncate">{app.service?.title}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleUpdateStatusClick(app)}
                        className="p-3 rounded-xl bg-muted/50 text-muted-foreground shrink-0"
                      >
                        <ArrowUpDown size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50 gap-2">
                      <div className={cn(
                        "px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap",
                        app.status === "Waiting for Payment" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                        app.status === "Pending Applications" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                        app.status === "Application On Progress" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        app.status === "Documents Received" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        "bg-purple-500/10 text-purple-600 border-purple-500/20"
                      )}>
                        <div className={cn("w-1 h-1 rounded-full", 
                          app.status === "Waiting for Payment" ? "bg-rose-500" : 
                          app.status === "Pending Applications" ? "bg-blue-500" :
                          app.status === "Application On Progress" ? "bg-amber-500" :
                          app.status === "Documents Received" ? "bg-emerald-500" :
                          "bg-purple-500"
                        )} />
                        {app.status.replace(" Applications", "")}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-black">₹{app.feeAmount?.toLocaleString()}</p>
                        <p className={cn(
                          "text-[9px] font-bold uppercase",
                          app.paymentStatus === "Paid" ? "text-emerald-500" : "text-amber-500"
                        )}>{app.paymentStatus}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ) : (
          (() => {
            const servicesByCategory = CATEGORY_OPTIONS.reduce((acc, cat) => {
              const filtered = services.filter(s => s.categories?.includes(cat) || s.category === cat);
              if (filtered.length > 0) {
                acc[cat] = filtered;
              }
              return acc;
            }, {});

            const uncategorizedServices = services.filter(s => 
              (!s.categories || s.categories.length === 0) && !s.category
            );
            if (uncategorizedServices.length > 0) {
              servicesByCategory["Uncategorized Services"] = uncategorizedServices;
            }

            return (
              <div className="space-y-8 w-full">
                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide border-b border-border/50">
                  <button
                    onClick={() => setSelectedManageCategory("all")}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                      selectedManageCategory === "all"
                        ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10"
                        : "bg-card border-border/60 text-muted-foreground/80 hover:border-primary/50 hover:text-primary"
                    )}
                  >
                    <Layers size={12} />
                    All ({services.length})
                  </button>
                  {Object.entries(servicesByCategory).map(([cat, list]) => {
                    const CategoryIcon = {
                      "Academic Documents": GraduationCap,
                      "Overseas Education Documents": Globe,
                      "Job Overseas Documents": Briefcase,
                      "Working In India Documents": Building2,
                      "Studying In India Documents": ClipboardCheck,
                      "Embassy Attestion Services": Stamp,
                      "Study Abroad services": Plane,
                      "Uncategorized Services": Layers
                    }[cat] || Layers;

                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedManageCategory(cat)}
                        className={cn(
                          "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                          selectedManageCategory === cat
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10"
                            : "bg-card border-border/60 text-muted-foreground/80 hover:border-primary/50 hover:text-primary"
                        )}
                      >
                        <CategoryIcon size={12} />
                        {cat.replace(" Documents", "").replace(" Services", "")} ({list.length})
                      </button>
                    );
                  })}
                </div>

                {/* Render Category Sections */}
                <div className="space-y-12">
                  {Object.entries(servicesByCategory)
                    .filter(([cat]) => selectedManageCategory === "all" || selectedManageCategory === cat)
                    .map(([cat, list]) => {
                      const CategoryIcon = {
                        "Academic Documents": GraduationCap,
                        "Overseas Education Documents": Globe,
                        "Job Overseas Documents": Briefcase,
                        "Working In India Documents": Building2,
                        "Studying In India Documents": ClipboardCheck,
                        "Embassy Attestion Services": Stamp,
                        "Study Abroad services": Plane,
                        "Uncategorized Services": Layers
                      }[cat] || Layers;

                      return (
                        <div key={cat} className="space-y-6">
                          <div className="flex items-center justify-between border-b border-border/40 pb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <CategoryIcon size={20} />
                              </div>
                              <div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-foreground">{cat}</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{list.length} {list.length === 1 ? "Service" : "Services"} Available</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {list.map((service, idx) => (
                              <motion.div 
                                key={service._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group flex flex-col"
                              >
                                <div className="flex items-center justify-between mb-6">
                                  <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                                    {(() => {
                                      const Icon = ICON_MAP[service.icon] || Layers;
                                      return <Icon size={24} />;
                                    })()}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Base Fee</p>
                                    <p className="text-lg font-black text-primary">₹{service.currentFee?.toLocaleString()}</p>
                                  </div>
                                </div>
                                
                                <h3 className="text-xl font-black mb-2">{service.title}</h3>
                                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{service.description}</p>
                                
                                <button 
                                  onClick={() => setShowEditModal(service)}
                                  className="w-full py-4 rounded-2xl border border-border/50 bg-muted/20 text-xs font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all mt-auto"
                                >
                                  Edit Definition
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                  {/* Define New Service Button always available */}
                  <div className="pt-6 border-t border-border/40 flex justify-center">
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="px-8 py-5 border-2 border-dashed border-border rounded-3xl flex items-center gap-4 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={20} />
                      </div>
                      <p className="font-black uppercase tracking-widest text-xs">Define New Service</p>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()
        )}

      </div>

      {/* ─────────────────────────────────────────────
          MODALS 
      ───────────────────────────────────────────── */}

      {/* Create Service Modal */}
      <Modal 
        show={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Define New Service"
      >
        <CreateServiceForm 
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }} 
        />
      </Modal>

      {/* Apply Service Modal */}
      <Modal 
        show={showApplyModal} 
        onClose={() => setShowApplyModal(false)}
        title="Apply Service to Student"
      >
        <ApplyServiceForm 
          services={services} 
          onSuccess={() => {
            setShowApplyModal(false);
            fetchData();
          }} 
        />
      </Modal>

      {/* Edit Service Modal */}
      <Modal 
        show={!!showEditModal} 
        onClose={() => setShowEditModal(null)}
        title="Edit Service Definition"
      >
        <EditServiceForm 
          service={showEditModal}
          onSuccess={() => {
            setShowEditModal(null);
            fetchData();
          }} 
        />
      </Modal>

      {/* Status Update Modal */}
      <Modal 
        show={!!showStatusModal} 
        onClose={() => setShowStatusModal(null)}
        title="Update Application Status"
      >
        <UpdateStatusForm 
          application={showStatusModal}
          onSuccess={() => {
            setShowStatusModal(null);
            fetchData();
          }} 
          cashfree={cashfree}
        />
      </Modal>

      {/* Bulk Status Update Modal */}
      <Modal 
        show={showBulkStatusModal} 
        onClose={() => setShowBulkStatusModal(false)}
        title="Update Status"
      >
        <BulkServiceUpdateStatusForm 
          selectedIds={selectedApps}
          applications={applications}
          onSuccess={() => {
            setShowBulkStatusModal(false);
            setSelectedApps([]);
            fetchData();
          }} 
        />
      </Modal>

    </DashboardLayout>
  );
}

// ─────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-card border border-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="p-8 border-b border-border flex items-center justify-between">
            <h3 className="text-2xl font-black tracking-tight">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-all"><X /></button>
          </div>
          <div className="p-8 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const CreateServiceForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    currentFee: "",
    icon: "Layers",
    documentType: "Optional",
    categories: []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        icon: formData.icon,
        documentType: formData.documentType,
        categories: formData.categories,
        currentFee: Number(formData.currentFee || 0)
      };

      const res = await serviceApi.createServiceDefinition(payload);
      if (res.success) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Service Title</label>
          <input 
            required
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="e.g., Optional Certificates"
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-bold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Categories (Select Multiple)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/20 border border-border rounded-[2rem] max-h-[190px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 pr-2">
            {CATEGORY_OPTIONS.map((cat, idx) => {
              const isSelected = formData.categories.includes(cat);
              const Icon = {
                "Academic Documents": GraduationCap,
                "Overseas Education Documents": Globe,
                "Job Overseas Documents": Briefcase,
                "Working In India Documents": Building2,
                "Studying In India Documents": ClipboardCheck,
                "Embassy Attestion Services": Stamp,
                "Study Abroad services": Plane
              }[cat] || Layers;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const newCats = isSelected
                      ? formData.categories.filter(c => c !== cat)
                      : [...formData.categories, cat];
                    setFormData({ ...formData, categories: newCats });
                  }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group hover:scale-[1.02] active:scale-95",
                    isSelected
                      ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5"
                      : "bg-card border-border text-muted-foreground hover:bg-muted hover:border-primary/20"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={cn("text-xs font-black uppercase tracking-wider truncate", isSelected ? "text-primary" : "text-foreground")}>
                      {cat.replace(" Documents", "").replace(" Document", "")}
                    </p>
                    <p className="text-[9px] font-bold text-muted-foreground truncate uppercase tracking-wide mt-0.5">
                      {cat.includes("India") ? "Domestic Fulfillment" : "Overseas Fulfillment"}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Is this service / document mandatory?</label>
          <div className="flex gap-4 p-1 bg-muted/20 border border-border rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({...formData, documentType: "Optional"})}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                formData.documentType === "Optional" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"
              )}
            >
              Optional
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, documentType: "Mandatory"})}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                formData.documentType === "Mandatory" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"
              )}
            >
              Mandatory
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Base Fee (₹)</label>
          <input 
            required
            type="number"
            value={formData.currentFee}
            onChange={e => setFormData({...formData, currentFee: e.target.value})}
            placeholder="2000"
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-bold"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
          <textarea 
            rows={3}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Describe the service purpose..."
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Service Icon</label>
          <div className="grid grid-cols-5 gap-2 p-4 bg-muted/30 border border-border rounded-2xl max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20">
            {ICON_OPTIONS.map(iconName => {
              const Icon = ICON_MAP[iconName];
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setFormData({...formData, icon: iconName})}
                  className={cn(
                    "p-3 rounded-xl flex items-center justify-center transition-all",
                    formData.icon === iconName 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" 
                      : "bg-background/50 text-muted-foreground hover:bg-muted"
                  )}
                  title={iconName}
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button 
        disabled={loading}
        className="w-full py-5 rounded-3xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
      >
        {loading ? "Creating Definition..." : "Finalize Service Definition"}
      </button>
    </form>
  );
};

const ApplyServiceForm = ({ services, onSuccess }) => {
  const { user } = useSelector((state) => state.user);
  const isPartner = user?.type === "partner" || user?.role === "partner";

  const [formData, setFormData] = useState({
    studentId: "",
    serviceId: "",
    adminRemarks: ""
  });
  const [loading, setLoading] = useState(false);

  // States for searchable select
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedStudents, setSearchedStudents] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");

  const dropdownRef = useRef(null);

  const selectedService = services.find(s => s._id === formData.serviceId);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce and search student database
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchedStudents([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await getManagementStudents(searchQuery);
        if (res.success) {
          // Extra guard to filter for partner center just in case
          const filtered = isPartner
            ? res.data.filter(s => {
                const regId = s.registeredBy?._id || s.registeredBy;
                const currentUserId = user?.id || user?._id;
                return regId && currentUserId && regId.toString() === currentUserId.toString();
              })
            : res.data;
          setSearchedStudents(filtered);
        }
      } catch (error) {
        console.error("Error searching students:", error);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, isPartner, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await serviceApi.applyForService(formData);
      if (res.success) onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Custom Searchable Student Select */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            Search Student
          </label>
          
          {/* Trigger Button */}
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus-within:border-primary hover:border-primary/50 outline-none transition-all font-bold cursor-pointer flex items-center justify-between"
          >
            <span className={formData.studentId ? "text-foreground" : "text-muted-foreground font-medium"}>
              {selectedStudentName || "Select a student..."}
            </span>
            <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
          </div>

          {/* Dropdown Popover */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 mt-2 p-4 bg-card border border-border rounded-[1.5rem] shadow-2xl z-[10005] space-y-3"
              >
                {/* Search Input inside Popover */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Type at least 3 letters to search student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-muted/30 focus:border-primary outline-none transition-all text-xs font-bold"
                  />
                </div>

                {/* Dropdown Options */}
                <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {searchLoading ? (
                    <div className="py-8 text-center">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Searching Database...</p>
                    </div>
                  ) : searchQuery.trim().length < 3 ? (
                    <div className="py-6 text-center text-muted-foreground text-xs font-medium">
                      Please type 3 or more letters to search.
                    </div>
                  ) : searchedStudents.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground text-xs font-medium">
                      No students found.
                    </div>
                  ) : (
                    searchedStudents.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => {
                          setFormData({ ...formData, studentId: student._id });
                          setSelectedStudentName(`${student.name} (${student.university?.name || "No University"})`);
                          setIsOpen(false);
                          setSearchQuery("");
                          setSearchedStudents([]);
                        }}
                        className="flex flex-col px-4 py-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                      >
                        <span className="text-xs font-black">{student.name}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {student.email} • {student.university?.name || "No University"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Service Template</label>
          <select 
            required
            value={formData.serviceId}
            onChange={e => setFormData({...formData, serviceId: e.target.value})}
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-bold appearance-none"
          >
            <option value="">Select service...</option>
            {services.map(s => (
              <option key={s._id} value={s._id}>{s.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Internal Remarks</label>
          <textarea 
            value={formData.adminRemarks}
            onChange={e => setFormData({...formData, adminRemarks: e.target.value})}
            placeholder="Add any specific instructions..."
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-medium"
          />
        </div>
      </div>

      {selectedService && (
        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Fee Locked</p>
            <p className="text-xl font-black text-primary">
              ₹{(selectedService.currentFee || 0).toLocaleString()}
            </p>
          </div>
          <ShieldCheck className="text-primary opacity-20" size={40} />
        </div>
      )}

      <button 
        disabled={loading || !formData.studentId || !formData.serviceId}
        className="w-full py-5 rounded-3xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
      >
        {loading ? "Processing..." : "Initiate Service Application"}
      </button>
    </form>
  );
};

const UpdateStatusForm = ({ application, onSuccess, cashfree }) => {
  const { user } = useSelector((state) => state.user);
  const isPartner = user?.type === "partner" || user?.role === "partner";

  const [formData, setFormData] = useState({
    status: application?.status || "",
    remarks: ""
  });
  const [loading, setLoading] = useState(false);

  const isUnpaid = application?.paymentStatus !== "Paid";

  const statusOrder = [
    "Waiting for Payment",
    "Pending Applications",
    "Application On Progress",
    "Documents Received",
    "Documents Sent Courier"
  ];

  const currentIdx = statusOrder.indexOf(application?.status);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await serviceApi.updateApplicationStatus(application._id, formData);
      if (res.success) onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isUnpaid) {
    if (!isPartner) {
      return (
        <div className="space-y-6 text-center py-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6">
          <AlertCircle className="w-12 h-12 mx-auto text-amber-500" />
          <p className="text-sm font-black uppercase tracking-widest text-amber-600">Awaiting Payment</p>
          <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
            This document request is currently unpaid. Access is locked for fulfillment administrators until the partner records or pays the fee.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold flex items-center gap-3">
          <AlertCircle size={18} />
          {isPartner 
            ? "Payment Required: You must pay or record the service fee to process this application."
            : "Payment Required: You must record the service fee before processing this application."
          }
        </div>
        <RecordPaymentForm application={application} onSuccess={onSuccess} cashfree={cashfree} />
      </div>
    );
  }

  if (isPartner) {
    return (
      <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
        <p className="text-sm font-black uppercase tracking-widest text-emerald-600">Payment Completed</p>
        <p className="text-xs text-muted-foreground font-medium">
          This application fee has been successfully paid. Platform administrators will review the documents and advance the pipeline status accordingly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Status</label>
          <div className="grid grid-cols-2 gap-2">
            {statusOrder.slice(1).map(s => {
              const targetIdx = statusOrder.indexOf(s);
              const isDisabled = targetIdx <= currentIdx;
              
              return (
                <button
                  key={s}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setFormData({...formData, status: s})}
                  className={cn(
                    "p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    formData.status === s 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                      : isDisabled 
                        ? "bg-muted/10 border-border/50 text-muted-foreground/30 cursor-not-allowed"
                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted hover:border-primary/30"
                  )}
                >
                  {s.replace(" Applications", "")}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Update Remarks</label>
          <textarea 
            required
            rows={3}
            value={formData.remarks}
            onChange={e => setFormData({...formData, remarks: e.target.value})}
            placeholder="Describe the action taken (e.g., Courier tracking number)..."
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-medium"
          />
        </div>
      </div>

      <button 
        disabled={loading}
        className="w-full py-5 rounded-3xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
      >
        {loading ? "Updating..." : "Commit Status Change"}
      </button>

      <div className="p-6 rounded-3xl bg-muted/30 border border-border">
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Historical Audit Trail</p>
        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {application?.history?.map((h, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase text-foreground">{h.status}</p>
                <p className="text-[10px] font-medium text-muted-foreground">{new Date(h.updatedAt).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground/80 mt-1">{h.remarks}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};

const EditServiceForm = ({ service, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: service?.title || "",
    description: service?.description || "",
    currentFee: service?.currentFee || "",
    icon: service?.icon || "Layers",
    documentType: service?.documentType || "Optional",
    categories: service?.categories || (service?.category ? [service.category] : [])
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        icon: formData.icon,
        documentType: formData.documentType,
        categories: formData.categories,
        currentFee: Number(formData.currentFee || 0)
      };

      // If fee changed, update fee separately
      if (Number(formData.currentFee) !== Number(service.currentFee)) {
        await serviceApi.updateServiceFee(service._id, { 
          amount: formData.currentFee,
          remarks: "Fee updated during definition edit"
        });
      }

      const res = await serviceApi.updateServiceDefinition(service._id, payload);
      if (res.success) onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Service Title</label>
          <input 
            required
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="e.g., Optional Certificates"
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-bold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Categories (Select Multiple)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/20 border border-border rounded-[2rem] max-h-[190px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 pr-2">
            {CATEGORY_OPTIONS.map((cat, idx) => {
              const isSelected = formData.categories.includes(cat);
              const Icon = {
                "Academic Documents": GraduationCap,
                "Overseas Education Documents": Globe,
                "Job Overseas Documents": Briefcase,
                "Working In India Documents": Building2,
                "Studying In India Documents": ClipboardCheck,
                "Embassy Attestion Services": Stamp,
                "Study Abroad services": Plane
              }[cat] || Layers;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const newCats = isSelected
                      ? formData.categories.filter(c => c !== cat)
                      : [...formData.categories, cat];
                    setFormData({ ...formData, categories: newCats });
                  }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group hover:scale-[1.02] active:scale-95",
                    isSelected
                      ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5"
                      : "bg-card border-border text-muted-foreground hover:bg-muted hover:border-primary/20"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={cn("text-xs font-black uppercase tracking-wider truncate", isSelected ? "text-primary" : "text-foreground")}>
                      {cat.replace(" Documents", "").replace(" Document", "")}
                    </p>
                    <p className="text-[9px] font-bold text-muted-foreground truncate uppercase tracking-wide mt-0.5">
                      {cat.includes("India") ? "Domestic Fulfillment" : "Overseas Fulfillment"}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Is this service / document mandatory?</label>
          <div className="flex gap-4 p-1 bg-muted/20 border border-border rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({...formData, documentType: "Optional"})}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                formData.documentType === "Optional" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"
              )}
            >
              Optional
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, documentType: "Mandatory"})}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                formData.documentType === "Mandatory" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted"
              )}
            >
              Mandatory
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Base Fee (₹)</label>
          <input 
            required
            type="number"
            value={formData.currentFee}
            onChange={e => setFormData({...formData, currentFee: e.target.value})}
            placeholder="2000"
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-bold"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
          <textarea 
            rows={3}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Describe the service purpose..."
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Service Icon</label>
          <div className="grid grid-cols-5 gap-2 p-4 bg-muted/30 border border-border rounded-2xl max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20">
            {ICON_OPTIONS.map(iconName => {
              const Icon = ICON_MAP[iconName];
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setFormData({...formData, icon: iconName})}
                  className={cn(
                    "p-3 rounded-xl flex items-center justify-center transition-all",
                    formData.icon === iconName 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" 
                      : "bg-background/50 text-muted-foreground hover:bg-muted"
                  )}
                  title={iconName}
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button 
        disabled={loading}
        className="w-full py-5 rounded-3xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
      >
        {loading ? "Saving Changes..." : "Update Service Definition"}
      </button>
    </form>
  );
};

const RecordPaymentForm = ({ application, onSuccess, cashfree }) => {
  const remainingBalance = application.feeAmount - (application.paidAmount || 0);
  
  const [paymentMethodTab, setPaymentMethodTab] = useState("online");
  const [formData, setFormData] = useState({
    amount: remainingBalance,
    method: "Offline / Cash",
    transactionId: "",
    remarks: ""
  });
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!formData.method) {
      dispatch(showAlert({ type: "error", message: "Please specify the payment method." }));
      return;
    }
    if (!formData.transactionId) {
      dispatch(showAlert({ type: "error", message: "Please specify the Transaction ID." }));
      return;
    }
    if (!receipt) {
      dispatch(
        showAlert({
          type: "error",
          message: "Please attach a receipt for offline payment.",
        })
      );
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append("amount", formData.amount);
      data.append("method", formData.method);
      data.append("transactionId", formData.transactionId);
      data.append("remarks", formData.remarks);
      if (receipt) {
        data.append("receipt", receipt);
      }

      const res = await serviceApi.recordServicePayment(application._id, data);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Payment submitted for verification!" }));
        onSuccess();
      }
    } catch (error) {
      dispatch(showAlert({ type: "error", message: error.response?.data?.message || "Payment recording failed" }));
    } finally {
      setLoading(false);
    }
  };

  const handlePayOnline = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) return;

    if (Number(formData.amount) > remainingBalance) {
      dispatch(showAlert({ type: "error", message: "Amount exceeds remaining balance" }));
      return;
    }

    setLoading(true);
    try {
      const res = await serviceApi.createServiceCashfreeOrder(application._id, {
        amount: formData.amount,
        remarks: formData.remarks,
      });
      if (res.success && cashfree) {
        const checkoutOptions = {
          paymentSessionId: res.payment_session_id,
          redirectTarget: "_self",
        };
        cashfree.checkout(checkoutOptions);
      }
    } catch (error) {
      dispatch(
        showAlert({
          type: "error",
          message: error.response?.data?.message || "Failed to initiate online payment",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={paymentMethodTab === "online" ? handlePayOnline : handlePayment} className="space-y-6">
      <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Balance Due</p>
            <p className="text-3xl font-black text-primary">₹{remainingBalance.toLocaleString()}</p>
          </div>
          <CreditCard className="text-primary opacity-20" size={48} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/10">
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Fee</p>
            <p className="text-sm font-bold">₹{application.feeAmount?.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Paid So Far</p>
            <p className="text-sm font-bold text-emerald-500">₹{(application.paidAmount || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex bg-muted p-1 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => setPaymentMethodTab("online")}
          className={cn(
            "flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
            paymentMethodTab === "online"
              ? "bg-card shadow-sm text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Pay Online
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethodTab("offline")}
          className={cn(
            "flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
            paymentMethodTab === "offline"
              ? "bg-card shadow-sm text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Upload Receipt
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount to Pay (₹)</label>
          <input 
            required
            type="number"
            max={remainingBalance}
            min={1}
            value={formData.amount}
            onChange={e => {
              const val = e.target.value;
              if (Number(val) > remainingBalance) {
                setFormData({...formData, amount: remainingBalance.toString()});
              } else {
                setFormData({...formData, amount: val});
              }
            }}
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-black text-lg text-primary"
          />
        </div>

        {paymentMethodTab === "offline" ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Method</label>
                <select 
                  required
                  value={formData.method}
                  onChange={e => setFormData({...formData, method: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-bold appearance-none"
                >
                  <option value="Offline / Cash">Offline / Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Google Pay">Google Pay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="UPI">Other UPI</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Transaction ID (Required)</label>
                <input 
                  required
                  value={formData.transactionId}
                  onChange={e => setFormData({...formData, transactionId: e.target.value})}
                  placeholder="e.g., T230415..."
                  className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-bold"
                />
              </div>
            </div>

            {/* Receipt Upload */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Receipt (Required)</label>
              <div className="relative">
                <input 
                  type="file"
                  id="service-receipt"
                  className="hidden"
                  onChange={(e) => setReceipt(e.target.files[0])}
                  accept="image/*,.pdf"
                />
                <label 
                  htmlFor="service-receipt"
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-dashed cursor-pointer transition-all",
                    receipt ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Upload size={18} className={receipt ? "text-emerald-500" : "text-muted-foreground"} />
                    <span className="text-xs font-bold truncate max-w-[200px]">
                      {receipt ? receipt.name : "Attach proof of payment..."}
                    </span>
                  </div>
                  {receipt && (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  )}
                </label>
              </div>
              <p className="text-[9px] font-medium text-muted-foreground ml-1 italic">JPG, PNG or PDF. Max 5MB.</p>
            </div>
          </>
        ) : null}

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Remarks</label>
          <textarea 
            rows={2}
            value={formData.remarks}
            onChange={e => setFormData({...formData, remarks: e.target.value})}
            placeholder="Any additional payment details..."
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-medium"
          />
        </div>
      </div>

      <button 
        disabled={loading || formData.amount > remainingBalance}
        className="w-full py-5 rounded-3xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mx-auto" />
        ) : paymentMethodTab === "online" ? (
          "Pay Online"
        ) : formData.amount < remainingBalance ? (
          "Record Partial Payment"
        ) : (
          "Record Full Payment & Process"
        )}
      </button>
    </form>
  );
};

const BulkServiceUpdateStatusForm = ({ selectedIds, applications, onSuccess }) => {
  const selectedApps = applications.filter(app => selectedIds.includes(app._id));
  const [formData, setFormData] = useState({
    status: selectedApps[0]?.status || "Pending Applications",
    remarks: ""
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const statusOrder = [
    "Waiting for Payment",
    "Pending Applications",
    "Application On Progress",
    "Documents Received",
    "Documents Sent Courier"
  ];

  const { user } = useSelector((state) => state.user);
  const isPartner = user?.type === "partner" || user?.role === "partner";
  const isUnpaid = selectedApps.some(app => app.paymentStatus !== "Paid");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.remarks.trim()) {
      dispatch(showAlert({ type: "error", message: "Please enter remarks." }));
      return;
    }
    setLoading(true);
    try {
      const { updateApplicationStatus } = await import("../../api/documentsServices.api");
      const promises = selectedApps.map(app => 
        updateApplicationStatus(app._id, formData)
      );
      await Promise.all(promises);
      dispatch(showAlert({ type: "success", message: "Successfully updated status of selected applications!" }));
      onSuccess();
    } catch (error) {
      dispatch(showAlert({ type: "error", message: "Failed to update status for some applications." }));
    } finally {
      setLoading(false);
    }
  };

  if (isUnpaid) {
    if (!isPartner) {
      return (
        <div className="space-y-6 text-center py-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6">
          <AlertCircle className="w-12 h-12 mx-auto text-amber-500" />
          <p className="text-sm font-black uppercase tracking-widest text-amber-600">Awaiting Payment</p>
          <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
            This document bundle is currently unpaid. Access is locked for fulfillment administrators until the partner records or pays the fee.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6 text-center py-8 bg-rose-500/5 border border-rose-500/10 rounded-3xl p-6">
        <AlertCircle className="w-12 h-12 mx-auto text-rose-500" />
        <p className="text-sm font-black uppercase tracking-widest text-rose-600">Payment Required</p>
        <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
          You must pay the service fee for these mandatory documents before the administrators can process them. Please go to the student's payment management page to complete the payment.
        </p>
      </div>
    );
  }

  if (isPartner) {
    return (
      <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
        <p className="text-sm font-black uppercase tracking-widest text-emerald-600">Payment Completed</p>
        <p className="text-xs text-muted-foreground font-medium">
          This application fee has been successfully paid. Platform administrators will review the documents and advance the pipeline status accordingly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Status</label>
          <div className="grid grid-cols-2 gap-2">
            {statusOrder.slice(1).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setFormData({...formData, status: s})}
                className={cn(
                  "p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                  formData.status === s 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted hover:border-primary/30"
                )}
              >
                {s.replace(" Applications", "")}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Update Remarks</label>
          <textarea 
            required
            rows={3}
            value={formData.remarks}
            onChange={e => setFormData({...formData, remarks: e.target.value})}
            placeholder="Describe the action taken (e.g. Approved and dispatched)..."
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-medium"
          />
        </div>
      </div>

      <button 
        disabled={loading}
        className="w-full py-5 rounded-3xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
      >
        {loading ? "Updating..." : `Commit Status Change (${selectedApps.length})`}
      </button>
    </form>
  );
};


