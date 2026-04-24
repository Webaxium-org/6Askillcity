import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { 
  Users,
  Building2, 
  Plus, 
  Trash2, 
  GraduationCap, 
  History, 
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  UserCheck,
  UserMinus,
  Activity,
  FileText,
  ExternalLink,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getPartnerById, 
  togglePartnerActive, 
  getPartnerPermissions, 
  addPartnerPermission, 
  removePartnerPermission 
} from "../../api/partner.api";
import { getUniversities, getPrograms } from "../../api/university.api";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { handleFormError } from "../../utils/handleFormError";

export default function PartnerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [partner, setPartner] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  
  // Permission Modal State
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionType, setPermissionType] = useState("university");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    fetchPartnerData();
    fetchSupportData();
  }, [id]);

  const fetchPartnerData = async () => {
    setLoading(true);
    try {
      const res = await getPartnerById(id);
      if (res.success) {
        setPartner(res.data);
      }
      
      const permRes = await getPartnerPermissions(id);
      if (permRes.success) {
        setPermissions(permRes.data);
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const [uniRes, progRes] = await Promise.all([
        getUniversities(),
        getPrograms()
      ]);
      if (uniRes.success) setUniversities(uniRes.data);
      if (progRes.success) setPrograms(progRes.data);
    } catch (error) {
      console.error("Error fetching support data", error);
    }
  };

  const handleToggleActive = async () => {
    try {
      const res = await togglePartnerActive(id, !partner.isActive);
      if (res.success) {
        setPartner({ ...partner, isActive: !partner.isActive });
        dispatch(showAlert({ 
          type: "success", 
          message: `Partner ${!partner.isActive ? "activated" : "deactivated"} successfully` 
        }));
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const handleAddPermission = async (e) => {
    e.preventDefault();
    if (!selectedId) return;

    try {
      const data = {
        partnerId: id,
        type: permissionType,
        [permissionType === "university" ? "universityId" : "programId"]: selectedId
      };
      
      const res = await addPartnerPermission(data);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Permission added successfully" }));
        setIsPermissionModalOpen(false);
        setSelectedId("");
        // Refresh permissions
        const permRes = await getPartnerPermissions(id);
        if (permRes.success) setPermissions(permRes.data);
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const handleRemovePermission = async (permId) => {
    if (!window.confirm("Are you sure you want to remove this permission?")) return;
    try {
      const res = await removePartnerPermission(permId);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Permission removed" }));
        setPermissions(permissions.filter(p => p._id !== permId));
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  if (loading && !partner) {
    return (
      <DashboardLayout title="Partner Profile">
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: "info", label: "Basic Information", icon: FileText },
    { id: "permissions", label: "Permissions", icon: ShieldCheck },
    { id: "history", label: "Activity History", icon: History },
  ];

  return (
    <DashboardLayout title="Partner Profile">
      <div className="space-y-6">
        {/* Back Button & Action Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/dashboard/partner-management")}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Partners
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleActive}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                partner.isActive 
                  ? "bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white"
              }`}
            >
              {partner.isActive ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              {partner.isActive ? "Deactivate Partner" : "Activate Partner"}
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent relative">
             <div className="absolute -bottom-12 left-8 p-1 bg-card rounded-3xl border border-border shadow-lg">
                <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-primary" />
                </div>
             </div>
          </div>
          
          <div className="pt-16 pb-8 px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black tracking-tight">{partner.centerName}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    partner.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                  }`}>
                    {partner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {partner.location.city}, {partner.location.state}, {partner.location.country}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="bg-muted/50 px-4 py-2 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Registration Date</p>
                  <p className="text-sm font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {new Date(partner.registrationDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-muted/50 px-4 py-2 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Status</p>
                  <p className={`text-sm font-bold flex items-center gap-2 ${
                    partner.status === 'approved' ? 'text-emerald-600' : 
                    partner.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {partner.status.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-muted/20 px-8 py-2">
             <div className="flex gap-8">
               {tabs.map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`py-3 flex items-center gap-2 text-sm font-bold transition-all relative ${
                     activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                   }`}
                 >
                   <tab.icon className="w-4 h-4" />
                   {tab.label}
                   {activeTab === tab.id && (
                     <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                   )}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {activeTab === "info" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
                   <div>
                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                       <UserCheck className="w-5 h-5 text-primary" />
                       Licensee Details
                     </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Name</p>
                          <p className="font-semibold">{partner.licenseeName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email</p>
                          <p className="font-semibold flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {partner.licenseeEmail}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Contact</p>
                          <p className="font-semibold flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {partner.licenseeContactNumber}
                          </p>
                        </div>
                     </div>
                   </div>

                   <div className="pt-8 border-t border-border">
                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                       <Users className="w-5 h-5 text-primary" />
                       Contact Person
                     </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Name</p>
                          <p className="font-semibold">{partner.contactPerson.name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Phone</p>
                          <p className="font-semibold">{partner.contactPerson.phone}</p>
                        </div>
                        <div className="col-span-full space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email</p>
                          <p className="font-semibold">{partner.contactPerson.email}</p>
                        </div>
                     </div>
                   </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
                   <div>
                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                       <MapPin className="w-5 h-5 text-primary" />
                       Location Details
                     </h3>
                     <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Address</p>
                          <p className="font-semibold">{partner.location.address}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">City</p>
                            <p className="font-semibold">{partner.location.city}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pincode</p>
                            <p className="font-semibold">{partner.location.pincode}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">State</p>
                            <p className="font-semibold">{partner.location.state}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Country</p>
                            <p className="font-semibold">{partner.location.country}</p>
                          </div>
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === "permissions" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-card border border-border p-5 rounded-3xl shadow-sm">
                  <div>
                    <h3 className="text-xl font-bold">Access Permissions</h3>
                    <p className="text-sm text-muted-foreground">Manage which universities and programs this partner can access.</p>
                  </div>
                  <button
                    onClick={() => setIsPermissionModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Permission
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Universities Column */}
                  <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 bg-muted/50 border-b border-border flex items-center gap-2">
                       <Building2 className="w-4 h-4 text-primary" />
                       <h4 className="font-bold text-sm">Assigned Universities</h4>
                    </div>
                    <div className="divide-y divide-border">
                       {permissions.filter(p => p.type === "university").length === 0 ? (
                         <div className="p-10 text-center text-muted-foreground text-sm">No universities assigned</div>
                       ) : (
                         permissions.filter(p => p.type === "university").map(perm => (
                           <div key={perm._id} className="px-6 py-4 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                             <div>
                               <p className="font-bold text-sm">{perm.universityId?.name}</p>
                               <p className="text-[10px] text-muted-foreground">Granted: {new Date(perm.grantedAt).toLocaleDateString()}</p>
                             </div>
                             <button 
                               onClick={() => handleRemovePermission(perm._id)}
                               className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl transition-all"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         ))
                       )}
                    </div>
                  </div>

                  {/* Programs Column */}
                  <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 bg-muted/50 border-b border-border flex items-center gap-2">
                       <GraduationCap className="w-4 h-4 text-primary" />
                       <h4 className="font-bold text-sm">Assigned Programs</h4>
                    </div>
                    <div className="divide-y divide-border">
                       {permissions.filter(p => p.type === "program").length === 0 ? (
                         <div className="p-10 text-center text-muted-foreground text-sm">No programs assigned</div>
                       ) : (
                         permissions.filter(p => p.type === "program").map(perm => (
                           <div key={perm._id} className="px-6 py-4 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                             <div>
                               <p className="font-bold text-sm">{perm.programId?.name}</p>
                               <p className="text-[10px] text-muted-foreground">Granted: {new Date(perm.grantedAt).toLocaleDateString()}</p>
                             </div>
                             <button 
                               onClick={() => handleRemovePermission(perm._id)}
                               className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl transition-all"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         ))
                       )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-4">
                {partner.activityLogs?.length === 0 ? (
                  <div className="bg-card border border-border rounded-3xl py-20 text-center text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="font-medium">No activity history found for this partner.</p>
                  </div>
                ) : (
                  partner.activityLogs?.map((log) => (
                    <div key={log._id} className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start hover:shadow-md transition-all">
                      <div className={`mt-1 p-2.5 rounded-xl flex-shrink-0 ${
                        log.action.includes("TOGGLE") ? "bg-amber-500/10 text-amber-500" :
                        log.action.includes("ADD") ? "bg-emerald-500/10 text-emerald-500" :
                        log.action.includes("REMOVE") ? "bg-red-500/10 text-red-500" :
                        "bg-primary/10 text-primary"
                      }`}>
                        <Activity className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-black text-sm uppercase tracking-tight">{log.action.replace(/_/g, " ")}</h4>
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground/80 mb-3">{log.details}</p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 w-fit px-2.5 py-1 rounded-lg border border-border/50">
                          <span>Performed By:</span>
                          <span className="text-foreground">{log.performedBy?.fullName || "System"}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Add Permission Modal */}
        <AnimatePresence>
          {isPermissionModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card w-full max-w-md p-8 rounded-[2rem] shadow-2xl border border-border"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Grant Permission</h3>
                    <p className="text-sm text-muted-foreground font-medium">Add access to a university or program.</p>
                  </div>
                </div>

                <form onSubmit={handleAddPermission} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Type</label>
                    <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-2xl">
                      <button 
                        type="button" 
                        onClick={() => { setPermissionType("university"); setSelectedId(""); }}
                        className={`py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                          permissionType === "university" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        University
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setPermissionType("program"); setSelectedId(""); }}
                        className={`py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                          permissionType === "program" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Program
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">
                      Select {permissionType === "university" ? "University" : "Program"}
                    </label>
                    <select 
                      value={selectedId}
                      onChange={(e) => setSelectedId(e.target.value)}
                      required 
                      className="w-full px-5 py-3.5 rounded-2xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold"
                    >
                      <option value="">Choose one...</option>
                      {permissionType === "university" ? (
                        universities.map(u => <option key={u._id} value={u._id}>{u.name}</option>)
                      ) : (
                        programs.map(p => <option key={p._id} value={p._id}>{p.name} ({p.university?.name})</option>)
                      )}
                    </select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsPermissionModalOpen(false)} 
                      className="flex-1 py-3.5 rounded-2xl border border-border hover:bg-muted font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                    >
                      Grant Access
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
