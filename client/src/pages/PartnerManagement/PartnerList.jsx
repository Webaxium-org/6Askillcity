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
  ChevronRight,
  UserCheck,
  UserMinus,
  Mail,
  Phone,
  MapPin,
  Building2,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPartners, togglePartnerActive } from "../../api/partner.api";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { handleFormError } from "../../utils/handleFormError";
import { useNavigate } from "react-router-dom";

export default function PartnerList() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

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
        setPartners(partners.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
        dispatch(showAlert({ 
          type: "success", 
          message: `Partner ${!currentStatus ? "activated" : "deactivated"} successfully` 
        }));
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const filteredPartners = partners.filter(p => {
    const matchesSearch = 
      p.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.licenseeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.licenseeEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesActive = activeFilter === "all" || 
      (activeFilter === "active" ? p.isActive : !p.isActive);

    return matchesSearch && matchesStatus && matchesActive;
  });

  return (
    <DashboardLayout title="Partner Management">
      <div className="space-y-6">
        {/* Filters Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-transparent focus:bg-background focus:border-primary/30 rounded-xl text-sm outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-muted/50 border border-transparent focus:bg-background focus:border-primary/30 rounded-xl text-xs font-medium outline-none transition-all"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select 
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="px-3 py-2.5 bg-muted/50 border border-transparent focus:bg-background focus:border-primary/30 rounded-xl text-xs font-medium outline-none transition-all"
              >
                <option value="all">All States</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Partners: {partners.length}
            </div>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
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
            ) : filteredPartners.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
                <Users className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">No partners found matching your criteria</p>
              </div>
            ) : (
              filteredPartners.map((partner) => (
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
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      partner.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600' :
                      partner.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-red-500/10 text-red-600'
                    }`}>
                      {partner.status === 'approved' ? <CheckCircle className="w-3 h-3" /> :
                       partner.status === 'pending' ? <Clock className="w-3 h-3" /> :
                       <XCircle className="w-3 h-3" />}
                      {partner.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate leading-tight">{partner.centerName}</h3>
                      <p className="text-sm text-muted-foreground truncate">{partner.licenseeName}</p>
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
                      <span className="truncate">{partner.location.city}, {partner.location.state}</span>
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
                                 <span key={idx} className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                                   {uni}
                                 </span>
                               ))
                             ) : (
                               <span className="text-[10px] text-muted-foreground italic">None assigned</span>
                             )}
                          </div>
                       </div>
                       <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-600/70 mb-1 flex items-center gap-1">
                             <GraduationCap className="w-2.5 h-2.5" /> Courses
                          </p>
                          <div className="flex items-baseline gap-1">
                             <span className="text-lg font-black text-emerald-600 leading-none">{partner.programCount || 0}</span>
                             <span className="text-[10px] font-bold text-emerald-600/60 uppercase">Programs</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(partner._id, partner.isActive)}
                        className={`p-2 rounded-xl transition-all border ${
                          partner.isActive 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                            : "bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white"
                        }`}
                        title={partner.isActive ? "Deactivate Partner" : "Activate Partner"}
                      >
                        {partner.isActive ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                      </button>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {partner.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/dashboard/partner-management/${partner._id}`)}
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
      </div>
    </DashboardLayout>
  );
}
