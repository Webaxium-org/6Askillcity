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
  Info,
  Lock,
  Key,
  Copy,
  Check,
  GitBranch
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getPartnerById, 
  togglePartnerActive, 
  getPartnerPermissions, 
  addPartnerPermission, 
  removePartnerPermission,
  reviewPartner,
  generateAdminToken
} from "../../api/partner.api";
import { getUniversities, getPrograms, getBranches } from "../../api/university.api";
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
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  
  // Permission Modal State
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionType, setPermissionType] = useState("university");
  const [selectedId, setSelectedId] = useState("");
  
  // Review Status Modal
  const [isReviewConfirmOpen, setIsReviewConfirmOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(null); // 'approved' or 'rejected'
  const [isReviewing, setIsReviewing] = useState(false);

  // Admin Access Token State
  const [generatedToken, setGeneratedToken] = useState("");
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [copied, setCopied] = useState(false);

  // Delete Permission Modal State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const [uniRes, progRes, branchRes] = await Promise.all([
        getUniversities(),
        getPrograms(),
        getBranches()
      ]);
      if (uniRes.success) setUniversities(uniRes.data);
      if (progRes.success) setPrograms(progRes.data);
      if (branchRes.success) setBranches(branchRes.data);
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

  const handleGenerateToken = async () => {
    setIsGeneratingToken(true);
    try {
      const res = await generateAdminToken(id);
      if (res.success) {
        setGeneratedToken(res.token);
        setIsTokenModalOpen(true);
        dispatch(showAlert({ type: "success", message: "Access token generated" }));
        // Refresh partner data to show new log
        fetchPartnerData();
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReviewPartner = async (status) => {
    setIsReviewing(true);
    try {
      const res = await reviewPartner(id, status);
      if (res.success) {
        setPartner(res.data);
        dispatch(showAlert({ 
          type: "success", 
          message: `Partner ${status === 'approved' ? 'approved' : 'rejected'} successfully` 
        }));
        setIsReviewConfirmOpen(false);
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleAddPermission = async (e) => {
    e.preventDefault();
    if (!selectedId) return;

    try {
      const data = {
        partnerId: id,
        type: permissionType,
        [permissionType === "university" ? "universityId" : permissionType === "program" ? "programId" : "branchId"]: selectedId
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

  const handleRemovePermission = (perm) => {
    setPermissionToDelete(perm);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeletePermission = async () => {
    if (!permissionToDelete) return;
    setIsDeleting(true);
    try {
      const res = await removePartnerPermission(permissionToDelete._id);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Permission removed successfully" }));
        setPermissions(permissions.filter(p => p._id !== permissionToDelete._id));
        setIsDeleteConfirmOpen(false);
        setPermissionToDelete(null);
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setIsDeleting(false);
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
    { id: "documents", label: "Documents", icon: FileText },
    { id: "permissions", label: "Permissions", icon: ShieldCheck },
    { id: "history", label: "Activity History", icon: History },
  ];

  return (
    <DashboardLayout title="Partner Profile">
      <div className="space-y-6">
        {/* Back Button & Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button 
            onClick={() => navigate("/dashboard/partner-management")}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Partners
          </button>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {partner.status === "pending" ? (
              <>
                <button
                  onClick={() => {
                    setReviewStatus("rejected");
                    setIsReviewConfirmOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all"
                >
                  <UserMinus className="w-4 h-4" />
                  Reject Partner
                </button>
                <button
                  onClick={() => {
                    setReviewStatus("approved");
                    setIsReviewConfirmOpen(true);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                >
                  <UserCheck className="w-4 h-4" />
                  Approve
                </button>
              </>
            ) : (
              <>
                {partner.status === "approved" && (
                  <button
                    onClick={handleGenerateToken}
                    disabled={isGeneratingToken}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    {isGeneratingToken ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    Generate Admin Token
                  </button>
                )}
                <button
                  onClick={handleToggleActive}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    partner.isActive 
                      ? "bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                  }`}
                >
                  {partner.isActive ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  {partner.isActive ? "Deactivate" : "Activate"}
                </button>
              </>
            )}
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
          
          <div className="pt-16 pb-8 px-4 sm:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
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

          <div className="border-t border-border bg-muted/20 px-4 sm:px-8 py-1 overflow-x-auto scrollbar-hide">
             <div className="flex gap-6 sm:gap-8 whitespace-nowrap min-w-max">
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

            {activeTab === "documents" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Individual Documents */}
                {[
                  { label: "Licensee Photo", path: partner.documents?.licenseePhoto },
                  { label: "Aadhar Card", path: partner.documents?.licenseeAadharCard },
                  { label: "Business License", path: partner.documents?.businessLicense },
                  { label: "Office Agreement", path: partner.documents?.ownershipRentalAgreement },
                ].map((doc, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-sm group hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <FileText className="w-5 h-5" />
                         </div>
                         <p className="font-bold text-sm">{doc.label}</p>
                      </div>
                      <div className="flex gap-2">
                        {doc.path && (
                          <>
                            <a 
                              href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${doc.path.replace(/\\/g, "/")}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    {doc.path ? (
                      <div className="aspect-video rounded-2xl overflow-hidden bg-muted border border-border">
                         <img 
                           src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${doc.path.replace(/\\/g, "/")}`} 
                           alt={doc.label}
                           className="w-full h-full object-cover"
                           onError={(e) => {
                             e.target.style.display = 'none';
                             e.target.nextSibling.style.display = 'flex';
                           }}
                         />
                         <div className="hidden w-full h-full items-center justify-center text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center p-4">
                            Preview not available<br/>(PDF or Invalid Path)
                         </div>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-2xl bg-muted/50 border border-dashed border-border flex items-center justify-center">
                         <p className="text-xs font-bold text-muted-foreground">Not Uploaded</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Office Photos Gallery */}
                {partner.documents?.officePhotos?.length > 0 && (
                  <div className="col-span-full bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
                    <h3 className="text-xl font-black flex items-center gap-2">
                       <Building2 className="w-5 h-5 text-primary" />
                       Office Photos Gallery
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                       {partner.documents.officePhotos.map((photo, idx) => (
                         <a 
                           key={idx}
                           href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${photo.replace(/\\/g, "/")}`}
                           target="_blank"
                           rel="noreferrer"
                           className="aspect-square rounded-2xl overflow-hidden border border-border hover:border-primary transition-all group"
                         >
                            <img 
                              src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${photo.replace(/\\/g, "/")}`}
                              alt={`Office ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                            />
                         </a>
                       ))}
                    </div>
                  </div>
                )}
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
                               onClick={() => handleRemovePermission(perm)}
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
                               onClick={() => handleRemovePermission(perm)}
                               className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl transition-all"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         ))
                       )}
                    </div>
                  </div>

                  {/* Branches Column */}
                  <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 bg-muted/50 border-b border-border flex items-center gap-2">
                       <GitBranch className="w-4 h-4 text-primary" />
                       <h4 className="font-bold text-sm">Assigned Branches</h4>
                    </div>
                    <div className="divide-y divide-border">
                       {permissions.filter(p => p.type === "branch").length === 0 ? (
                         <div className="p-10 text-center text-muted-foreground text-sm">No branches assigned</div>
                       ) : (
                         permissions.filter(p => p.type === "branch").map(perm => (
                           <div key={perm._id} className="px-6 py-4 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                             <div>
                               <p className="font-bold text-sm">{perm.branchId?.name}</p>
                               <p className="text-[10px] text-muted-foreground">Granted: {new Date(perm.grantedAt).toLocaleDateString()}</p>
                             </div>
                             <button 
                               onClick={() => handleRemovePermission(perm)}
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
                        log.action.includes("TOKEN") ? "bg-purple-500/10 text-purple-500" :
                        log.action.includes("TOGGLE") ? "bg-amber-500/10 text-amber-500" :
                        log.action.includes("ADD") ? "bg-emerald-500/10 text-emerald-500" :
                        log.action.includes("REMOVE") ? "bg-red-500/10 text-red-500" :
                        "bg-primary/10 text-primary"
                      }`}>
                        {log.action.includes("TOKEN") ? <Lock className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
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
                    <div className="grid grid-cols-3 gap-2 bg-muted p-1 rounded-2xl">
                      <button 
                        type="button" 
                        onClick={() => { setPermissionType("university"); setSelectedId(""); }}
                        className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                          permissionType === "university" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Univ
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setPermissionType("program"); setSelectedId(""); }}
                        className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                          permissionType === "program" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Prog
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setPermissionType("branch"); setSelectedId(""); }}
                        className={`py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                          permissionType === "branch" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Branch
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
                      ) : permissionType === "program" ? (
                        programs
                          .filter(p => !permissions.some(perm => perm.type === "university" && perm.universityId?._id === p.university?._id))
                          .map(p => <option key={p._id} value={p._id}>{p.name} ({p.university?.name})</option>)
                      ) : (
                        branches
                          .filter(b => !permissions.some(perm => 
                            (perm.type === "university" && perm.universityId?._id === b.program?.university?._id) ||
                            (perm.type === "program" && perm.programId?._id === b.program?._id)
                          ))
                          .map(b => <option key={b._id} value={b._id}>{b.name} ({b.program?.name})</option>)
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
        {/* Admin Token Modal */}
        <AnimatePresence>
          {isTokenModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card w-full max-w-lg p-10 rounded-[3rem] shadow-2xl border border-border text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-purple-500 to-primary animate-gradient-x" />
                
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <ShieldCheck className="w-10 h-10" />
                </div>

                <h3 className="text-3xl font-black mb-4 tracking-tight">One-Time Access Token</h3>
                <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
                  Use this token as the password along with the partner email to login. 
                  <span className="block mt-2 font-bold text-red-500">This token is valid for 15 minutes and will expire after one use.</span>
                </p>

                <div className="relative group mb-10">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <div className="relative flex items-center bg-card border-2 border-border/50 p-6 rounded-2xl">
                    <code className="flex-1 text-2xl font-black tracking-wider text-primary select-all">
                      {generatedToken}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="ml-4 p-3 rounded-xl bg-muted hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsTokenModalOpen(false)}
                  className="w-full py-5 rounded-[1.5rem] bg-foreground text-background font-black uppercase tracking-widest hover:opacity-90 transition-all"
                >
                  Got it, close
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Review Confirmation Modal */}
        <AnimatePresence>
          {isReviewConfirmOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsReviewConfirmOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card w-full max-w-sm p-6 rounded-2xl shadow-xl border border-border flex flex-col"
              >
                <div className={`flex items-center space-x-3 mb-4 ${
                  reviewStatus === 'approved' ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {reviewStatus === 'approved' ? <UserCheck className="w-6 h-6" /> : <UserMinus className="w-6 h-6" />}
                  <h3 className="text-xl font-bold text-foreground">
                    {reviewStatus === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-6 text-sm flex-1">
                  {reviewStatus === 'approved' 
                    ? `You are about to approve ${partner.centerName}. They will receive their login credentials via email immediately.`
                    : `Are you sure you want to reject the application for ${partner.centerName}? This action can be undone later if needed.`
                  }
                </p>
                <div className="flex items-center justify-end space-x-3 mt-auto">
                  <button
                    onClick={() => setIsReviewConfirmOpen(false)}
                    disabled={isReviewing}
                    className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReviewPartner(reviewStatus)}
                    disabled={isReviewing}
                    className={`px-4 py-2 rounded-xl text-white transition-all font-medium text-sm flex items-center space-x-2 shadow-sm ${
                      reviewStatus === 'approved' 
                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                        : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                    }`}
                  >
                    {isReviewing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      <>
                        {reviewStatus === 'approved' ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                        <span>{reviewStatus === 'approved' ? 'Approve' : 'Reject'}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Permission Confirmation Modal */}
        <AnimatePresence>
          {isDeleteConfirmOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setPermissionToDelete(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card w-full max-w-sm p-6 rounded-2xl shadow-xl border border-border flex flex-col"
              >
                <div className="flex items-center space-x-3 text-red-500 mb-4">
                  <Trash2 className="w-6 h-6" />
                  <h3 className="text-xl font-bold text-foreground">
                    Remove Permission
                  </h3>
                </div>
                <p className="text-muted-foreground mb-6 text-sm flex-1">
                  Are you sure you want to remove access to <span className="text-foreground font-bold italic underline">
                    {permissionToDelete?.type === "university" ? permissionToDelete.universityId?.name : 
                     permissionToDelete?.type === "program" ? permissionToDelete.programId?.name : 
                     permissionToDelete.branchId?.name}
                  </span>? This partner will no longer be able to manage students for this {permissionToDelete?.type}.
                </p>
                <div className="flex items-center justify-end space-x-3 mt-auto">
                  <button
                    onClick={() => {
                      setIsDeleteConfirmOpen(false);
                      setPermissionToDelete(null);
                    }}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeletePermission}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium text-sm flex items-center space-x-2 shadow-sm"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Remove Access</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
