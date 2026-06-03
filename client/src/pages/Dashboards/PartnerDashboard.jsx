import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { StatCard } from "../../components/dashboard/StatCard";
import {
  Users,
  BookOpen,
  CalendarDays,
  Briefcase,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Activity,
  CheckCircle,
  CreditCard,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Clock,
  ArrowRight,
  FileText,
  Sparkles,
  ShieldCheck,
  Building,
  Loader2,
  X,
  Upload,
  Wallet,
  Receipt,
  Video,
  Image,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { load } from "@cashfreepayments/cashfree-js";
import { 
  getPartnerDashboardStats, 
  getMyProfile,
  createInspectionFeeOrder,
  verifyInspectionFeePayment,
  recordOfflineInspectionFee,
  uploadInspectionMedia
} from "../../api/partner.api";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { setUser } from "../../redux/userSlice";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");
const PARTNER_MONTHLY_TARGET = 10;

// Authorisation Letter Modal (Printable)
const AuthorisationLetterModal = ({ partner, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const letterDate = new Date(partner.inspectionCompletedAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-zinc-950/60 backdrop-blur-md print:bg-white print:p-0">
      <div className="bg-card w-full max-w-[800px] rounded-3xl border border-border shadow-2xl p-8 max-h-[90vh] overflow-y-auto print:border-none print:shadow-none print:max-h-none print:overflow-visible print:p-0 custom-scrollbar">
        
        {/* Action buttons (hidden when printing) */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Partnership Certificate</h4>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all shadow-md shadow-primary/10"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition-all border border-border"
            >
              Close
            </button>
          </div>
        </div>

        {/* The Formal Letter (A4 Proportion) */}
        <div className="bg-white border-2 border-slate-900 rounded-sm p-10 font-serif text-slate-800 shadow-sm relative print:border-none print:shadow-none print:p-0">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900" />
          
          <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
            <h1 className="text-blue-900 text-3xl font-black font-sans leading-none">6A SKILLCITY</h1>
            <p className="text-slate-500 text-xs font-bold font-sans tracking-[0.15em] uppercase mt-2">National Skill Development & Education Network</p>
            <p className="text-slate-700 text-xs font-serif italic mt-1">Authorized Admission and Learning Resource Point Protocol</p>
          </div>

          <table className="w-full mb-8 text-xs font-sans text-slate-600">
            <tbody>
              <tr>
                <td><strong>Ref No:</strong> 6A-AP/L-AUTH-{partner._id?.slice(-6).toUpperCase()}</td>
                <td className="text-right"><strong>Date:</strong> {letterDate}</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-center text-blue-900 text-lg font-black font-sans tracking-[0.15em] uppercase border-b border-slate-200 pb-2 mb-8">LETTER OF AUTHORISATION</h2>

          <p className="text-sm leading-relaxed text-justify mb-6">
            This is to certify that <strong>{partner.centerName}</strong>, under the leadership of Licensee/Director <strong>{partner.licenseeName}</strong>, located at <em>{partner.location?.address}, {partner.location?.city}, {partner.location?.state} - {partner.location?.pincode}</em>, is formally designated as an <strong>Authorized Admission & Learning Resource Point</strong> of <strong>6A Skillcity</strong>.
          </p>

          <p className="text-sm leading-relaxed text-justify mb-6">
            Following a successful physical/online inspection of the facility and verification of operational criteria, the designated point has been assigned Center Code <strong>6A-AP-{partner._id?.slice(-4).toUpperCase()}</strong>.
          </p>

          <p className="text-sm leading-relaxed text-justify mb-10">
            As an Authorized Point, {partner.centerName} is permitted to guide candidates, facilitate admissions, register students for skill development programs, and access the official University networks and courses mapped to the 6A Skillcity portal, subject to the terms of the Partnership Agreement.
          </p>

          <table className="w-full mt-16 font-sans">
            <tbody>
              <tr>
                <td className="w-1/2 text-xs text-slate-400 vertical-align-bottom">
                  <div className="border-t border-slate-200 w-36 pt-2">
                    Verification Seal<br />
                    6A Skillcity Audit Division
                  </div>
                </td>
                <td className="w-1/2 text-right text-xs font-bold text-blue-900">
                  <div className="mb-2 italic text-[10px] text-slate-400 font-normal">Digital Signature Verified</div>
                  <div className="border-t border-blue-900 inline-block pt-2 w-48 text-center ml-auto">
                    Director of Operations<br />
                    <span className="text-[10px] font-normal text-slate-400">6A Skillcity Network</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="border-t border-slate-100 mt-16 pt-4 text-center text-[9px] text-slate-400 font-sans">
            This is a digitally issued and verified certificate. For any verification, please query with Center Code on 6A Skillcity Portal.
          </div>
        </div>

      </div>

      {/* Styled `@media print` print styles to format perfectly on A4 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .fixed, .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:max-h-none {
            max-height: none !important;
          }
          .print\\:overflow-visible {
            overflow: visible !important;
          }
        }
      ` }} />
    </div>
  );
};

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const [stats, setStats] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedHalf, setSelectedHalf] = useState(
    new Date().getMonth() < 6 ? "H1" : "H2",
  );
  const [statsLoading, setStatsLoading] = useState(true);
  const [cashfree, setCashfree] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);

  // Offline Payment States
  const [paymentMethodTab, setPaymentMethodTab] = useState("online");
  const [offlinePaymentData, setOfflinePaymentData] = useState({
    method: "Offline / Cash",
    transactionId: "",
    remarks: "",
  });
  const [offlineReceipt, setOfflineReceipt] = useState(null);
  const [isOfflinePaying, setIsOfflinePaying] = useState(false);
  const [officeVideoFile, setOfficeVideoFile] = useState(null);
  const [officePhotosFiles, setOfficePhotosFiles] = useState([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Initialize Cashfree Payment Client
  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        const cf = await load({
          mode: import.meta.env.MODE === "production" ? "production" : "sandbox",
        });
        setCashfree(cf);
      } catch (err) {
        console.error("Failed to load Cashfree library:", err);
      }
    };
    initializeCashfree();
  }, []);

  // Fetch partner profile on load
  useEffect(() => {
    fetchPartnerProfile();
  }, []);

  // Handle return redirect from Cashfree
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const status = queryParams.get("onboarding_status");
    const orderId = queryParams.get("order_id");

    if (status === "fee_paid" && orderId) {
      verifyOnboardingPayment(orderId);
    }
  }, [window.location.search]);

  // Fetch stats if and only if onboarding is complete
  useEffect(() => {
    if (partnerProfile && partnerProfile.onboardingState === "completed") {
      fetchStats();
    }
  }, [partnerProfile, selectedYear, selectedHalf]);

  const fetchPartnerProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await getMyProfile();
      if (res.success) {
        setPartnerProfile(res.data.partner);
        dispatch(setUser({ ...res.data.partner, type: "partner" }));
      }
    } catch (error) {
      console.error("Failed to load partner profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await getPartnerDashboardStats(selectedYear, selectedHalf);
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch partner stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const verifyOnboardingPayment = async (orderId) => {
    setIsVerifying(true);
    try {
      const res = await verifyInspectionFeePayment(orderId);
      if (res.success) {
        // Clear query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        setPartnerProfile(res.data);
      }
    } catch (err) {
      console.error("Payment verification failed:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePayFee = async () => {
    if (!cashfree) {
      alert("Cashfree payment gateway is still loading. Please wait a moment.");
      return;
    }
    setIsPaying(true);
    try {
      const res = await createInspectionFeeOrder();
      if (res.success && res.payment_session_id) {
        const checkoutOptions = {
          paymentSessionId: res.payment_session_id,
          redirectTarget: "_self",
        };
        cashfree.checkout(checkoutOptions);
      }
    } catch (err) {
      console.error("Failed to initialize fee order:", err);
      alert(err.response?.data?.message || "Failed to initiate payment. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleOfflinePay = async (e) => {
    e.preventDefault();
    if (!offlinePaymentData.transactionId) {
      dispatch(showAlert({ type: "error", message: "Please specify the Transaction ID." }));
      return;
    }
    if (!offlineReceipt) {
      dispatch(showAlert({ type: "error", message: "Please attach a receipt for offline payment." }));
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
      
      // Allow partner to submit their own fee by not sending partnerId (uses token) or passing it explicitly
      const res = await recordOfflineInspectionFee(formData);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Offline payment receipt uploaded successfully!" }));
        setPartnerProfile(res.data);
      }
    } catch (err) {
      dispatch(showAlert({ type: "error", message: err.response?.data?.message || "Failed to submit offline payment." }));
    } finally {
      setIsOfflinePaying(false);
    }
  };

  const handleUploadMedia = async () => {
    if (!officeVideoFile || !officePhotosFiles || officePhotosFiles.length === 0) {
      dispatch(showAlert({ type: "error", message: "Please select both a video file and at least one office photo." }));
      return;
    }
    
    // Validate file size on client (max 200MB)
    if (officeVideoFile.size > 200 * 1024 * 1024) {
      dispatch(showAlert({ type: "error", message: "Video file is too large. Maximum allowed size is 200MB." }));
      return;
    }

    setIsUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append("video", officeVideoFile);
      if (officePhotosFiles && officePhotosFiles.length > 0) {
        Array.from(officePhotosFiles).forEach(file => {
          formData.append("photos", file);
        });
      }
      
      const res = await uploadInspectionMedia(formData);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Inspection media uploaded successfully!" }));
        setPartnerProfile(res.data);
        setOfficeVideoFile(null);
        setOfficePhotosFiles([]);
      }
    } catch (err) {
      dispatch(showAlert({ type: "error", message: err.response?.data?.message || "Failed to upload media." }));
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Render Full Screen Loading
  if (profileLoading) {
    return (
      <DashboardLayout title="Partner Portal">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Initializing Portal Session...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Gated Onboarding View
  if (partnerProfile && partnerProfile.onboardingState !== "completed") {
    const isFeePending = partnerProfile.onboardingState === "fee_pending";
    const isInspectionPending = partnerProfile.onboardingState === "inspection_pending";

    return (
      <DashboardLayout title="Partner Onboarding">
        <div className="max-w-[1000px] mx-auto py-10 px-4">
          {/* Header Banner */}
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-600 mb-2">
              <Building className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              Partner Activation Sequence
            </h2>
            <p className="text-muted-foreground font-medium max-w-md mx-auto text-sm sm:text-base">
              Welcome, {partnerProfile.centerName}! Complete these two onboarding steps to activate your Application Point dashboard.
            </p>
          </div>

          {/* Verification Spinner Overlay */}
          {isVerifying && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h3 className="font-bold text-lg">Verifying Inspection Fee Payment...</h3>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Querying Cashfree Network Nodes</p>
            </div>
          )}

          {/* Interactive Step Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Step 1 Card: Pay Fee */}
              <div className={cn(
                "p-8 rounded-[2rem] border transition-all shadow-sm relative overflow-hidden bg-card",
                isFeePending 
                  ? "border-primary/30 ring-1 ring-primary/10 shadow-lg shadow-primary/5" 
                  : "border-border opacity-75"
              )}>
                {/* Visual Ribbon */}
                {isFeePending && (
                  <div className="absolute top-0 right-0 p-4">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">
                      Active Action
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-5">
                  <div className={cn(
                    "p-3 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-sm",
                    isFeePending ? "bg-primary text-primary-foreground" : "bg-emerald-500/10 text-emerald-600"
                  )}>
                    {!isFeePending ? <CheckCircle className="w-5 h-5" /> : "01"}
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="text-lg font-black leading-tight flex items-center gap-2">
                        Pay Onboarding Inspection Fee
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium mt-1">
                        A mandatory one-time registration and audit fee of ₹5,000.
                      </p>
                    </div>

                    {isFeePending ? (
                      <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-muted-foreground font-medium">Standard Audit Fee:</span>
                          <span className="text-foreground">₹5,000.00</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold border-t border-border/50 pt-3">
                          <span className="text-muted-foreground font-medium">Total Amount Due:</span>
                          <span className="text-primary font-black text-lg">₹5,000.00</span>
                        </div>

                        {/* Tabs for Online vs Offline */}
                        <div className="flex bg-muted p-1 rounded-xl">
                          <button
                            onClick={() => setPaymentMethodTab("online")}
                            className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                              paymentMethodTab === "online"
                                ? "bg-white shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            Pay Online
                          </button>
                          <button
                            onClick={() => setPaymentMethodTab("offline")}
                            className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                              paymentMethodTab === "offline"
                                ? "bg-white shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            Upload Receipt
                          </button>
                        </div>

                        {paymentMethodTab === "online" ? (
                          <button
                            onClick={handlePayFee}
                            disabled={isPaying}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-75 disabled:cursor-not-allowed"
                          >
                            {isPaying ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Initializing Gateway...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4" />
                                <span>Proceed to Payment</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <form onSubmit={handleOfflinePay} className="space-y-4 pt-2">
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">Payment Method</label>
                                <select 
                                  value={offlinePaymentData.method}
                                  onChange={(e) => setOfflinePaymentData({...offlinePaymentData, method: e.target.value})}
                                  className="w-full px-4 py-3 bg-white border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                  <option>Offline / Cash</option>
                                  <option>Bank Transfer / NEFT</option>
                                  <option>UPI / QR</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">Transaction ID / Ref No</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. TXN12345678"
                                  value={offlinePaymentData.transactionId}
                                  onChange={(e) => setOfflinePaymentData({...offlinePaymentData, transactionId: e.target.value})}
                                  className="w-full px-4 py-3 bg-white border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">Payment Receipt</label>
                                <div className="relative border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-muted/50 transition-colors">
                                  <input 
                                    type="file" 
                                    accept="image/*,.pdf"
                                    onChange={(e) => setOfflineReceipt(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Upload className="w-6 h-6 text-muted-foreground" />
                                    <span className="text-xs font-bold text-muted-foreground">
                                      {offlineReceipt ? offlineReceipt.name : "Click or drag receipt here"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              type="submit"
                              disabled={isOfflinePaying}
                              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 disabled:opacity-75 disabled:cursor-not-allowed"
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
                          </form>
                        )}
                      </div>
                    ) : (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-center gap-3 text-emerald-600 text-xs font-bold">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Payment Completed Successfully! Session Registered.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2 Card: Online / Physical Inspection */}
              <div className={cn(
                "p-8 rounded-[2rem] border transition-all shadow-sm bg-card",
                isInspectionPending 
                  ? "border-blue-500/30 ring-1 ring-blue-500/10 shadow-lg shadow-blue-500/5" 
                  : "border-border opacity-60"
              )}>
                <div className="flex items-start gap-5">
                  <div className={cn(
                    "p-3 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-sm",
                    isInspectionPending ? "bg-blue-500 text-white animate-pulse" : "bg-muted text-muted-foreground"
                  )}>
                    "02"
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="text-lg font-black leading-tight">
                        Online / Physical Inspection Verification
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium mt-1">
                        Auditing center layout, infrastructure logs, and documentation verification.
                      </p>
                    </div>

                    {isInspectionPending ? (
                      <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 space-y-4">
                        {partnerProfile.inspectionStatus === "rejected" ? (
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Inspection Rejected</p>
                              <p className="text-xs font-medium text-red-500/80 leading-relaxed">
                                Your inspection media was rejected by our team.
                              </p>
                              <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 mt-2 text-sm text-red-700 font-medium">
                                <strong>Reason:</strong> {partnerProfile.inspectionRejectionReason || "Please upload clear video and photos."}
                              </div>
                            </div>
                          </div>
                        ) : partnerProfile.documents?.officeVideo?.length > 0 ? (
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Verification In Progress</p>
                              <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                Your fee and center media have been successfully submitted. Our auditing panel is currently reviewing your application. You will be notified of the outcome shortly.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Inspection In Progress</p>
                              <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                Our auditing panel has been notified of your fee completion. An administrator will contact you shortly at your corporate email <strong>{partnerProfile.licenseeEmail}</strong> or telephone <strong>{partnerProfile.licenseeContactNumber}</strong> to coordinate the digital or physical site inspection.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Media Upload Section */}
                        <div className="mt-6 border-t border-blue-500/10 pt-6">
                          <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Upload Center Media
                          </h4>
                          <p className="text-xs text-muted-foreground mb-4">
                            Please upload a brief video and clear photos showing your center's facilities. This helps expedite the physical inspection process. (Max video size: 200MB)
                          </p>
                          
                          {partnerProfile.documents?.officeVideo?.length > 0 && partnerProfile.inspectionStatus !== "rejected" ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-700">
                              <CheckCircle className="w-5 h-5 flex-shrink-0" />
                              <div className="text-sm font-bold">
                                Media Uploaded Successfully
                                <div className="text-xs font-medium opacity-80 mt-0.5">Your center media has been received by the audit team.</div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative border-2 border-dashed border-blue-500/20 rounded-xl p-6 text-center hover:bg-blue-500/5 transition-colors">
                                  <input 
                                    type="file" 
                                    accept="video/*"
                                    onChange={(e) => setOfficeVideoFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Video className="w-6 h-6 text-blue-500/50" />
                                    <span className="text-xs font-bold text-blue-900">
                                      {officeVideoFile ? officeVideoFile.name : "Select Center Video (Required)"}
                                    </span>
                                    {officeVideoFile && (
                                      <span className="text-[10px] text-muted-foreground">
                                        {(officeVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="relative border-2 border-dashed border-blue-500/20 rounded-xl p-6 text-center hover:bg-blue-500/5 transition-colors">
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => setOfficePhotosFiles(e.target.files)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <Image className="w-6 h-6 text-blue-500/50" />
                                    <span className="text-xs font-bold text-blue-900">
                                      {officePhotosFiles.length > 0 ? `${officePhotosFiles.length} Photo(s) Selected` : "Select Office Photos (Required)"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={handleUploadMedia}
                                disabled={!officeVideoFile || officePhotosFiles.length === 0 || isUploadingMedia}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isUploadingMedia ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Uploading Media...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4" />
                                    <span>Upload Media</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic font-medium">
                        Unlocks after completing Step 1.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Side: Step Summary & Help */}
            <div className="space-y-6">
              <div className="bg-card border border-border p-6 rounded-[2rem] space-y-6 shadow-sm">
                <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Sequence Summary</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                      isFeePending ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-600"
                    )}>
                      {!isFeePending ? <CheckCircle className="w-4 h-4" /> : "1"}
                    </div>
                    <span className={cn("text-xs font-bold", !isFeePending ? "text-emerald-600" : "text-foreground")}>Inspection Fee Payment</span>
                  </div>

                  <div className="h-4 w-0.5 bg-border ml-3.5" />

                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                      isInspectionPending ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground"
                    )}>
                      "2"
                    </div>
                    <span className={cn("text-xs font-bold", isInspectionPending ? "text-blue-600" : "text-muted-foreground")}>Site & Document Audit</span>
                  </div>

                  <div className="h-4 w-0.5 bg-border ml-3.5" />

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">
                      "3"
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">Dashboard Access & Letter</span>
                  </div>
                </div>

                <div className="border-t border-border pt-5 space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Need Assistance?</h5>
                  <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                    If you have questions about the onboarding sequence, inspection checklist, or payment receipt, please write to us at <strong>partner@6askillcity.com</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Normal Dashboard View (If completed)
  const summary = stats?.summary || {};
  const recentApplications = stats?.recentApplications || [];
  const recentStudents = stats?.recentStudents || [];
  const enrollmentData = stats?.enrollmentData || [];
  const revenueData = stats?.revenueChartData || [];

  // Calculate current month's progress
  const currentMonthLabel = (() => {
    const d = new Date();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear().toString().slice(-2);
    return `${month} ${year}`;
  })();

  const currentMonthData = enrollmentData.find(
    (item) => item.name === currentMonthLabel
  );

  const currentMonthEnrollment = currentMonthData
    ? currentMonthData.students
    : enrollmentData.length > 0
      ? enrollmentData[enrollmentData.length - 1].students
      : 0;
  const targetProgress = Math.min(
    (currentMonthEnrollment / PARTNER_MONTHLY_TARGET) * 100,
    100,
  );
  const isTargetMet = currentMonthEnrollment >= PARTNER_MONTHLY_TARGET;

  return (
    <DashboardLayout title="Partner Dashboard">
      <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
        


        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              Partner Overview
            </h2>
            <p className="text-muted-foreground font-medium">
              Real-time student recruitment and application tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard/student/add")}
              className="group relative flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <UserPlus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">New Application</span>
            </button>
            <button
              onClick={() =>
                navigate("/dashboard/tickets", {
                  state: { openNewTicket: true },
                })
              }
              className="group relative flex items-center gap-2 px-6 py-3 rounded-2xl bg-card border border-border text-foreground font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <MessageSquare className="w-4 h-4 text-rose-500 relative z-10" />
              <span className="relative z-10">New Ticket</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Applications"
            value={statsLoading ? "..." : summary.totalApplications || 0}
            icon={Briefcase}
            subtext="All submitted requests"
            color="blue"
            onClick={() => navigate("/dashboard/applications")}
          />
          <StatCard
            title="Total Enrolled"
            value={statsLoading ? "..." : summary.totalStudents || 0}
            icon={Users}
            subtext="Lifetime student count"
            color="purple"
            onClick={() => navigate("/dashboard/student-management")}
          />
          <StatCard
            title="Total Earnings"
            value={
              statsLoading
                ? "..."
                : `₹${summary.totalRevenue?.toLocaleString() || 0}`
            }
            icon={CreditCard}
            subtext="Commission & collections"
            color="emerald"
            onClick={() => navigate("/dashboard/payment-management")}
          />
          <StatCard
            title="Active Support"
            value={statsLoading ? "..." : summary.activeTickets || 0}
            icon={MessageSquare}
            subtext="Open help desk tickets"
            color="rose"
            onClick={() => navigate("/dashboard/tickets")}
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Area Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-4 sm:p-8 shadow-sm flex flex-col min-h-[400px]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-xl font-black">Revenue Performance</h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Monthly fee collection trends
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-muted transition-colors"
                >
                  {[0, 1, 2, 3].map((i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    );
                  })}
                </select>
                <select
                  value={selectedHalf}
                  onChange={(e) => setSelectedHalf(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-muted transition-colors"
                >
                  <option value="H1">Jan to June</option>
                  <option value="H2">July to Dec</option>
                </select>
              </div>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--primary)"
                        stopOpacity={0.1}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "1rem",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ fontWeight: 800, marginBottom: "0.25rem" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Enrollment Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-[2.5rem] p-4 sm:p-8 shadow-sm flex flex-col min-h-[400px]"
          >
            <div className="mb-8">
              <h3 className="text-xl font-black">Recruitment Activity</h3>
              <p className="text-sm text-muted-foreground font-medium">
                New eligible enrollments
              </p>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "var(--primary)", opacity: 0.05 }}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "1rem",
                    }}
                  />
                  <Bar dataKey="students" radius={[6, 6, 0, 0]} barSize={30}>
                    {enrollmentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill="var(--primary)"
                        fillOpacity={0.4 + index * 0.12}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                <span>Monthly Target ({PARTNER_MONTHLY_TARGET})</span>
                <span
                  className={isTargetMet ? "text-emerald-500" : "text-primary"}
                >
                  {currentMonthEnrollment} / {PARTNER_MONTHLY_TARGET} (
                  {Math.round(targetProgress)}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-1000",
                    isTargetMet ? "bg-emerald-500" : "bg-primary",
                  )}
                  style={{ width: `${targetProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Data Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden flex flex-col"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <span>Recent Applications</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Last 5 submissions
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/applications")}
                className="text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Program</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentApplications.map((app) => (
                    <tr
                      key={app._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{app.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {app.program?.category && (
                          <div className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                            {app.program.category}
                          </div>
                        )}
                        <div className="text-xs font-bold">
                          {app.program?.name || "N/A"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {app.university?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            app.applicationStatus === "Eligible"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : app.applicationStatus === "Rejected"
                                ? "bg-rose-500/10 text-rose-500"
                                : "bg-amber-500/10 text-amber-500",
                          )}
                        >
                          {app.applicationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentApplications.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-10 text-center text-muted-foreground text-sm font-medium"
                      >
                        No recent applications found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Enrolled Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden flex flex-col"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span>Enrolled Students</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Recently approved
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/student-management")}
                className="text-xs font-black uppercase tracking-widest text-purple-500 hover:text-purple-400 flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Program</th>
                    <th className="px-6 py-4">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentStudents.map((stu) => (
                    <tr
                      key={stu._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs">
                            {stu.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{stu.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {stu.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          {stu.program?.category && (
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                              {stu.program.category}
                            </div>
                          )}
                          <div className="text-xs font-bold text-foreground">
                            {stu.program?.name || "N/A"}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {stu.university?.name || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            stu.paymentStatus === "Paid"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : stu.paymentStatus === "Partially Paid"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-rose-500/10 text-rose-500",
                          )}
                        >
                          {stu.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentStudents.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-10 text-center text-muted-foreground text-sm font-medium"
                      >
                        No enrolled students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Authorisation Certificate printable view */}
      <AnimatePresence>
        {showLetterModal && (
          <AuthorisationLetterModal
            partner={partnerProfile}
            onClose={() => setShowLetterModal(false)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
