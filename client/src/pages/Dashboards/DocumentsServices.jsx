import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
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
} from "lucide-react";
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
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null); // service object
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(null); // application object

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, servicesRes, studentsRes] = await Promise.all([
        serviceApi.getServiceDashboardStats(),
        serviceApi.getServiceApplications(),
        serviceApi.getServiceDefinitions(),
        getManagementStudents()
      ]);

      if (statsRes.success) setStats(statsRes.data.stats);
      if (appsRes.success) setApplications(appsRes.data);
      if (servicesRes.success) setServices(servicesRes.data);
      if (studentsRes.success) setStudents(studentsRes.data);
    } catch (error) {
      dispatch(showAlert({ type: "error", message: "Failed to load system data" }));
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.service?.title?.toLowerCase().includes(search.toLowerCase()) ||
      app.subCategory?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
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
            <button 
              onClick={() => setShowApplyModal(true)}
              className="px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Apply for Student
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-4 rounded-2xl bg-card border border-border text-foreground font-black text-xs uppercase tracking-widest hover:bg-muted transition-all flex items-center gap-2"
            >
              <Settings size={18} />
              Create Service
            </button>
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
        <div className="flex items-center gap-2 p-1.5 bg-muted/50 w-fit rounded-2xl border border-border">
          <button 
            onClick={() => setActiveTab("applications")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "applications" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Applications
          </button>
          <button 
            onClick={() => setActiveTab("management")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "management" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Manage Services
          </button>
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
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-6 py-4 rounded-[1.5rem] bg-card border border-border/50 text-xs font-black uppercase tracking-[0.2em] outline-none hover:border-primary/30 transition-all appearance-none text-muted-foreground"
                >
                  <option value="all">All Status</option>
                  <option value="Pending Applications">Pending</option>
                  <option value="Application On Progress">In Progress</option>
                  <option value="Documents Received">Received</option>
                  <option value="Documents Sent Courier">Sent</option>
                </select>
                
                <button className="flex items-center gap-3 px-8 py-4 rounded-[1.5rem] bg-card/40 backdrop-blur-xl border border-border/50 text-xs font-black uppercase tracking-[0.2em] hover:bg-muted/50 hover:border-primary/30 transition-all group">
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  Export
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Student Info</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Requested Service</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Fee Tracking</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center">
                          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Synchronizing Data...</p>
                        </td>
                      </tr>
                    ) : filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center space-y-3">
                          <Layers className="w-12 h-12 mx-auto opacity-10" />
                          <p className="text-muted-foreground font-medium">No applications found matching your criteria.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app, idx) => (
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
                              "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
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
                              onClick={() => setShowStatusModal(app)}
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
              ) : filteredApplications.length === 0 ? (
                <div className="p-12 text-center bg-card border border-border rounded-3xl space-y-2">
                  <Layers className="w-8 h-8 mx-auto opacity-10" />
                  <p className="text-xs font-medium text-muted-foreground">No matches found.</p>
                </div>
              ) : (
                filteredApplications.map((app, idx) => (
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
                        onClick={() => setShowStatusModal(app)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <motion.div 
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                    <Layers size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Base Fee</p>
                    <p className="text-lg font-black text-primary">₹{service.currentFee?.toLocaleString()}</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-black mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{service.description}</p>
                
                <div className="space-y-2 mb-8">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3">Sub-Categories</p>
                  {service.subCategories?.map((sub, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-foreground/80 bg-muted/30 p-2 rounded-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                      {sub}
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setShowEditModal(service)}
                  className="w-full py-4 rounded-2xl border border-border/50 bg-muted/20 text-xs font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                >
                  Edit Definition
                </button>
              </motion.div>
            ))}
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={32} />
              </div>
              <p className="font-black uppercase tracking-widest text-xs">Define New Service</p>
            </button>
          </div>
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
          students={students}
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
    subCategories: [""]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await serviceApi.createServiceDefinition({
        ...formData,
        subCategories: formData.subCategories.filter(s => s.trim() !== "")
      });
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
        <div className="grid grid-cols-2 gap-4">
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sub-Categories</label>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, subCategories: [...formData.subCategories, ""]})}
              className="text-[10px] font-black uppercase text-primary hover:underline"
            >
              + Add Another
            </button>
          </div>
          {formData.subCategories.map((sub, idx) => (
            <div key={idx} className="flex gap-2">
              <input 
                value={sub}
                onChange={e => {
                  const newSubs = [...formData.subCategories];
                  newSubs[idx] = e.target.value;
                  setFormData({...formData, subCategories: newSubs});
                }}
                placeholder={`Sub-category ${idx + 1}`}
                className="flex-1 px-5 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary outline-none transition-all text-sm font-bold"
              />
              {formData.subCategories.length > 1 && (
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, subCategories: formData.subCategories.filter((_, i) => i !== idx)})}
                  className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
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

const ApplyServiceForm = ({ services, students, onSuccess }) => {
  const [formData, setFormData] = useState({
    studentId: "",
    serviceId: "",
    subCategory: "",
    adminRemarks: ""
  });
  const [loading, setLoading] = useState(false);

  const selectedService = services.find(s => s._id === formData.serviceId);

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
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Student</label>
          <select 
            required
            value={formData.studentId}
            onChange={e => setFormData({...formData, studentId: e.target.value})}
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-bold appearance-none"
          >
            <option value="">Select a student...</option>
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.name} ({s.university?.name})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Service Template</label>
            <select 
              required
              value={formData.serviceId}
              onChange={e => setFormData({...formData, serviceId: e.target.value, subCategory: ""})}
              className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-bold appearance-none"
            >
              <option value="">Select service...</option>
              {services.map(s => (
                <option key={s._id} value={s._id}>{s.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sub-Category</label>
            <select 
              required={selectedService?.subCategories?.length > 0}
              disabled={!selectedService}
              value={formData.subCategory}
              onChange={e => setFormData({...formData, subCategory: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-bold appearance-none disabled:opacity-50"
            >
              <option value="">{selectedService?.subCategories?.length > 0 ? "Select sub-cat..." : "No sub-categories"}</option>
              {selectedService?.subCategories.map((sub, i) => (
                <option key={i} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
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
            <p className="text-xl font-black text-primary">₹{selectedService.currentFee?.toLocaleString()}</p>
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

const UpdateStatusForm = ({ application, onSuccess }) => {
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
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold flex items-center gap-3">
          <AlertCircle size={18} />
          Payment Required: You must record the service fee before processing this application.
        </div>
        <RecordPaymentForm application={application} onSuccess={onSuccess} />
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
    subCategories: service?.subCategories?.length > 0 ? [...service.subCategories] : [""]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If fee changed, update fee separately
      if (Number(formData.currentFee) !== Number(service.currentFee)) {
        await serviceApi.updateServiceFee(service._id, { 
          amount: formData.currentFee,
          remarks: "Fee updated during definition edit"
        });
      }

      const res = await serviceApi.updateServiceDefinition(service._id, {
        ...formData,
        subCategories: formData.subCategories.filter(s => s.trim() !== "")
      });
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
        <div className="grid grid-cols-2 gap-4">
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Sub-Categories</label>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, subCategories: [...formData.subCategories, ""]})}
              className="text-[10px] font-black uppercase text-primary hover:underline"
            >
              + Add Another
            </button>
          </div>
          {formData.subCategories.map((sub, idx) => (
            <div key={idx} className="flex gap-2">
              <input 
                value={sub}
                onChange={e => {
                  const newSubs = [...formData.subCategories];
                  newSubs[idx] = e.target.value;
                  setFormData({...formData, subCategories: newSubs});
                }}
                placeholder={`Sub-category ${idx + 1}`}
                className="flex-1 px-5 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary outline-none transition-all text-sm font-bold"
              />
              <button 
                type="button"
                onClick={() => setFormData({...formData, subCategories: formData.subCategories.filter((_, i) => i !== idx)})}
                className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
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

const RecordPaymentForm = ({ application, onSuccess }) => {
  const remainingBalance = application.feeAmount - (application.paidAmount || 0);
  
  const [formData, setFormData] = useState({
    amount: remainingBalance,
    method: "Offline",
    transactionId: "",
    remarks: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await serviceApi.recordServicePayment(application._id, formData);
      if (res.success) onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount to Pay (₹)</label>
          <input 
            required
            type="number"
            max={remainingBalance}
            min={1}
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: e.target.value})}
            className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-black text-lg text-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Method</label>
            <select 
              required
              value={formData.method}
              onChange={e => setFormData({...formData, method: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-bold appearance-none"
            >
              <option value="Offline">Offline / Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Google Pay">Google Pay</option>
              <option value="PhonePe">PhonePe</option>
              <option value="UPI">Other UPI</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Transaction ID (Optional)</label>
            <input 
              value={formData.transactionId}
              onChange={e => setFormData({...formData, transactionId: e.target.value})}
              placeholder="e.g., T230415..."
              className="w-full px-5 py-4 rounded-2xl bg-muted/30 border border-border focus:border-primary outline-none transition-all font-bold"
            />
          </div>
        </div>

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
        {loading ? "Recording..." : formData.amount < remainingBalance ? "Record Partial Payment" : "Record Full Payment & Process"}
      </button>
    </form>
  );
};


