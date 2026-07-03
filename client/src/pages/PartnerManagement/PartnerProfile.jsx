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
  MessageSquare,
  Lock,
  Key,
  Copy,
  Check,
  GitBranch,
  Search,
  ChevronDown,
  Clock,
  CreditCard,
  Upload,
  Receipt,
  Wallet,
  X,
  Loader2,
  Video,
  Image,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getPartnerById,
  togglePartnerActive,
  getPartnerPermissions,
  addPartnerPermission,
  removePartnerPermission,
  reviewPartner,
  generateAdminToken,
  completePartnerInspection,
  recordOfflineInspectionFee,
  rejectPartnerInspection,
  renewPartnerAuthorisation,
} from "../../api/partner.api";
import {
  getUniversities,
  getPrograms,
  getBranches,
} from "../../api/university.api";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { handleFormError } from "../../utils/handleFormError";

import { AuthorisationLetterModal } from "../../components/dashboard/AuthorisationLetterModal";

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
  const [selectedUniversityId, setSelectedUniversityId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const [isUniSelectOpen, setIsUniSelectOpen] = useState(false);
  const [isProgSelectOpen, setIsProgSelectOpen] = useState(false);
  const [isBranchSelectOpen, setIsBranchSelectOpen] = useState(false);

  const [uniSearchQuery, setUniSearchQuery] = useState("");
  const [progSearchQuery, setProgSearchQuery] = useState("");
  const [branchSearchQuery, setBranchSearchQuery] = useState("");

  const [isAddingPermission, setIsAddingPermission] = useState(false);

  // Reset fields when opening modal
  useEffect(() => {
    if (isPermissionModalOpen) {
      setSelectedUniversityId("");
      setSelectedProgramId("");
      setSelectedBranchId("");
      setUniSearchQuery("");
      setProgSearchQuery("");
      setBranchSearchQuery("");
      setIsUniSelectOpen(false);
      setIsProgSelectOpen(false);
      setIsBranchSelectOpen(false);
    }
  }, [isPermissionModalOpen]);

  // Review Status Modal
  const [isReviewConfirmOpen, setIsReviewConfirmOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(null); // 'approved' or 'rejected'
  const [isReviewing, setIsReviewing] = useState(false);

  // Inspection Modal States
  const [isInspectionReviewOpen, setIsInspectionReviewOpen] = useState(false);
  const [isCompletingInspection, setIsCompletingInspection] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectInspectionReason, setRejectInspectionReason] = useState("");
  const [isRejectingInspection, setIsRejectingInspection] = useState(false);
  const [isRenewConfirmOpen, setIsRenewConfirmOpen] = useState(false);

  // Admin Access Token State
  const [generatedToken, setGeneratedToken] = useState("");
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [copied, setCopied] = useState(false);

  // Delete Permission Modal State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Partner Onboarding & Inspection state hooks
  const [showLetterModal, setShowLetterModal] = useState(false);

  // Offline Payment states
  const [showAdminOfflinePayModal, setShowAdminOfflinePayModal] =
    useState(false);
  const [offlinePaymentData, setOfflinePaymentData] = useState({
    method: "Offline / Cash",
    transactionId: "",
    remarks: "",
  });
  const [offlineReceipt, setOfflineReceipt] = useState(null);
  const [isOfflinePaying, setIsOfflinePaying] = useState(false);

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
        getBranches(),
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
        dispatch(
          showAlert({
            type: "success",
            message: `Partner ${!partner.isActive ? "activated" : "deactivated"} successfully`,
          }),
        );
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
        dispatch(
          showAlert({ type: "success", message: "Access token generated" }),
        );
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
        dispatch(
          showAlert({
            type: "success",
            message: `Partner ${status === "approved" ? "approved" : "rejected"} successfully`,
          }),
        );
        setIsReviewConfirmOpen(false);
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCompleteInspection = async () => {
    setIsCompletingInspection(true);
    try {
      const res = await completePartnerInspection(id);
      if (res.success) {
        setPartner(res.data);
        dispatch(
          showAlert({
            type: "success",
            message: "Inspection completed and Authorisation Letter issued!",
          }),
        );
        setIsInspectionReviewOpen(false);
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setIsCompletingInspection(false);
    }
  };

  const handleRejectInspection = async () => {
    if (!rejectInspectionReason.trim()) return;
    setIsRejectingInspection(true);
    try {
      const res = await rejectPartnerInspection(id, rejectInspectionReason);
      if (res.success) {
        setPartner(res.data);
        dispatch(
          showAlert({
            type: "success",
            message:
              "Partner inspection rejected. They will need to re-upload media.",
          }),
        );
        setIsInspectionReviewOpen(false);
        setShowRejectInput(false);
        setRejectInspectionReason("");
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setIsRejectingInspection(false);
    }
  };

  const [isRenewingLetter, setIsRenewingLetter] = useState(false);

  const getExpirationDetails = () => {
    let validUntilDate = null;
    if (partner?.authorisationLetter) {
      validUntilDate = new Date(partner.authorisationLetter.validUntil);
    } else {
      const baseDate =
        partner?.authorisationLetterIssuedAt ||
        partner?.inspectionCompletedAt ||
        partner?.registrationDate;
      if (baseDate) {
        const d = new Date(baseDate);
        d.setFullYear(d.getFullYear() + 1);
        d.setDate(d.getDate() - 1);
        validUntilDate = d;
      }
    }
    const isExpired = validUntilDate ? validUntilDate < new Date() : false;
    return { validUntilDate, isExpired };
  };

  const handleRenewAuthorisation = async () => {
    setIsRenewingLetter(true);
    try {
      const res = await renewPartnerAuthorisation(id);
      if (res.success) {
        setPartner(res.data);
        dispatch(
          showAlert({
            type: "success",
            message: "Authorisation letter successfully renewed!",
          }),
        );
        setIsRenewConfirmOpen(false);
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setIsRenewingLetter(false);
    }
  };

  const handleAdminOfflinePay = async (e) => {
    e.preventDefault();
    if (!offlinePaymentData.transactionId) {
      dispatch(
        showAlert({
          type: "error",
          message: "Please specify the Transaction ID.",
        }),
      );
      return;
    }
    if (!offlineReceipt) {
      dispatch(
        showAlert({
          type: "error",
          message: "Please attach a receipt for offline payment.",
        }),
      );
      return;
    }

    setIsOfflinePaying(true);
    try {
      const formData = new FormData();
      formData.append("amount", "5000");
      formData.append("method", offlinePaymentData.method);
      formData.append("transactionId", offlinePaymentData.transactionId);
      formData.append("remarks", offlinePaymentData.remarks);
      formData.append("receipt", offlineReceipt);
      formData.append("partnerId", id);

      const res = await recordOfflineInspectionFee(formData);
      if (res.success) {
        dispatch(
          showAlert({
            type: "success",
            message: "Offline payment receipt recorded successfully!",
          }),
        );
        setPartner(res.data);
        setShowAdminOfflinePayModal(false);
      }
    } catch (err) {
      dispatch(
        showAlert({
          type: "error",
          message:
            err.response?.data?.message || "Failed to submit offline payment.",
        }),
      );
    } finally {
      setIsOfflinePaying(false);
    }
  };

  const handleAddPermission = async (e) => {
    e.preventDefault();
    if (!selectedUniversityId) return;

    setIsAddingPermission(true);
    try {
      let addedSomething = false;

      // 1. Check & Add University permission if not already assigned
      const hasUni = permissions.some(
        (p) => p.type === "university" && p.universityId?._id === selectedUniversityId
      );
      if (!hasUni) {
        const res = await addPartnerPermission({
          partnerId: id,
          type: "university",
          universityId: selectedUniversityId,
        });
        if (res.success) addedSomething = true;
      }

      // 2. Check & Add Program permission if program selected and not already assigned
      if (selectedProgramId) {
        const hasProg = permissions.some(
          (p) => p.type === "program" && p.programId?._id === selectedProgramId
        );
        if (!hasProg) {
          const res = await addPartnerPermission({
            partnerId: id,
            type: "program",
            programId: selectedProgramId,
          });
          if (res.success) addedSomething = true;
        }
      }

      // 3. Check & Add Branch permission if branch selected and not already assigned
      if (selectedBranchId) {
        const hasBranch = permissions.some(
          (p) => p.type === "branch" && p.branchId?._id === selectedBranchId
        );
        if (!hasBranch) {
          const res = await addPartnerPermission({
            partnerId: id,
            type: "branch",
            branchId: selectedBranchId,
          });
          if (res.success) addedSomething = true;
        }
      }

      if (addedSomething) {
        dispatch(
          showAlert({
            type: "success",
            message: "Permission(s) added successfully",
          }),
        );
      } else {
        dispatch(
          showAlert({
            type: "info",
            message: "Selected permission is already assigned",
          }),
        );
      }

      setIsPermissionModalOpen(false);
      // Refresh permissions
      const permRes = await getPartnerPermissions(id);
      if (permRes.success) setPermissions(permRes.data);
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setIsAddingPermission(false);
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
        dispatch(
          showAlert({
            type: "success",
            message: "Permission removed successfully",
          }),
        );
        setPermissions(
          permissions.filter((p) => p._id !== permissionToDelete._id),
        );
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

  const isAuthorized = partner?.onboardingState === "completed" && !getExpirationDetails().isExpired;

  const tabs = [
    { id: "info", label: "Basic Information", icon: FileText },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "overview", label: "Overview", icon: Info },
    { id: "permissions", label: "Permissions", icon: isAuthorized ? ShieldCheck : Lock, disabled: !isAuthorized },
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
                    Generate Access Token
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
                  {partner.isActive ? (
                    <UserMinus className="w-4 h-4" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
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
                  <h1 className="text-3xl font-black tracking-tight">
                    {partner.centerName}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      partner.isActive
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-red-500/10 text-red-600"
                    } whitespace-nowrap`}
                  >
                    {partner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {partner.location.city}, {partner.location.state},{" "}
                  {partner.location.country}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="bg-muted/50 px-4 py-2 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Registration Date
                  </p>
                  <p className="text-sm font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {new Date(partner.registrationDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-muted/50 px-4 py-2 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Status
                  </p>
                  <p
                    className={`text-sm font-bold flex items-center gap-2 ${
                      partner.status === "approved"
                        ? "text-emerald-600"
                        : partner.status === "pending"
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {partner.status.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-muted/20 px-4 sm:px-8 py-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 sm:gap-8 whitespace-nowrap min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={`py-3 flex items-center gap-2 text-sm font-bold transition-all relative ${
                    activeTab === tab.id
                      ? "text-primary"
                      : tab.disabled
                        ? "text-muted-foreground/50 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
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
                {/* Onboarding & Inspection Status Console */}
                {partner.status === "approved" && (
                  <div className="col-span-full bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">
                          Onboarding & Inspection Control
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Manage partner credentials, inspection status, and
                          certificates.
                        </p>
                      </div>
                    </div>

                    {partner.onboardingState === "fee_pending" && (
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-3 items-start">
                          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 flex-shrink-0 mt-0.5">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-amber-600">
                              Awaiting Inspection Fee Payment
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-lg">
                              The partner's application request has been
                              approved and password issued. However, the
                              onboarding fee of <strong>₹5,000</strong> has not
                              been paid yet.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setShowAdminOfflinePayModal(true)}
                            className="px-4 py-2 rounded-xl border border-primary/20 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-2"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Log Manual Payment
                          </button>
                        </div>
                      </div>
                    )}

                    {partner.onboardingState === "inspection_pending" && (
                      <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-3 items-start">
                          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0 mt-0.5">
                            <Activity className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-blue-600">
                              Onboarding Fee Paid - Awaiting Inspection Audit
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                              The partner has paid the registration and
                              inspection fee successfully. Please conduct the
                              Online / Physical site inspection to verify their
                              layout and resource capabilities.
                            </p>

                            {partner.inspectionFeePaymentDetails && (
                              <div className="mt-4 flex flex-wrap items-center gap-3 border border-blue-500/20 bg-blue-500/5 p-3 rounded-xl">
                                <div className="text-[10px] font-bold text-blue-800 flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5" />₹
                                  {partner.inspectionFeePaymentDetails.amount ||
                                    partner.inspectionFeePaymentDetails
                                      .payment_amount}{" "}
                                  Paid via{" "}
                                  {partner.inspectionFeePaymentDetails.method ||
                                    partner.inspectionFeePaymentDetails
                                      .payment_group}
                                </div>
                                <div className="text-[10px] font-bold text-blue-800 flex items-center gap-1.5">
                                  <Receipt className="w-3.5 h-3.5" />
                                  TXN:{" "}
                                  {partner.inspectionFeePaymentDetails
                                    .transactionId ||
                                    partner.inspectionFeePaymentDetails
                                      .cf_payment_id}
                                </div>
                                {partner.inspectionFeePaymentDetails
                                  .receipt && (
                                  <a
                                    href={`${partner.inspectionFeePaymentDetails.receipt.replace(/\\/g, "/")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-white border border-blue-500/20 text-blue-600 hover:bg-blue-50 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                  >
                                    View Receipt
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {partner.onboardingState === "completed" &&
                      (() => {
                        const { validUntilDate, isExpired } =
                          getExpirationDetails();
                        return (
                          <div className="space-y-4">
                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                              <div className="flex gap-3 items-start">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 flex-shrink-0 mt-0.5">
                                  <Check className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-emerald-600">
                                    Onboarding Completed & Fully Authorized
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    All onboarding steps were verified. The
                                    Online/Physical site inspection was
                                    completed on{" "}
                                    <strong>
                                      {new Date(
                                        partner.inspectionCompletedAt,
                                      ).toLocaleString()}
                                    </strong>
                                    .
                                  </p>
                                  {validUntilDate && (
                                    <p className="text-xs font-semibold text-muted-foreground mt-1">
                                      Valid Until:{" "}
                                      <span
                                        className={
                                          isExpired
                                            ? "text-red-500 font-bold"
                                            : "text-emerald-600 font-bold"
                                        }
                                      >
                                        {validUntilDate.toLocaleDateString()}
                                      </span>
                                      {isExpired && " (EXPIRED)"}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => setShowLetterModal(true)}
                                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/25 whitespace-nowrap shrink-0"
                              >
                                View Issued Authorisation Letter
                              </button>
                            </div>

                            {isExpired && (
                              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex gap-3 items-start">
                                  <div className="p-2 rounded-xl bg-red-500/10 text-red-600 flex-shrink-0 mt-0.5">
                                    <Clock className="w-5 h-5 animate-pulse" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm text-red-600">
                                      Authorisation Letter Expired
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      The partner's authorization has expired.
                                      Please review and renew their
                                      authorization status.
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setIsRenewConfirmOpen(true)}
                                  disabled={isRenewingLetter}
                                  className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 whitespace-nowrap shrink-0 flex items-center gap-2 disabled:opacity-50"
                                >
                                  {isRenewingLetter && (
                                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                                  )}
                                  Renew Authorisation
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                  </div>
                )}

                <div className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-primary" />
                      Licensee Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Name
                        </p>
                        <p className="font-semibold">{partner.licenseeName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Email
                        </p>
                        <p className="font-semibold flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {partner.licenseeEmail}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Contact
                        </p>
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
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Name
                        </p>
                        <p className="font-semibold">
                          {partner.contactPerson.name}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Phone
                        </p>
                        <p className="font-semibold">
                          {partner.contactPerson.phone}
                        </p>
                      </div>
                      <div className="col-span-full space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Email
                        </p>
                        <p className="font-semibold">
                          {partner.contactPerson.email}
                        </p>
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
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Address
                        </p>
                        <p className="font-semibold">
                          {partner.location.address}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            City
                          </p>
                          <p className="font-semibold">
                            {partner.location.city}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Pincode
                          </p>
                          <p className="font-semibold">
                            {partner.location.pincode}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            State
                          </p>
                          <p className="font-semibold">
                            {partner.location.state}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Country
                          </p>
                          <p className="font-semibold">
                            {partner.location.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: "licenseePhoto", label: "Licensee Photo" },
                  { id: "licenseeAadharCard", label: "Aadhar Card" },
                  { id: "businessLicense", label: "Business License" },
                  {
                    id: "ownershipRentalAgreement",
                    label: "Ownership / Rental Agreement",
                  },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-4 shadow-sm group hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                          <FileText className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-sm">{doc.label}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {partner.documents?.[doc.id] &&
                      partner.documents[doc.id].length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {partner.documents[doc.id].map((path, pIdx) => (
                            <div
                              key={pIdx}
                              className="relative aspect-video rounded-2xl overflow-hidden bg-muted border border-border group/img"
                            >
                              <img
                                src={`${path.replace(/\\/g, "/")}`}
                                alt={`${doc.label} ${pIdx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                              <div className="hidden w-full h-full items-center justify-center text-[8px] font-black uppercase text-muted-foreground tracking-widest text-center p-2 bg-muted">
                                Preview not available
                              </div>
                              <a
                                href={`${path.replace(/\\/g, "/")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all"
                              >
                                <ExternalLink className="w-4 h-4 text-white" />
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="aspect-video rounded-2xl bg-muted/50 border border-dashed border-border flex items-center justify-center">
                          <p className="text-xs font-bold text-muted-foreground">
                            No Files Uploaded
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "documents" && (
              <>
                {/* Center Video Section */}
                {partner.documents?.officeVideo?.length > 0 && (
                  <div className="pt-8 border-t border-border/50 mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Video className="w-4 h-4 text-blue-500" />
                        </div>
                        Center Video
                      </h4>
                    </div>

                    <div className="space-y-6">
                      {partner.documents.officeVideo.map((docUrl, i) => (
                        <div
                          key={`video-${i}`}
                          className="group relative flex flex-col gap-3 p-4 rounded-2xl border border-border bg-muted/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                              <Video className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Center Video
                              </p>
                              <p className="text-xs font-bold text-foreground">
                                Video Walkthrough
                              </p>
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
                {partner.documents?.officePhotos?.length > 0 && (
                  <div className="pt-8 border-t border-border/50 mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                          <Image className="w-4 h-4 text-pink-500" />
                        </div>
                        Center Photos
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {partner.documents.officePhotos.map((docUrl, i) => (
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
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
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
              </>
            )}

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                  <h3 className="text-xl font-bold mb-1">Partner Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    Performance metrics, active students, and inquiries for {partner.centerName}.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Drafts Card */}
                  <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-5 shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                        Application Drafts
                      </p>
                      <h4 className="text-3xl font-black tracking-tight text-foreground">
                        {partner.stats?.totalDrafts ?? 0}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Awaiting submission
                      </p>
                    </div>
                  </div>

                  {/* Total Enrolled Card */}
                  <div
                    onClick={() => navigate("/dashboard/student-management", { state: { partnerId: partner._id } })}
                    className="bg-card border border-border rounded-3xl p-6 flex items-center gap-5 shadow-sm relative overflow-hidden group hover:border-purple-500/30 transition-all cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                        Students Enrolled
                      </p>
                      <h4 className="text-3xl font-black tracking-tight text-foreground">
                        {partner.stats?.totalEnrolled ?? 0}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Active eligible students
                      </p>
                    </div>
                  </div>

                  {/* Total Tickets Card */}
                  <div
                    onClick={() => navigate("/dashboard/tickets", { state: { partnerId: partner._id } })}
                    className="bg-card border border-border rounded-3xl p-6 flex items-center gap-5 shadow-sm relative overflow-hidden group hover:border-rose-500/30 transition-all cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                        Tickets Raised
                      </p>
                      <h4 className="text-3xl font-black tracking-tight text-foreground">
                        {partner.stats?.totalTickets ?? 0}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total support requests
                      </p>
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
                    <p className="text-sm text-muted-foreground">
                      Manage which universities and programs this partner can
                      access.
                    </p>
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
                    <div className="px-6 py-4 bg-muted/50 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <h4 className="font-bold text-sm">
                          Assigned Universities
                        </h4>
                      </div>
                      <button
                        onClick={() => setIsPermissionModalOpen(true)}
                        className="p-1.5 hover:bg-muted bg-white border border-border/50 text-primary rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="divide-y divide-border">
                      {permissions.filter((p) => p.type === "university")
                        .length === 0 ? (
                        <div className="p-10 text-center text-muted-foreground text-sm">
                          No universities assigned
                        </div>
                      ) : (
                        permissions
                          .filter((p) => p.type === "university")
                          .map((perm) => (
                            <div
                              key={perm._id}
                              className="px-6 py-4 flex items-center justify-between group hover:bg-muted/30 transition-colors"
                            >
                              <div>
                                <p className="font-bold text-sm">
                                  {perm.universityId?.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  Granted:{" "}
                                  {new Date(
                                    perm.grantedAt,
                                  ).toLocaleDateString()}
                                </p>
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
                    <div className="px-6 py-4 bg-muted/50 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        <h4 className="font-bold text-sm">Assigned Programs</h4>
                      </div>
                      <button
                        onClick={() => setIsPermissionModalOpen(true)}
                        className="p-1.5 hover:bg-muted bg-white border border-border/50 text-primary rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="divide-y divide-border">
                      {permissions.filter((p) => p.type === "program")
                        .length === 0 ? (
                        <div className="p-10 text-center text-muted-foreground text-sm">
                          No programs assigned
                        </div>
                      ) : (
                        permissions
                          .filter((p) => p.type === "program")
                          .map((perm) => (
                            <div
                              key={perm._id}
                              className="px-6 py-4 flex items-center justify-between group hover:bg-muted/30 transition-colors"
                            >
                              <div>
                                <p className="font-bold text-sm">
                                  {perm.programId?.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  Granted:{" "}
                                  {new Date(
                                    perm.grantedAt,
                                  ).toLocaleDateString()}
                                </p>
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
                    <div className="px-6 py-4 bg-muted/50 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-primary" />
                        <h4 className="font-bold text-sm">Assigned Branches</h4>
                      </div>
                      <button
                        onClick={() => setIsPermissionModalOpen(true)}
                        className="p-1.5 hover:bg-muted bg-white border border-border/50 text-primary rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="divide-y divide-border">
                      {permissions.filter((p) => p.type === "branch").length ===
                      0 ? (
                        <div className="p-10 text-center text-muted-foreground text-sm">
                          No branches assigned
                        </div>
                      ) : (
                        permissions
                          .filter((p) => p.type === "branch")
                          .map((perm) => (
                            <div
                              key={perm._id}
                              className="px-6 py-4 flex items-center justify-between group hover:bg-muted/30 transition-colors"
                            >
                              <div>
                                <p className="font-bold text-sm">
                                  {perm.branchId?.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  Granted:{" "}
                                  {new Date(
                                    perm.grantedAt,
                                  ).toLocaleDateString()}
                                </p>
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
                    <p className="font-medium">
                      No activity history found for this partner.
                    </p>
                  </div>
                ) : (
                  partner.activityLogs?.map((log) => (
                    <div
                      key={log._id}
                      className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start hover:shadow-md transition-all"
                    >
                      <div
                        className={`mt-1 p-2.5 rounded-xl flex-shrink-0 ${
                          log.action.includes("TOKEN")
                            ? "bg-purple-500/10 text-purple-500"
                            : log.action.includes("TOGGLE")
                              ? "bg-amber-500/10 text-amber-500"
                              : log.action.includes("ADD")
                                ? "bg-emerald-500/10 text-emerald-500"
                                : log.action.includes("REMOVE")
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-primary/10 text-primary"
                        }`}
                      >
                        {log.action.includes("TOKEN") ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <Activity className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-black text-sm uppercase tracking-tight">
                            {log.action.replace(/_/g, " ")}
                          </h4>
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground/80 mb-3">
                          {log.details}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 w-fit px-2.5 py-1 rounded-lg border border-border/50">
                          <span>Performed By:</span>
                          <span className="text-foreground">
                            {log.performedBy?.fullName || "System"}
                          </span>
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
                className="bg-card w-full max-w-lg p-8 rounded-[2rem] shadow-2xl border border-border"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Grant Permission</h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      Select University, Program, and/or Branch to grant partner access.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddPermission} className="space-y-6">
                  {/* University Selection */}
                  {(() => {
                    const filteredUniversities = universities.filter((u) =>
                      u.name.toLowerCase().includes(uniSearchQuery.toLowerCase())
                    );
                    const selectedUni = universities.find((u) => u._id === selectedUniversityId);

                    return (
                      <div className="space-y-2 relative">
                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">
                          University
                        </label>
                        <div
                          onClick={() => {
                            setIsUniSelectOpen(!isUniSelectOpen);
                            setIsProgSelectOpen(false);
                            setIsBranchSelectOpen(false);
                          }}
                          className="w-full px-5 py-3.5 rounded-2xl border border-input bg-card hover:border-primary/50 outline-none transition-all text-sm font-semibold cursor-pointer flex items-center justify-between shadow-sm select-none"
                        >
                          <span
                            className={
                              selectedUniversityId
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground font-medium"
                            }
                          >
                            {selectedUni ? selectedUni.name : "Choose University..."}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform ${isUniSelectOpen ? "rotate-180" : ""}`}
                          />
                        </div>

                        <AnimatePresence>
                          {isUniSelectOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-[1000] cursor-default"
                                onClick={() => setIsUniSelectOpen(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 mt-2 p-4 bg-card border border-border rounded-[1.5rem] shadow-2xl z-[1001] space-y-3"
                              >
                                <div className="relative">
                                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search university..."
                                    value={uniSearchQuery}
                                    onChange={(e) => setUniSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-muted/30 focus:border-primary outline-none transition-all text-xs font-semibold text-foreground bg-transparent"
                                  />
                                </div>

                                <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                  {filteredUniversities.length === 0 ? (
                                    <div className="py-6 text-center text-muted-foreground text-xs font-medium">
                                      No universities found
                                    </div>
                                  ) : (
                                    filteredUniversities.map((u) => {
                                      const isSelected = u._id === selectedUniversityId;
                                      const alreadyHasPerm = permissions.some(
                                        (p) => p.type === "university" && p.universityId?._id === u._id
                                      );
                                      return (
                                        <div
                                          key={u._id}
                                          onClick={() => {
                                            setSelectedUniversityId(u._id);
                                            setSelectedProgramId("");
                                            setSelectedBranchId("");
                                            setIsUniSelectOpen(false);
                                            setUniSearchQuery("");
                                          }}
                                          className={`flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all cursor-pointer ${
                                            isSelected ? "bg-primary/5 text-primary" : ""
                                          }`}
                                        >
                                          <div className="flex flex-col text-left">
                                            <span className="text-xs font-bold flex items-center gap-2">
                                              {u.name}
                                              {alreadyHasPerm && (
                                                <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                                  Assigned
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                          {isSelected && (
                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })()}

                  {/* Program Selection */}
                  {selectedUniversityId && (() => {
                    const availablePrograms = programs.filter(
                      (p) => p.university?._id === selectedUniversityId
                    );
                    const filteredPrograms = availablePrograms.filter((p) =>
                      p.name.toLowerCase().includes(progSearchQuery.toLowerCase())
                    );
                    const selectedProg = programs.find((p) => p._id === selectedProgramId);

                    return (
                      <div className="space-y-2 relative">
                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">
                          Program (Optional)
                        </label>
                        <div
                          onClick={() => {
                            setIsProgSelectOpen(!isProgSelectOpen);
                            setIsUniSelectOpen(false);
                            setIsBranchSelectOpen(false);
                          }}
                          className="w-full px-5 py-3.5 rounded-2xl border border-input bg-card hover:border-primary/50 outline-none transition-all text-sm font-semibold cursor-pointer flex items-center justify-between shadow-sm select-none"
                        >
                          <span
                            className={
                              selectedProgramId
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground font-medium"
                            }
                          >
                            {selectedProg ? selectedProg.name : "Choose Program..."}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform ${isProgSelectOpen ? "rotate-180" : ""}`}
                          />
                        </div>

                        <AnimatePresence>
                          {isProgSelectOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-[1000] cursor-default"
                                onClick={() => setIsProgSelectOpen(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 mt-2 p-4 bg-card border border-border rounded-[1.5rem] shadow-2xl z-[1001] space-y-3"
                              >
                                <div className="relative">
                                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search program..."
                                    value={progSearchQuery}
                                    onChange={(e) => setProgSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-muted/30 focus:border-primary outline-none transition-all text-xs font-semibold text-foreground bg-transparent"
                                  />
                                </div>

                                <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                  {filteredPrograms.length === 0 ? (
                                    <div className="py-6 text-center text-muted-foreground text-xs font-medium">
                                      No programs found for this university
                                    </div>
                                  ) : (
                                    filteredPrograms.map((p) => {
                                      const isSelected = p._id === selectedProgramId;
                                      const alreadyHasPerm = permissions.some(
                                        (perm) => perm.type === "program" && perm.programId?._id === p._id
                                      );
                                      return (
                                        <div
                                          key={p._id}
                                          onClick={() => {
                                            setSelectedProgramId(p._id);
                                            setSelectedBranchId("");
                                            setIsProgSelectOpen(false);
                                            setProgSearchQuery("");
                                          }}
                                          className={`flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all cursor-pointer ${
                                            isSelected ? "bg-primary/5 text-primary" : ""
                                          }`}
                                        >
                                          <div className="flex flex-col text-left">
                                            <span className="text-xs font-bold flex items-center gap-2">
                                              {p.name}
                                              {alreadyHasPerm && (
                                                <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                                  Assigned
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                          {isSelected && (
                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })()}

                  {/* Branch Selection */}
                  {selectedProgramId && (() => {
                    const availableBranches = branches.filter(
                      (b) => b.program?._id === selectedProgramId
                    );
                    const filteredBranches = availableBranches.filter((b) =>
                      b.name.toLowerCase().includes(branchSearchQuery.toLowerCase())
                    );
                    const selectedBranch = branches.find((b) => b._id === selectedBranchId);

                    return (
                      <div className="space-y-2 relative">
                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">
                          Branch (Optional)
                        </label>
                        <div
                          onClick={() => {
                            setIsBranchSelectOpen(!isBranchSelectOpen);
                            setIsUniSelectOpen(false);
                            setIsProgSelectOpen(false);
                          }}
                          className="w-full px-5 py-3.5 rounded-2xl border border-input bg-card hover:border-primary/50 outline-none transition-all text-sm font-semibold cursor-pointer flex items-center justify-between shadow-sm select-none"
                        >
                          <span
                            className={
                              selectedBranchId
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground font-medium"
                            }
                          >
                            {selectedBranch ? selectedBranch.name : "Choose Branch..."}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform ${isBranchSelectOpen ? "rotate-180" : ""}`}
                          />
                        </div>

                        <AnimatePresence>
                          {isBranchSelectOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-[1000] cursor-default"
                                onClick={() => setIsBranchSelectOpen(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 mt-2 p-4 bg-card border border-border rounded-[1.5rem] shadow-2xl z-[1001] space-y-3"
                              >
                                <div className="relative">
                                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search branch..."
                                    value={branchSearchQuery}
                                    onChange={(e) => setBranchSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-muted/30 focus:border-primary outline-none transition-all text-xs font-semibold text-foreground bg-transparent"
                                  />
                                </div>

                                <div className="max-h-[160px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                  {filteredBranches.length === 0 ? (
                                    <div className="py-6 text-center text-muted-foreground text-xs font-medium">
                                      No branches found for this program
                                    </div>
                                  ) : (
                                    filteredBranches.map((b) => {
                                      const isSelected = b._id === selectedBranchId;
                                      const alreadyHasPerm = permissions.some(
                                        (perm) => perm.type === "branch" && perm.branchId?._id === b._id
                                      );
                                      return (
                                        <div
                                          key={b._id}
                                          onClick={() => {
                                            setSelectedBranchId(b._id);
                                            setIsBranchSelectOpen(false);
                                            setBranchSearchQuery("");
                                          }}
                                          className={`flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all cursor-pointer ${
                                            isSelected ? "bg-primary/5 text-primary" : ""
                                          }`}
                                        >
                                          <div className="flex flex-col text-left">
                                            <span className="text-xs font-bold flex items-center gap-2">
                                              {b.name}
                                              {alreadyHasPerm && (
                                                <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                                  Assigned
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                          {isSelected && (
                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })()}

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsPermissionModalOpen(false)}
                      className="flex-1 py-3.5 rounded-2xl border border-border hover:bg-muted font-bold transition-all text-foreground bg-transparent"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedUniversityId || isAddingPermission}
                      className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isAddingPermission ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Granting...</span>
                        </>
                      ) : (
                        <span>Grant Access</span>
                      )}
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

                <h3 className="text-3xl font-black mb-4 tracking-tight">
                  One-Time Access Token
                </h3>
                <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
                  Use this token as the password along with the partner email to
                  login.
                  <span className="block mt-2 font-bold text-red-500">
                    This token is valid for 15 minutes and will expire after one
                    use.
                  </span>
                </p>

                <div className="relative group mb-10">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <div className="relative flex items-center bg-card border-2 border-border/50 p-6 rounded-2xl">
                    <code
                      className="flex-1 text-xs sm:text-sm md:text-base font-black tracking-wider text-primary select-all break-all pr-2"
                      style={{ wordBreak: "break-all" }}
                    >
                      {generatedToken}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="ml-4 p-3 rounded-xl bg-muted hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                    >
                      {copied ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
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

        {/* Renew Confirmation Modal */}
        <AnimatePresence>
          {isRenewConfirmOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsRenewConfirmOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card w-full max-w-sm p-6 rounded-2xl shadow-xl border border-border flex flex-col"
              >
                <div className="flex items-center space-x-3 text-emerald-500 mb-4">
                  <ShieldCheck className="w-6 h-6" />
                  <h3 className="text-xl font-bold text-foreground">
                    Renew Authorisation
                  </h3>
                </div>
                <p className="text-muted-foreground mb-6 text-sm flex-1">
                  Are you sure you want to renew the partnership authorisation
                  letter for <strong>{partner.centerName}</strong>? This will
                  generate a new certificate valid for 1 year and email it to
                  the partner.
                </p>
                <div className="flex items-center justify-end space-x-3 mt-auto">
                  <button
                    onClick={() => setIsRenewConfirmOpen(false)}
                    disabled={isRenewingLetter}
                    className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRenewAuthorisation}
                    disabled={isRenewingLetter}
                    className="px-4 py-2 rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 transition-all font-medium text-sm flex items-center space-x-2 shadow-sm animate-none"
                  >
                    {isRenewingLetter ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Renew</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
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
                <div
                  className={`flex items-center space-x-3 mb-4 ${
                    reviewStatus === "approved"
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {reviewStatus === "approved" ? (
                    <UserCheck className="w-6 h-6" />
                  ) : (
                    <UserMinus className="w-6 h-6" />
                  )}
                  <h3 className="text-xl font-bold text-foreground">
                    {reviewStatus === "approved"
                      ? "Confirm Approval"
                      : "Confirm Rejection"}
                  </h3>
                </div>
                <p className="text-muted-foreground mb-6 text-sm flex-1">
                  {reviewStatus === "approved"
                    ? `You are about to approve ${partner.centerName}. They will receive their login credentials via email immediately.`
                    : `Are you sure you want to reject the application for ${partner.centerName}? This action can be undone later if needed.`}
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
                      reviewStatus === "approved"
                        ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                        : "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                    }`}
                  >
                    {isReviewing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      <>
                        {reviewStatus === "approved" ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserMinus className="w-4 h-4" />
                        )}
                        <span>
                          {reviewStatus === "approved" ? "Approve" : "Reject"}
                        </span>
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
                  Are you sure you want to remove access to{" "}
                  <span className="text-foreground font-bold italic underline">
                    {permissionToDelete?.type === "university"
                      ? permissionToDelete.universityId?.name
                      : permissionToDelete?.type === "program"
                        ? permissionToDelete.programId?.name
                        : permissionToDelete.branchId?.name}
                  </span>
                  ? This partner will no longer be able to manage students for
                  this {permissionToDelete?.type}.
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

        {/* Inspection Review Modal */}
        <AnimatePresence>
          {isInspectionReviewOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsInspectionReviewOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card w-full max-w-md p-6 rounded-3xl shadow-2xl border border-border flex flex-col"
              >
                {!showRejectInput ? (
                  <>
                    <div className="flex items-center space-x-3 mb-4 text-blue-500">
                      <ShieldCheck className="w-6 h-6" />
                      <h3 className="text-xl font-black text-foreground">
                        Review Inspection
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-6 text-sm flex-1 leading-relaxed">
                      By confirming this step, you verify that the physical or
                      online facility audit for{" "}
                      <strong>{partner.centerName}</strong> has been
                      successfully completed.
                      <span className="block mt-2 font-bold text-blue-600">
                        This will instantly activate their courses dashboard and
                        email them the official Authorisation Letter.
                      </span>
                    </p>
                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => setShowRejectInput(true)}
                        disabled={isCompletingInspection}
                        className="flex-1 py-3 px-4 rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors font-bold text-sm"
                      >
                        Reject Inspection
                      </button>
                      <button
                        onClick={handleCompleteInspection}
                        disabled={isCompletingInspection}
                        className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all font-bold text-sm flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20"
                      >
                        {isCompletingInspection ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Approve & Activate</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                      <ShieldAlert className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-black mb-2">
                      Reject Inspection
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      Please provide a reason for rejecting the inspection. The
                      partner will be notified and asked to re-upload their
                      media.
                    </p>

                    <textarea
                      value={rejectInspectionReason}
                      onChange={(e) =>
                        setRejectInspectionReason(e.target.value)
                      }
                      placeholder="E.g., Video is blurry, please provide a clear walkthrough of the center..."
                      className="w-full min-h-[100px] p-3 rounded-xl border border-border bg-muted/30 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm resize-none mb-6"
                    />

                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => {
                          setShowRejectInput(false);
                          setRejectInspectionReason("");
                        }}
                        disabled={isRejectingInspection}
                        className="flex-1 py-3 px-4 rounded-xl border border-border hover:bg-muted font-bold transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleRejectInspection}
                        disabled={
                          isRejectingInspection ||
                          !rejectInspectionReason.trim()
                        }
                        className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {isRejectingInspection ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Submit Rejection"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Issued Authorisation Letter Modal */}
        <AnimatePresence>
          {showLetterModal && (
            <AuthorisationLetterModal
              partner={partner}
              onClose={() => setShowLetterModal(false)}
            />
          )}
        </AnimatePresence>
        {/* Admin Offline Payment Modal */}
        <AnimatePresence>
          {showAdminOfflinePayModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998]"
                onClick={() => setShowAdminOfflinePayModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border shadow-2xl rounded-[2rem] z-[9999] overflow-hidden"
              >
                <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">
                        Log Manual Payment
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        Record an offline receipt for this partner
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAdminOfflinePayModal(false)}
                    className="p-2 hover:bg-white rounded-xl text-muted-foreground hover:text-foreground transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={handleAdminOfflinePay}
                  className="p-6 space-y-5"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">
                        Payment Method
                      </label>
                      <select
                        value={offlinePaymentData.method}
                        onChange={(e) =>
                          setOfflinePaymentData({
                            ...offlinePaymentData,
                            method: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        <option>Offline / Cash</option>
                        <option>Bank Transfer / NEFT</option>
                        <option>UPI / QR</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">
                        Transaction ID / Ref No
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TXN12345678"
                        value={offlinePaymentData.transactionId}
                        onChange={(e) =>
                          setOfflinePaymentData({
                            ...offlinePaymentData,
                            transactionId: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">
                        Amount (Fixed)
                      </label>
                      <input
                        type="text"
                        value="₹5,000.00"
                        disabled
                        className="w-full px-4 py-3 bg-muted border border-border/50 rounded-xl text-xs font-bold text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">
                        Payment Receipt
                      </label>
                      <div className="relative border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-muted/80 transition-colors bg-muted/30">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setOfflineReceipt(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs font-bold text-muted-foreground">
                            {offlineReceipt
                              ? offlineReceipt.name
                              : "Click or drag receipt here"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAdminOfflinePayModal(false)}
                      className="flex-1 py-3.5 bg-muted text-foreground rounded-xl font-bold text-sm hover:bg-muted/80 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isOfflinePaying}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isOfflinePaying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Receipt className="w-4 h-4" />
                          <span>Submit Receipt</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
