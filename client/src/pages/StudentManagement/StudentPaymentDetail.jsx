import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import {
  CreditCard,
  Calendar,
  History,
  Plus,
  ArrowLeft,
  BadgeDollarSign,
  Receipt,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Hash,
  Wallet,
  Activity,
  ChevronRight,
  Printer,
  Trash2,
  X,
  User,
  BookOpen,
  School,
  FileDigit,
  Phone,
  Mail,
  MapPin,
  Baby,
  Building2,
  GraduationCap,
  Briefcase,
  MessageSquare,
  Lock,
  ShieldAlert,
  FileText,
  HelpCircle,
  MinusCircle,
  Hourglass,
  ArrowUpDown,
  Layers,
  Globe,
  Stamp,
  Plane,
  ShieldCheck,
  Upload,
  ClipboardCheck,
  Package,
  Users,
  Truck,
  Settings,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import DocViewerModal from "../../components/common/DocViewerModal";
import InvoiceModal from "../../components/payment/InvoiceModal";
import { cn } from "../../components/dashboard/StatCard";
import { getStudentById } from "../../api/student.api";
import { load } from "@cashfreepayments/cashfree-js";
import {
  recordPayment,
  getStudentPayments,
  setPaymentSchedule,
  getStudentSchedules,
  deletePaymentSchedule,
  createCashfreeOrder,
  verifyCashfreePayment,
} from "../../api/payment.api";
import {
  getFollowups,
  addFollowup,
  deleteFollowup,
  updateStudentStatus,
} from "../../api/student.api";
import {
  getServiceApplications,
  getServiceDefinitions,
  applyForService,
  updateApplicationStatus,
  recordServicePayment,
  createServiceCashfreeOrder,
  verifyServiceCashfreePayment,
  createBulkServiceCashfreeOrder,
  recordBulkServicePayment
} from "../../api/documentsServices.api";
import { showAlert } from "../../redux/alertSlice";
import { getTickets } from "../../api/ticket.api";
import TicketChat from "../Tickets/TicketChat";

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

const getFileUrl = (path) => {
  if (!path) return "";
  const normalizedPath = path.replace(/\\/g, "/");
  if (normalizedPath.startsWith("http")) return normalizedPath;
  const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  if (normalizedPath.startsWith("uploads/"))
    return `${baseUrl}/${normalizedPath}`;
  return `${baseUrl}/uploads/${normalizedPath}`;
};

const handleDownload = async (url, label, studentName) => {
  try {
    const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
    const proxyUrl = `${baseUrl}/api/students/download-proxy?url=${encodeURIComponent(url)}`;
    const link = document.createElement("a");
    link.href = proxyUrl;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Download failed:", error);
    window.open(url, "_blank");
  }
};

export default function StudentPaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([
    { dueDate: "", amount: "", description: "" },
  ]);
  const [cashfree, setCashfree] = useState(null);
  const [paymentMethodTab, setPaymentMethodTab] = useState("online");
  const [offlinePaymentMethod, setOfflinePaymentMethod] =
    useState("Offline / Cash");
  const [offlineTransactionId, setOfflineTransactionId] = useState("");

  // Follow-up state
  const [followups, setFollowups] = useState([]);
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [newFollowup, setNewFollowup] = useState({
    note: "",
    status: "",
    enrollmentNumber: "",
    nextFollowupDate: "",
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);

  const { user } = useSelector((state) => state.user);
  const isPartner = user?.role === "partner" || user?.type === "partner";
  const isManager = user?.role === "manager";
  const isAdmin = user?.role === "admin" || user?.type === "admin";

  const [activeTab, setActiveTab] = useState(
    user?.role === "manager" ? "profile" : "payment",
  );

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [activePaymentSubTab, setActivePaymentSubTab] = useState("schedule");

  // Services & Documents states
  const [serviceApplications, setServiceApplications] = useState([]);
  const [serviceDefinitions, setServiceDefinitions] = useState([]);
  const [remarksSelections, setRemarksSelections] = useState({});
  const [bulkApplying, setBulkApplying] = useState(false);
  const [newServiceData, setNewServiceData] = useState({
    serviceId: "",
    adminRemarks: ""
  });
  const [isServiceApplying, setIsServiceApplying] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(null); // application object for document services
  const [selectedCartItems, setSelectedCartItems] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartPaymentMethodTab, setCartPaymentMethodTab] = useState("online");
  const [cartPaymentData, setCartPaymentData] = useState({
    method: "Offline / Cash",
    transactionId: "",
    remarks: ""
  });
  const [cartReceipt, setCartReceipt] = useState(null);
  const [isCartProcessing, setIsCartProcessing] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [showBulkPayModal, setShowBulkPayModal] = useState(false);

  const handleToggleCartItem = (def) => {
    const isSelected = selectedCartItems.some((item) => item._id === def._id);
    if (isSelected) {
      setSelectedCartItems(selectedCartItems.filter((item) => item._id !== def._id));
    } else {
      if (selectedCartItems.length > 0) {
        const getCats = (item) => {
          if (item.categories && item.categories.length > 0) return item.categories;
          if (item.category) return [item.category];
          return ["General Services"];
        };
        const firstItemCats = getCats(selectedCartItems[0]);
        const newItemCats = getCats(def);
        const isCompatible = firstItemCats.some((cat) => newItemCats.includes(cat));

        if (!isCompatible) {
          dispatch(
            showAlert({
              type: "error",
              message: "Cannot select items from different categories. All items in the cart must belong to the same category.",
            })
          );
          return;
        }
      }
      setSelectedCartItems([...selectedCartItems, def]);
    }
  };

  const handleBulkApplyOnly = async () => {
    const unappliedItems = selectedCartItems.filter(
      (def) => !serviceApplications.some((app) => app.service?._id === def._id)
    );
    if (unappliedItems.length === 0) {
      dispatch(showAlert({ type: "info", message: "All selected documents are already applied!" }));
      return;
    }

    setIsCartProcessing(true);
    try {
      for (const def of unappliedItems) {
        await applyForService({
          studentId: id,
          serviceId: def._id,
          adminRemarks: "Applied via bulk checkout",
        });
      }
      dispatch(
        showAlert({
          type: "success",
          message: `Successfully applied for ${unappliedItems.length} documents!`,
        })
      );
      setSelectedCartItems([]);
      const servicesRes = await getServiceApplications({ studentId: id });
      if (servicesRes.success) setServiceApplications(servicesRes.data);
    } catch (error) {
      dispatch(showAlert({ type: "error", message: "Failed to apply for some documents." }));
    } finally {
      setIsCartProcessing(false);
    }
  };

  const handleCartPayOnline = async (e) => {
    e.preventDefault();
    if (selectedCartItems.length === 0) return;
    
    setIsCartProcessing(true);
    try {
      // 1. Apply unapplied items
      const unapplied = selectedCartItems.filter(
        def => !serviceApplications.some(app => app.service?._id === def._id)
      );
      for (const def of unapplied) {
        await applyForService({
          studentId: id,
          serviceId: def._id,
          adminRemarks: cartPaymentData.remarks || "Applied via cart checkout",
        });
      }
      
      let updatedApps = serviceApplications;
      if (unapplied.length > 0) {
        const refreshRes = await getServiceApplications({ studentId: id });
        if (!refreshRes.success) throw new Error("Failed to sync application records.");
        setServiceApplications(refreshRes.data);
        updatedApps = refreshRes.data;
      }
      
      // 2. Get application IDs
      const applicationIds = selectedCartItems.map(def => {
        const matchApp = updatedApps.find(a => a.service?._id === def._id);
        if (!matchApp) throw new Error(`Application for ${def.title} not found.`);
        return matchApp._id;
      });

      // 3. Initiate Cashfree Order
      const res = await createBulkServiceCashfreeOrder({
        applicationIds,
        remarks: cartPaymentData.remarks,
      });
      if (res.success && cashfree) {
        const checkoutOptions = {
          paymentSessionId: res.payment_session_id,
          redirectTarget: "_self",
        };
        cashfree.checkout(checkoutOptions);
      }
    } catch (err) {
      dispatch(showAlert({ type: "error", message: err.response?.data?.message || err.message || "Failed to initiate online payment" }));
    } finally {
      setIsCartProcessing(false);
    }
  };

  useEffect(() => {
    fetchData();
    initializeCashfree();
    checkPaymentStatus();
  }, [id]);

  const initializeCashfree = async () => {
    const cf = await load({
      mode: import.meta.env.MODE === "production" ? "production" : "sandbox",
    });
    setCashfree(cf);
  };

  const checkPaymentStatus = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("order_id");
    const status = urlParams.get("payment_status");

    if (orderId && status) {
      try {
        const res = await verifyCashfreePayment(id, orderId);
        if (res.success) {
          dispatch(
            showAlert({
              type: "success",
              message: "Payment verified successfully!",
            }),
          );
          fetchData();
        } else {
          dispatch(
            showAlert({
              type: "error",
              message: "Payment verification failed",
            }),
          );
        }
      } catch (error) {
        dispatch(
          showAlert({ type: "error", message: "Failed to verify payment" }),
        );
      }
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, paymentsRes, schedulesRes, followupsRes, servicesRes, definitionsRes] =
        await Promise.all([
          getStudentById(id),
          getStudentPayments(id),
          getStudentSchedules(id),
          getFollowups(id),
          getServiceApplications({ studentId: id }),
          getServiceDefinitions(),
        ]);

      if (studentRes.success) setStudent(studentRes.data);
      if (paymentsRes.success) setPayments(paymentsRes.data);
      if (schedulesRes.success) setSchedules(schedulesRes.data);
      if (followupsRes.success) setFollowups(followupsRes.data);
      if (servicesRes.success) setServiceApplications(servicesRes.data);
      if (definitionsRes.success) setServiceDefinitions(definitionsRes.data);
      fetchStudentTickets();
    } catch (error) {
      dispatch(showAlert({ type: "error", message: "Failed to load details" }));
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowups = async () => {
    setIsFollowupLoading(true);
    try {
      const res = await getFollowups(id);
      if (res.success) setFollowups(res.data);
    } catch (error) {
      console.error("Failed to fetch followups", error);
    } finally {
      setIsFollowupLoading(false);
    }
  };

  const fetchStudentTickets = async () => {
    setIsTicketsLoading(true);
    try {
      const res = await getTickets({ studentId: id, limit: 100 });
      if (res.success) setTickets(res.data);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setIsTicketsLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) return;

    if (!offlinePaymentMethod) {
      dispatch(
        showAlert({
          type: "error",
          message: "Please specify the payment method.",
        }),
      );
      return;
    }

    if (!offlineTransactionId) {
      dispatch(
        showAlert({
          type: "error",
          message: "Please specify the Transaction ID.",
        }),
      );
      return;
    }

    if (!paymentReceipt) {
      dispatch(
        showAlert({
          type: "error",
          message: "Please attach a receipt for offline payment.",
        }),
      );
      return;
    }

    const totalFee = student?.programFee?.totalFee || 0;
    const remaining = totalFee - (student.totalFeePaid || 0);

    if (Number(paymentAmount) > remaining) {
      dispatch(
        showAlert({
          type: "error",
          message: `Amount exceeds remaining fee (₹${remaining.toLocaleString()})`,
        }),
      );
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("amount", paymentAmount);
      formData.append("remarks", paymentRemarks);
      formData.append("method", offlinePaymentMethod);
      formData.append("transactionId", offlineTransactionId);
      if (paymentReceipt) {
        formData.append("receipt", paymentReceipt);
      }

      const res = await recordPayment(id, formData);
      if (res.success) {
        dispatch(
          showAlert({
            type: "success",
            message: "Payment submitted for verification!",
          }),
        );
        // Refresh all data to sync totals
        await fetchData();
        setShowPayModal(false);
        setPaymentAmount("");
        setPaymentRemarks("");
        setPaymentReceipt(null);
        setOfflinePaymentMethod("Offline / Cash");
        setOfflineTransactionId("");
      }
    } catch (error) {
      dispatch(
        showAlert({
          type: "error",
          message: error.response?.data?.message || "Payment submission failed",
        }),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayOnline = async (e) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) return;

    const totalFee = student?.programFee?.totalFee || 0;
    const remaining = totalFee - (student.totalFeePaid || 0);

    if (Number(paymentAmount) > remaining) {
      dispatch(
        showAlert({ type: "error", message: `Amount exceeds remaining fee` }),
      );
      return;
    }

    setIsProcessing(true);
    try {
      const res = await createCashfreeOrder(id, {
        amount: paymentAmount,
        remarks: paymentRemarks,
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
          message:
            error.response?.data?.message ||
            "Failed to initiate online payment",
        }),
      );
      setIsProcessing(false);
    }
  };

  const handleAddScheduleRow = () => {
    setScheduleItems([
      ...scheduleItems,
      { dueDate: "", amount: "", description: "" },
    ]);
  };

  const handleRemoveScheduleRow = (idx) => {
    setScheduleItems(scheduleItems.filter((_, i) => i !== idx));
  };

  const handleUpdateSchedule = async () => {
    try {
      const res = await setPaymentSchedule(id, scheduleItems);
      if (res.success) {
        dispatch(
          showAlert({
            type: "success",
            message: "Schedule updated successfully",
          }),
        );
        await fetchData();
        setShowScheduleModal(false);
      }
    } catch (error) {
      dispatch(
        showAlert({ type: "error", message: "Failed to update schedule" }),
      );
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;
    try {
      const res = await deletePaymentSchedule(scheduleId);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Schedule deleted" }));
        setSchedules(schedules.filter((s) => s._id !== scheduleId));
      }
    } catch (error) {
      dispatch(
        showAlert({ type: "error", message: "Failed to delete schedule" }),
      );
    }
  };

  const handleStatusUpdate = async (newStatus, enrollmentNumber = "") => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateStudentStatus(id, newStatus, enrollmentNumber);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: res.message }));
        setStudent({
          ...student,
          status: newStatus,
          enrollmentNumber: enrollmentNumber || student.enrollmentNumber,
        });
      }
    } catch (error) {
      dispatch(
        showAlert({ type: "error", message: "Failed to update status" }),
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddFollowup = async (e) => {
    e.preventDefault();
    if (!newFollowup.note.trim()) return;

    setIsFollowupLoading(true);
    try {
      // 1. Update status if changed in the form
      if (newFollowup.status && newFollowup.status !== student.status) {
        await updateStudentStatus(
          id,
          newFollowup.status,
          newFollowup.enrollmentNumber,
        );
      }

      // 2. Save followup with category 'eligibility'
      const res = await addFollowup(
        id,
        newFollowup.note,
        "eligibility", // Forced category as per request
        null, // Removed nextFollowupDate
        newFollowup.status || student.status, // Pass current or new status
      );

      if (res.success) {
        dispatch(
          showAlert({
            type: "success",
            message: "Interaction logged and status updated",
          }),
        );
        setNewFollowup({ note: "", status: "", enrollmentNumber: "" });
        await Promise.all([fetchData(), fetchFollowups()]);
      }
    } catch (error) {
      dispatch(
        showAlert({
          type: "error",
          message: error.response?.data?.message || "Failed to log interaction",
        }),
      );
    } finally {
      setIsFollowupLoading(false);
    }
  };

  const handleDeleteFollowup = async (followupId) => {
    if (!window.confirm("Delete this follow-up?")) return;
    try {
      const res = await deleteFollowup(followupId);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: res.message }));
        await fetchFollowups();
      }
    } catch (error) {
      dispatch(
        showAlert({ type: "error", message: "Failed to delete follow-up" }),
      );
    }
  };

  if (loading || !student)
    return (
      <DashboardLayout title="Student Profile">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );

  const totalFee = student?.programFee?.totalFee || 0;
  const remaining = totalFee - (student.totalFeePaid || 0);

  const tabs = [
    { id: "payment", label: "Payment Overview", icon: CreditCard },
    { id: "profile", label: "Student Profile", icon: User },
    { id: "documents", label: "Documents", icon: FileDigit },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "tickets", label: "Tickets", icon: MessageSquare },
    { id: "followup", label: "Status", icon: History },
  ].filter((tab) => {
    if (isManager) {
      return tab.id !== "payment";
    }
    if (isPartner) {
      return tab.id !== "followup";
    }
    return true;
  });

  const mandatoryDefs = serviceDefinitions.filter(def => def.documentType === "Mandatory");

  return (
    <DashboardLayout title="Student Profile">
      <div className="max-w-7xl mx-auto pb-20">
        {/* Profile Header */}
        <div className="relative mb-12">
          <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-[3rem] border border-border/50 relative overflow-hidden">
            <div className="absolute top-8 left-8">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group bg-card/80 backdrop-blur-md px-4 py-2 rounded-xl border border-border shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
            </div>
          </div>

          <div className="relative px-6 md:px-12 -mt-16 flex flex-col md:flex-row md:items-end gap-6">
            <div className="p-1.5 bg-card rounded-[2.5rem] border border-border shadow-2xl w-fit">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary text-3xl md:text-5xl font-black">
                {student.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight">
                  {student.name}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${student.paymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}
                  >
                    {student.paymentStatus}
                  </span>

                  {/* Lifecycle Status - Read Only here, update via Followup */}
                  <div
                    className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2 ${
                      student.status === "Enrolled"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : student.status === "Cancelled"
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}
                  >
                    <Activity className="w-3 h-3" />
                    {student.status || "On Progress"}
                  </div>

                  {!isPartner && !isAdmin && !isManager && (
                    <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground border border-border">
                      Read-Only Mode
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm font-bold text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  {student.university?.name}
                </span>
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  {student.program?.name}
                </span>
                {(isAdmin || isManager) && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {student.registeredBy?.centerName || "Head Office"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pb-2">
              {!isPartner && !isManager && (
                <span className="px-4 py-3 rounded-2xl bg-muted text-muted-foreground border border-border font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  View Only
                </span>
              )}

              {isPartner && (
                <button
                  onClick={() => setShowPayModal(true)}
                  disabled={totalFee > 0 && remaining <= 0}
                  className="px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
                >
                  <CreditCard className="w-5 h-5" />
                  Make Payment
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-20 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 p-1.5 bg-card border border-border rounded-[2rem] shadow-sm w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {activeTab === "payment" && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Financial Stats */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
                      <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8">
                        Financial Overview
                      </h3>

                      <div className="space-y-4 flex-1">
                        <div className="p-6 rounded-3xl bg-muted/30 border border-border flex justify-between items-center group hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                              <BadgeDollarSign className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                Total Fee
                              </p>
                              <p className="text-xl font-black">
                                ₹{totalFee?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                              <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-60">
                                Paid Amount
                              </p>
                              <p className="text-xl font-black text-emerald-600">
                                ₹{(student.totalFeePaid || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                              <Activity className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-60">
                                Remaining
                              </p>
                              <p className="text-xl font-black text-blue-600">
                                ₹{remaining.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-border">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Completion
                          </span>
                          <span className="text-lg font-black text-primary">
                            {Math.round(
                              ((student.totalFeePaid || 0) / (totalFee || 1)) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.round(((student.totalFeePaid || 0) / (totalFee || 1)) * 100)}%`,
                            }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Schedule */}
                  <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm h-full flex flex-col">
                      <div className="p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-muted/10">
                        <div className="flex items-center gap-2 p-1 bg-background border border-border rounded-2xl w-fit">
                          <button
                            onClick={() => setActivePaymentSubTab("schedule")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              activePaymentSubTab === "schedule"
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            Schedule
                          </button>
                          <button
                            onClick={() => setActivePaymentSubTab("history")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              activePaymentSubTab === "history"
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            History
                          </button>
                        </div>
                        {isPartner && activePaymentSubTab === "schedule" && (
                          <button
                            disabled={remaining <= 0 || student.paymentStatus === "Paid"}
                            onClick={() => setShowScheduleModal(true)}
                            className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border ${
                              remaining <= 0 || student.paymentStatus === "Paid"
                                ? "text-muted-foreground border-border opacity-50 cursor-not-allowed"
                                : "text-primary hover:bg-primary/10 border-primary/20"
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            Modify Plan
                          </button>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {activePaymentSubTab === "schedule" ? (
                          <div className="p-8">
                            {schedules.length === 0 ? (
                              <div className="py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                                  <Clock className="w-10 h-10 text-muted-foreground opacity-20" />
                                </div>
                                <p className="text-sm font-bold text-muted-foreground">
                                  No upcoming payment milestones.
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {schedules.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col p-6 bg-muted/30 rounded-[2rem] border border-border/50 group hover:border-primary/30 transition-all relative overflow-hidden"
                                  >
                                    <div className="flex justify-between items-start mb-6">
                                      <div
                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.status === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}
                                      >
                                        {item.status}
                                      </div>
                                      {isPartner &&
                                        item.status === "Pending" && (
                                          <button
                                            onClick={() =>
                                              handleDeleteSchedule(item._id)
                                            }
                                            className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        )}
                                    </div>
                                    <h4 className="text-lg font-black mb-1">
                                      {item.description}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-6">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {new Date(
                                        item.dueDate,
                                      ).toLocaleDateString("en-IN", {
                                        dateStyle: "medium",
                                      })}
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-border/50">
                                      <p className="text-2xl font-black text-foreground">
                                        ₹{item.amount.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-0">
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead className="bg-muted/30">
                                  <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                      Timestamp
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">
                                      Status
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                      Method
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                                      Amount
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                                      Invoice
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                  {payments.map((payment, idx) => (
                                    <tr
                                      key={idx}
                                      className="group hover:bg-muted/20 transition-all"
                                    >
                                      <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                          <span className="text-sm font-black">
                                            {new Date(
                                              payment.date,
                                            ).toLocaleDateString("en-IN", {
                                              dateStyle: "medium",
                                            })}
                                          </span>
                                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                            {new Date(
                                              payment.date,
                                            ).toLocaleTimeString()}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-8 py-6 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                          <span
                                            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                              payment.approvalStatus ===
                                              "approved"
                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                : payment.approvalStatus ===
                                                    "rejected"
                                                  ? "bg-red-500/10 text-red-600 border-red-500/20"
                                                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                            }`}
                                          >
                                            {payment.approvalStatus ||
                                              "pending"}
                                          </span>
                                          {payment.receipt && (
                                            <button
                                              onClick={() =>
                                                setViewingDoc({
                                                  url: getFileUrl(
                                                    payment.receipt,
                                                  ),
                                                  title: "Payment Receipt",
                                                })
                                              }
                                              className="flex items-center gap-1 text-[8px] font-black text-primary hover:underline uppercase tracking-widest"
                                            >
                                              <Eye className="w-3 h-3" /> View
                                              Receipt
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-8 py-6">
                                        <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1.5 rounded-xl uppercase tracking-widest border border-primary/10">
                                          {payment.method}
                                        </span>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                        <p className="text-lg font-black text-foreground">
                                          ₹{payment.amount.toLocaleString()}
                                        </p>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                        <button
                                          disabled={
                                            payment.approvalStatus !==
                                            "approved"
                                          }
                                          className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-2xl transition-all border border-blue-600/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-blue-600"
                                          onClick={() => {
                                            setSelectedInvoice(payment);
                                            setShowInvoiceModal(true);
                                          }}
                                        >
                                          <Receipt className="w-4 h-4" />
                                          Invoice
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4 p-4 bg-muted/5">
                              {payments.map((payment, idx) => (
                                <div
                                  key={idx}
                                  className="bg-card border border-border rounded-3xl p-5 space-y-4 shadow-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        {new Date(
                                          payment.date,
                                        ).toLocaleDateString("en-IN", {
                                          dateStyle: "medium",
                                        })}
                                      </span>
                                      <span className="text-xs font-black">
                                        {new Date(
                                          payment.date,
                                        ).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <p className="text-lg font-black text-primary">
                                      ₹{payment.amount.toLocaleString()}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                        Payment Method
                                      </span>
                                      <span className="text-[10px] font-black uppercase">
                                        {payment.method}
                                      </span>
                                    </div>
                                    <button
                                      className="flex items-center gap-2 text-[10px] font-black uppercase bg-primary/10 text-primary px-4 py-2 rounded-xl transition-all border border-primary/5"
                                      onClick={() => {
                                        setSelectedInvoice(payment);
                                        setShowInvoiceModal(true);
                                      }}
                                    >
                                      <Receipt className="w-3.5 h-3.5" />
                                      Invoice
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {payments.length === 0 && (
                              <div className="px-8 py-32 text-center">
                                <div className="opacity-10 mb-4">
                                  <History className="w-16 h-16 mx-auto" />
                                </div>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                  No financial history yet.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Personal & Contact */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <User className="w-5 h-5" />
                      </div>
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          Full Name
                        </p>
                        <p className="text-base font-bold">{student.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          Date of Birth
                        </p>
                        <p className="text-base font-bold flex items-center gap-2">
                          <Baby className="w-4 h-4 text-primary" />
                          {student.dob
                            ? new Date(student.dob).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          Gender
                        </p>
                        <p className="text-base font-bold">
                          {student.gender || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          Email Address
                        </p>
                        <p className="text-base font-bold flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          {student.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          Primary Phone
                        </p>
                        <p className="text-base font-bold flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          {student.phone}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                          Alternative Phone
                        </p>
                        <p className="text-base font-bold">
                          {student.alternativePhone || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-border">
                      <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">
                        Address & Location
                      </h3>
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                          <MapPin className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-base font-medium leading-relaxed">
                          {student.address || "No address provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      Academic History
                    </h3>
                    <div className="space-y-6">
                      {/* 10th */}
                      <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-black text-base">
                            SSLC / 10th Standard
                          </h4>
                          <p className="text-xs font-bold text-muted-foreground uppercase">
                            {student.tenth?.board || "N/A"}
                          </p>
                        </div>
                        <div className="flex gap-8">
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Year
                            </p>
                            <p className="font-bold">
                              {student.tenth?.completionYear || "N/A"}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Percentage
                            </p>
                            <p className="font-bold text-primary">
                              {student.tenth?.percentage}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 12th */}
                      <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-black text-base">
                            Plus Two / 12th Standard
                          </h4>
                          <p className="text-xs font-bold text-muted-foreground uppercase">
                            {student.plusTwo?.board || "N/A"}
                          </p>
                        </div>
                        <div className="flex gap-8">
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Year
                            </p>
                            <p className="font-bold">
                              {student.plusTwo?.completionYear || "N/A"}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Percentage
                            </p>
                            <p className="font-bold text-primary">
                              {student.plusTwo?.percentage}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bachelors if any */}
                      {student.bachelors?.university && (
                        <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-base">
                              Bachelor's Degree
                            </h4>
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                              Higher Ed
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">
                                University
                              </p>
                              <p className="text-sm font-bold">
                                {student.bachelors.university}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">
                                Course / Branch
                              </p>
                              <p className="text-sm font-bold">
                                {student.bachelors.course}
                                {student.bachelors.branch &&
                                  ` (${student.bachelors.branch})`}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">
                                Year
                              </p>
                              <p className="text-sm font-bold">
                                {student.bachelors.completionYear || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Masters if any */}
                      {student.masters?.university && (
                        <div className="p-6 bg-muted/30 rounded-3xl border border-border/50 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-black text-base">
                              Master's Degree
                            </h4>
                            <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                              Higher Ed
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">
                                University
                              </p>
                              <p className="text-sm font-bold">
                                {student.masters.university}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">
                                Course / Branch
                              </p>
                              <p className="text-sm font-bold">
                                {student.masters.course}
                                {student.masters.branch &&
                                  ` (${student.masters.branch})`}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-muted-foreground">
                                Year
                              </p>
                              <p className="text-sm font-bold">
                                {student.masters.completionYear || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Family Details */}
                <div className="lg:col-span-1">
                  <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                      Guardian Details
                    </h3>

                    <div className="space-y-8">
                      <div className="relative pl-8 border-l-2 border-primary/20">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-card" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Father's Name
                        </p>
                        <p className="text-base font-black">
                          {student.fatherName}
                        </p>
                        <p className="text-sm font-bold text-muted-foreground mt-1">
                          {student.fatherPhone}
                        </p>
                      </div>

                      <div className="relative pl-8 border-l-2 border-primary/20">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-card" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Mother's Name
                        </p>
                        <p className="text-base font-black">
                          {student.motherName}
                        </p>
                        <p className="text-sm font-bold text-muted-foreground mt-1">
                          {student.motherPhone}
                        </p>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-border">
                      <div className="p-6 bg-muted/30 rounded-3xl border border-border/50">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                          Employment Status
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-black">
                            {student.employmentStatus || "Not Specified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                    <FileDigit className="w-5 h-5" />
                  </div>
                  Uploaded Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: "Identity Proof", doc: student.idProof },
                    {
                      label: "10th Certificate",
                      doc: student.tenth?.certificate,
                    },
                    {
                      label: "Plus Two Certificate",
                      doc: student.plusTwo?.certificate,
                    },
                    { label: "Affidavit", doc: student.affidavit },
                    {
                      label: "Migration Certificate",
                      doc: student.migrationCertificate,
                    },
                    {
                      label: "Project Submission",
                      doc: student.projectSubmission,
                    },
                  ].map((item, idx) => {
                    const docPath = item.doc?.path;
                    return (
                      <div
                        key={idx}
                        className="bg-muted/30 border border-border rounded-3xl p-6 flex flex-col gap-4 group hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground truncate max-w-[150px]">
                            {item.label}
                          </p>
                          {docPath ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setViewingDoc({
                                    url: getFileUrl(docPath),
                                    title: item.label,
                                  })
                                }
                                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDownload(
                                    getFileUrl(docPath),
                                    item.label,
                                    student.name,
                                  )
                                }
                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[8px] font-black bg-rose-500/10 text-rose-600 px-2 py-1 rounded-lg">
                              Missing
                            </span>
                          )}
                        </div>
                        <div className="aspect-[4/3] rounded-2xl bg-card border border-border/50 overflow-hidden flex items-center justify-center relative group-hover:shadow-lg transition-all">
                          {docPath ? (
                            /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(docPath) ? (
                              <img
                                src={getFileUrl(docPath)}
                                alt={item.label}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                                <FileDigit className="w-10 h-10" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  PDF Document
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground/20">
                              <AlertCircle className="w-10 h-10" />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                Not Uploaded
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Higher Ed Certificates */}
                {((student.bachelors?.certificates &&
                  student.bachelors.certificates.length > 0) ||
                  (student.masters?.certificates &&
                    student.masters.certificates.length > 0)) && (
                  <div className="mt-12 pt-12 border-t border-border space-y-8">
                    {student.bachelors?.certificates?.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Bachelors Certificates
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {student.bachelors.certificates.map((cert, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-muted/20 border border-border rounded-2xl flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <FileDigit className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-bold">
                                  Cert {idx + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setViewingDoc({
                                      url: getFileUrl(cert.path),
                                      title: `Bachelor Certificate ${idx + 1}`,
                                    })
                                  }
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-all"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDownload(
                                      getFileUrl(cert.path),
                                      `Bachelor Certificate ${idx + 1}`,
                                      student.name,
                                    )
                                  }
                                  className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-all"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {student.masters?.certificates?.length > 0 && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Masters Certificates
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {student.masters.certificates.map((cert, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-muted/20 border border-border rounded-2xl flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <FileDigit className="w-4 h-4 text-rose-500" />
                                <span className="text-[10px] font-bold">
                                  Cert {idx + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setViewingDoc({
                                      url: getFileUrl(cert.path),
                                      title: `Master Certificate ${idx + 1}`,
                                    })
                                  }
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-all"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDownload(
                                      getFileUrl(cert.path),
                                      `Master Certificate ${idx + 1}`,
                                      student.name,
                                    )
                                  }
                                  className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-all"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "services" && (() => {
              const getCatsForDef = (def, defaultVal) => {
                if (def.categories && def.categories.length > 0) return def.categories;
                if (def.category) return [def.category];
                return [defaultVal];
              };

              const mandatoryDefs = serviceDefinitions.filter(def => def.documentType === "Mandatory");
              const optionalDefs = serviceDefinitions.filter(def => {
                if (def.documentType === "Optional") return true;
                const cats = getCatsForDef(def, "Academic Documents");
                return cats.some(c => c !== "Academic Documents");
              });

              const getAppForDef = (defId) => {
                return serviceApplications.find(app => app.service?._id === defId);
              };

              const outstandingMandatory = mandatoryDefs.filter(def => !serviceApplications.some(app => app.service?._id === def._id));
              const isMandatoryAppliedAll = outstandingMandatory.length === 0;

              const groupMandatory = mandatoryDefs.reduce((acc, def) => {
                const cats = getCatsForDef(def, "Academic Documents").filter(c => c === "Academic Documents");
                for (const cat of cats) {
                  if (!acc[cat]) acc[cat] = [];
                  if (!acc[cat].some(d => d._id === def._id)) {
                    acc[cat].push(def);
                  }
                }
                return acc;
              }, {});

              const groupOptional = optionalDefs.reduce((acc, def) => {
                const cats = getCatsForDef(def, "General Services");
                for (const cat of cats) {
                  if (cat === "Academic Documents") continue;
                  if (!acc[cat]) acc[cat] = [];
                  if (!acc[cat].some(d => d._id === def._id)) {
                    acc[cat].push(def);
                  }
                }
                return acc;
              }, {});

              const handleApplySingle = async (defId) => {
                const def = serviceDefinitions.find(s => s._id === defId);
                if (!def) return;
                const remark = remarksSelections[defId] || "";
                setIsServiceApplying(true);
                try {
                  const res = await applyForService({
                    studentId: id,
                    serviceId: defId,
                    adminRemarks: remark,
                  });
                  if (res.success) {
                    dispatch(showAlert({ type: "success", message: `Successfully initiated application for ${def.title}` }));
                    const servicesRes = await getServiceApplications({ studentId: id });
                    if (servicesRes.success) setServiceApplications(servicesRes.data);
                  }
                } catch (error) {
                  dispatch(showAlert({ type: "error", message: error.response?.data?.message || "Failed to initiate application" }));
                } finally {
                  setIsServiceApplying(false);
                }
              };

              const handleApplyAllMandatory = async () => {
                if (outstandingMandatory.length === 0) return;
                setBulkApplying(true);
                try {
                  const promises = outstandingMandatory.map(def => {
                    const remark = remarksSelections[def._id] || "Applied bulk enrollment";
                    return applyForService({
                      studentId: id,
                      serviceId: def._id,
                      adminRemarks: remark,
                    });
                  });
                  await Promise.all(promises);
                  dispatch(showAlert({ type: "success", message: "All mandatory documents successfully initiated!" }));
                  const servicesRes = await getServiceApplications({ studentId: id });
                  if (servicesRes.success) setServiceApplications(servicesRes.data);
                } catch (error) {
                  dispatch(showAlert({ type: "error", message: "Failed to apply for some mandatory documents" }));
                } finally {
                  setBulkApplying(false);
                }
              };

              const renderDocCard = (def, isLocked) => {
                const app = getAppForDef(def._id);
                
                // Determine fee amount
                const resolvedFee = def.currentFee || 0;

                // Status configuration
                let statusIcon = <MinusCircle className="w-5 h-5 text-slate-400" />;
                let statusLabel = "Not Applied";
                let statusColor = "bg-slate-100 text-slate-500 border-slate-200";

                const appPendingPayments = app ? payments.filter(p => p.approvalStatus === "pending" && p.type === "Documents & Services" && (p.serviceApplication?._id === app._id || p.serviceApplication === app._id || (p.serviceApplications && p.serviceApplications.includes(app._id)))) : [];
                const appPendingAmount = appPendingPayments.reduce((sum, p) => sum + p.amount, 0);
                const remainingAppFee = app ? Math.max(0, (app.feeAmount || 0) - (app.paidAmount || 0) - appPendingAmount) : 0;

                if (app) {
                  if (app.status === "Documents Received" || app.status === "Documents Sent Courier") {
                    statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
                    statusLabel = app.status.replace("Documents ", "");
                    statusColor = "bg-emerald-50 text-emerald-600 border-emerald-200";
                  } else {
                    statusIcon = <Hourglass className="w-5 h-5 text-amber-500 animate-pulse" />;
                    statusLabel = app.status.replace(" Applications", "").replace("Application ", "");
                  }
                }

                const isSelectable = isPartner && !isLocked && (!app || (app?.paymentStatus !== "Paid" && remainingAppFee > 0)) && def.documentType !== "Mandatory";
                const isSelected = selectedCartItems.some(item => item._id === def._id);
 
                return (
                  <div
                    key={def._id}
                    onClick={isSelectable ? () => handleToggleCartItem(def) : undefined}
                    className={cn(
                      "bg-card border border-border rounded-3xl p-6 shadow-sm transition-all flex flex-col justify-between relative overflow-hidden group",
                      isSelectable ? "cursor-pointer" : "",
                      app ? "border-primary/20 bg-primary/[0.01]" : "",
                      isSelected 
                        ? "border-primary bg-gradient-to-br from-primary/[0.03] to-card shadow-lg shadow-primary/5 ring-1 ring-primary/20 scale-[1.01]" 
                        : "",
                      isLocked ? "opacity-60 grayscale-[40%] cursor-not-allowed" : "hover:border-primary/30 hover:shadow-md"
                    )}
                  >
                    <div>
                      {/* Top status & fee row */}
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex items-center gap-2" onClick={(e) => isSelectable && e.stopPropagation()}>
                          {isSelectable && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleCartItem(def);
                              }}
                              className={cn(
                                "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0",
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground scale-105"
                                  : "border-muted-foreground/30 hover:border-primary bg-card text-transparent hover:text-primary/40"
                              )}
                            >
                              <svg className="w-3.5 h-3.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1", statusColor)}>
                            {statusIcon}
                            {statusLabel}
                          </span>
                          {app && app.paymentStatus !== "Paid" && appPendingAmount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-sm">
                              <Clock size={10} />
                              Pending (₹{appPendingAmount})
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Fee</p>
                          <p className="text-sm font-black text-primary">₹{resolvedFee.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="flex items-center gap-2 mb-1.5 text-foreground group-hover:text-primary transition-colors overflow-hidden">
                        {(() => {
                          const TitleIcon = ICON_MAP[def.icon] || Layers;
                          return <TitleIcon size={18} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors" />;
                        })()}
                        <h4 className="text-base font-black truncate">
                          {def.title}
                        </h4>
                      </div>
                      {def.description && (
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                          {def.description}
                        </p>
                      )}

                    </div>

                    {/* Action button */}
                    {!app && isPartner && (def.documentType === "Optional" || (def.documentType === "Mandatory" && outstandingMandatory.length === 1)) && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <button
                          disabled={isLocked || isServiceApplying}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplySingle(def._id);
                          }}
                          className={cn(
                            "w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all",
                            isLocked 
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed" 
                              : "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
                          )}
                        >
                          <Plus size={12} />
                          Apply Now
                        </button>
                      </div>
                    )}

                    {app && def.documentType !== "Mandatory" && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowStatusModal(app);
                          }}
                          className="w-full py-3 bg-primary/[0.02] hover:bg-primary border border-primary/20 hover:border-primary hover:text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all text-primary/80 hover:shadow-md"
                        >
                          <ArrowUpDown size={12} />
                          {isPartner 
                            ? (app.paymentStatus === "Paid" || (appPendingAmount > 0 && remainingAppFee === 0) ? "View Status" : (appPendingAmount > 0 ? `Pay (₹${remainingAppFee})` : "Pay")) 
                            : "Update Status"}
                        </button>
                      </div>
                    )}

                    {app && def.documentType === "Mandatory" && (
                      <div className="mt-4 pt-4 border-t border-border/50 text-center flex justify-center">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50">
                          <Lock size={10} className="text-muted-foreground" />
                          Managed Collectively
                        </span>
                      </div>
                    )}
                  </div>
                );
              };

              return (
                <div className="space-y-12">
                  {/* Pipeline Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border p-8 rounded-[2.5rem] shadow-sm">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider mb-2">
                        <Activity size={12} />
                        <span>Fulfillment Workspace</span>
                      </div>
                      <h3 className="text-2xl font-black">Documents & Services Pipeline</h3>
                      <p className="text-sm font-medium text-muted-foreground">
                        Track, apply, and manage enrollment requirements and certificates.
                      </p>
                    </div>
                  </div>

                  {/* Mandatory Documents Section */}
                  {mandatoryDefs.length > 0 && (() => {
                    const mandatoryApps = serviceApplications.filter(app => 
                      mandatoryDefs.some(def => def._id === (app.service?._id || app.service))
                    );
                    const unpaidMandatoryApps = mandatoryApps.filter(app => app.paymentStatus !== "Paid");
                    const totalUnpaidMandatoryFee = unpaidMandatoryApps.reduce((sum, app) => sum + (app.feeAmount || 0) - (app.paidAmount || 0), 0);
                    const totalPendingMandatoryFee = payments
                      .filter(p => p.approvalStatus === "pending" && p.type === "Documents & Services" && unpaidMandatoryApps.some(app => app._id === p.serviceApplication?._id || app._id === p.serviceApplication))
                      .reduce((sum, p) => sum + p.amount, 0);
                    const remainingMandatoryFee = Math.max(0, totalUnpaidMandatoryFee - totalPendingMandatoryFee);

                    return (
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            <h4 className="text-lg font-black tracking-tight">Mandatory Documents</h4>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-3">
                            {outstandingMandatory.length > 0 && isPartner && (
                              <button
                                onClick={handleApplyAllMandatory}
                                disabled={bulkApplying}
                                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                              >
                                {bulkApplying ? (
                                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckCircle2 size={14} />
                                )}
                                Apply All Mandatory Documents
                              </button>
                            )}
                            {isPartner && remainingMandatoryFee > 0 && (
                              <button
                                onClick={() => setShowBulkPayModal(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md shadow-emerald-500/10"
                              >
                                <CreditCard size={14} />
                                Pay All (₹{remainingMandatoryFee.toLocaleString()})
                              </button>
                            )}
                            {isPartner && totalPendingMandatoryFee > 0 && (
                              <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl text-xs font-black uppercase tracking-wider select-none shadow-sm shadow-amber-500/5">
                                <Clock size={14} />
                                Pending Approval (₹{totalPendingMandatoryFee.toLocaleString()})
                              </div>
                            )}
                            {!isPartner && mandatoryApps.length > 0 && (
                              <button
                                onClick={() => setShowBulkStatusModal(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/10"
                              >
                                <ArrowUpDown size={14} />
                                Update Status
                              </button>
                            )}
                          </div>
                        </div>
                      
                      {Object.keys(groupMandatory).map((catName) => (
                        <div key={catName} className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest ml-1 shadow-sm select-none">
                            {(() => {
                              const CategoryIcon = {
                                "Academic Documents": GraduationCap,
                                "Overseas Education Documents": Globe,
                                "Job Overseas Documents": Briefcase,
                                "Working In India Documents": Building2,
                                "Studying In India Documents": ClipboardCheck,
                                "Embassy Attestion Services": Stamp,
                                "Study Abroad services": Plane,
                                "General Services": Layers
                              }[catName] || Layers;
                              return <CategoryIcon size={12} />;
                            })()}
                            <span>{catName}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {groupMandatory[catName].map(def => renderDocCard(def, false))}
                          </div>
                        </div>
                      ))}
                      </div>
                    );
                  })()}

                  {/* Optional Documents Section */}
                  {optionalDefs.length > 0 && (
                    <div className="space-y-6 pt-6 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                          <h4 className="text-lg font-black tracking-tight text-slate-800">Optional Documents</h4>
                        </div>
                        {!isMandatoryAppliedAll && (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
                            <Lock size={12} />
                            Locked
                          </span>
                        )}
                      </div>

                      {/* Locked Overlay Warning Banner */}
                      {!isMandatoryAppliedAll && (
                        <div className="p-6 bg-slate-100 border border-border/80 text-muted-foreground rounded-3xl text-sm font-bold flex items-start gap-4">
                          <ShieldAlert size={22} className="text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="uppercase tracking-widest text-[10px] font-black text-foreground mb-1">Optional Documents Locked</p>
                            <p className="font-semibold text-xs text-muted-foreground leading-relaxed">
                               Platform policy requires the student to complete all **Mandatory Document** applications first. Once all mandatory documents are active, Optional Services will unlock.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {Object.keys(groupOptional).map((catName) => (
                        <div key={catName} className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-400/10 border border-slate-400/20 text-slate-600 text-[10px] font-black uppercase tracking-widest ml-1 shadow-sm select-none">
                            {(() => {
                              const CategoryIcon = {
                                "Academic Documents": GraduationCap,
                                "Overseas Education Documents": Globe,
                                "Job Overseas Documents": Briefcase,
                                "Working In India Documents": Building2,
                                "Studying In India Documents": ClipboardCheck,
                                "Embassy Attestion Services": Stamp,
                                "Study Abroad services": Plane,
                                "General Services": Layers
                              }[catName] || Layers;
                              return <CategoryIcon size={12} />;
                            })()}
                            <span>{catName}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {groupOptional[catName].map(def => renderDocCard(def, !isMandatoryAppliedAll))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {activeTab === "tickets" && (
              <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-xl font-black mb-1">Support Tickets</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      Tickets raised for this student
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedTicket({
                        isNew: true,
                        studentName: student.name,
                        prefilledCategory: "Student",
                      })
                    }
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Raise Ticket
                  </button>
                </div>

                {isTicketsLoading ? (
                  <div className="py-20 flex justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare className="w-10 h-10 text-muted-foreground opacity-20" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      No tickets found for this student.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket._id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-6 bg-muted/20 rounded-[2rem] border border-border/50 hover:border-primary/30 cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                              ticket.status === "Received"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : ticket.status === "Closed"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            }`}
                          >
                            {ticket.status}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            #{ticket._id.slice(-6)}
                          </span>
                        </div>
                        <h4 className="text-sm font-black mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                          {ticket.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">
                          {ticket.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "followup" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Log New Followup */}
                {!isPartner && (
                  <div className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm sticky top-24">
                      <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                          <Plus className="w-5 h-5" />
                        </div>
                        Update Student Status
                      </h3>
                      {student.status === "Enrolled" ? (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 text-center space-y-4">
                          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                            <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-emerald-600">
                              Enrolled
                            </h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                              Process Completed
                            </p>
                          </div>
                          {student.enrollmentNumber && (
                            <div className="pt-4 border-t border-emerald-500/10">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                Enrollment ID
                              </p>
                              <p className="text-sm font-black text-foreground">
                                {student.enrollmentNumber}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <form
                          onSubmit={handleAddFollowup}
                          className="space-y-6"
                        >
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Student Status
                            </label>
                            <select
                              value={newFollowup.status}
                              onChange={(e) =>
                                setNewFollowup({
                                  ...newFollowup,
                                  status: e.target.value,
                                })
                              }
                              className="w-full p-4 rounded-2xl border border-border bg-muted/50 focus:border-primary outline-none transition-all text-xs font-bold uppercase tracking-wider"
                            >
                              <option value="">
                                No Change (Current: {student.status})
                              </option>
                              <option value="On Progress">On Progress</option>
                              <option value="Enrolled">Enrolled</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          {newFollowup.status === "Enrolled" && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Enrollment Number
                              </label>
                              <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                  type="text"
                                  required
                                  value={newFollowup.enrollmentNumber}
                                  onChange={(e) =>
                                    setNewFollowup({
                                      ...newFollowup,
                                      enrollmentNumber: e.target.value,
                                    })
                                  }
                                  placeholder="Enter official enrollment ID"
                                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-muted/50 focus:border-primary outline-none transition-all text-sm font-bold"
                                />
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Note / Remark
                            </label>
                            <textarea
                              required
                              value={newFollowup.note}
                              onChange={(e) =>
                                setNewFollowup({
                                  ...newFollowup,
                                  note: e.target.value,
                                })
                              }
                              className="w-full p-4 rounded-2xl border border-border bg-muted/50 focus:border-primary outline-none transition-all text-sm h-32 leading-relaxed"
                              placeholder="What was discussed during this interaction?"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isFollowupLoading}
                            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {isFollowupLoading ? (
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                Update Status
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* Right: History Timeline */}
                <div className={isPartner ? "lg:col-span-3" : "lg:col-span-2"}>
                  <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm min-h-[600px]">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                        <History className="w-5 h-5" />
                      </div>
                      Interaction History
                    </h3>

                    <div className="relative space-y-8 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/50">
                      {followups.length === 0 ? (
                        <div className="py-20 text-center space-y-4">
                          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                            <Clock className="w-10 h-10 text-muted-foreground opacity-20" />
                          </div>
                          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            No follow-up history found.
                          </p>
                        </div>
                      ) : (
                        followups.map((item, idx) => (
                          <div key={item._id} className="relative pl-12 group">
                            <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-card border-2 border-border flex items-center justify-center z-10 group-hover:border-primary transition-colors">
                              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors" />
                            </div>

                            <div className="p-6 bg-muted/20 rounded-[2rem] border border-border/50 group-hover:border-primary/20 transition-all">
                              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-primary/10 ${
                                      item.status === "Enrolled"
                                        ? "bg-emerald-500/10 text-emerald-600"
                                        : item.status === "Cancelled"
                                          ? "bg-red-500/10 text-red-600"
                                          : "bg-blue-500/10 text-blue-600"
                                    }`}
                                  >
                                    {item.status || "On Progress"}
                                  </span>
                                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.createdAt).toLocaleString(
                                      "en-IN",
                                      {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      },
                                    )}
                                  </span>
                                </div>
                                {(isAdmin ||
                                  String(item.authorId) ===
                                    String(user._id)) && (
                                  <button
                                    onClick={() =>
                                      handleDeleteFollowup(item._id)
                                    }
                                    className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <p className="text-sm font-medium leading-relaxed text-foreground/80 mb-4 whitespace-pre-wrap">
                                {item.note}
                              </p>

                              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                                    {item.authorName?.charAt(0) || "U"}
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    {item.authorName} • {item.authorType}
                                  </span>
                                </div>
                                {item.nextFollowupDate && (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/10">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">
                                      Next:{" "}
                                      {new Date(
                                        item.nextFollowupDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals are kept below (no changes to their functionality) */}
      {/* Pay Modal */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card border border-border w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Make Payment</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      Remaining: ₹{remaining.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex bg-muted p-1 rounded-2xl mb-6">
                  <button
                    onClick={() => setPaymentMethodTab("online")}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                      paymentMethodTab === "online"
                        ? "bg-card shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Pay Online
                  </button>
                  <button
                    onClick={() => setPaymentMethodTab("offline")}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                      paymentMethodTab === "offline"
                        ? "bg-card shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Upload Receipt
                  </button>
                </div>

                <form
                  onSubmit={
                    paymentMethodTab === "online"
                      ? handlePayOnline
                      : handlePayment
                  }
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Payment Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary">
                        ₹
                      </span>
                      <input
                        type="number"
                        required
                        max={remaining}
                        value={paymentAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (Number(val) > remaining) {
                            setPaymentAmount(remaining.toString());
                          } else {
                            setPaymentAmount(val);
                          }
                        }}
                        placeholder="Enter amount"
                        className="w-full pl-10 pr-4 py-4 rounded-[1.5rem] border border-border bg-muted/50 focus:border-primary outline-none transition-all font-black text-lg"
                      />
                    </div>
                  </div>

                  {paymentMethodTab === "offline" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Payment Method
                          </label>
                          <select
                            required
                            value={offlinePaymentMethod}
                            onChange={(e) =>
                              setOfflinePaymentMethod(e.target.value)
                            }
                            className="w-full px-4 py-4 rounded-[1.5rem] border border-border bg-muted/50 focus:border-primary outline-none transition-all font-bold appearance-none text-sm"
                          >
                            <option value="Offline / Cash">
                              Offline / Cash
                            </option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Google Pay">Google Pay</option>
                            <option value="PhonePe">PhonePe</option>
                            <option value="UPI">Other UPI</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                            Transaction ID
                          </label>
                          <input
                            required
                            value={offlineTransactionId}
                            onChange={(e) =>
                              setOfflineTransactionId(e.target.value)
                            }
                            placeholder="e.g., T230415..."
                            className="w-full px-4 py-4 rounded-[1.5rem] border border-border bg-muted/50 focus:border-primary outline-none transition-all font-bold text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Attach Receipt (Required)
                        </label>
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) =>
                              setPaymentReceipt(e.target.files[0])
                            }
                            className="hidden"
                            id="receipt-upload"
                          />
                          <label
                            htmlFor="receipt-upload"
                            className="flex items-center gap-3 w-full p-4 rounded-[1.5rem] border border-dashed border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all"
                          >
                            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                              <Plus className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                                {paymentReceipt
                                  ? paymentReceipt.name
                                  : "Choose File"}
                              </p>
                              <p className="text-[8px] font-bold text-muted-foreground uppercase">
                                {paymentReceipt
                                  ? `${(paymentReceipt.size / 1024 / 1024).toFixed(2)} MB`
                                  : "JPG, PNG or PDF (Max 5MB)"}
                              </p>
                            </div>
                            {paymentReceipt && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPaymentReceipt(null);
                                }}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Remarks (Optional)
                    </label>
                    <textarea
                      value={paymentRemarks}
                      onChange={(e) => setPaymentRemarks(e.target.value)}
                      className="w-full p-4 rounded-[1.5rem] border border-border bg-muted/50 focus:border-primary outline-none transition-all text-sm h-24"
                      placeholder="Add some notes about this payment..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPayModal(false);
                        setPaymentReceipt(null);
                      }}
                      className="flex-1 py-4 rounded-3xl border border-border font-black text-sm hover:bg-muted transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-[2] py-4 rounded-3xl bg-primary text-primary-foreground font-black text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      ) : paymentMethodTab === "online" ? (
                        "Pay Online"
                      ) : (
                        "Submit Receipt"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduleModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card border border-border w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">
                        Plan Payment Schedule
                      </h3>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                        Define future installments
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleAddScheduleRow}
                    className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:rotate-90 transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {scheduleItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-4 p-5 bg-muted/30 rounded-3xl border border-border/50 items-end"
                    >
                      <div className="col-span-3 space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          required
                          value={item.dueDate}
                          onChange={(e) => {
                            const newItems = [...scheduleItems];
                            newItems[idx].dueDate = e.target.value;
                            setScheduleItems(newItems);
                          }}
                          className="w-full p-3 rounded-xl border border-border bg-card text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          required
                          value={item.amount}
                          placeholder="₹ 0.00"
                          onChange={(e) => {
                            const newItems = [...scheduleItems];
                            newItems[idx].amount = e.target.value;
                            setScheduleItems(newItems);
                          }}
                          className="w-full p-3 rounded-xl border border-border bg-card text-xs font-black outline-none"
                        />
                      </div>
                      <div className="col-span-5 space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                          Description
                        </label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          placeholder="e.g. 2nd Installment"
                          onChange={(e) => {
                            const newItems = [...scheduleItems];
                            newItems[idx].description = e.target.value;
                            setScheduleItems(newItems);
                          }}
                          className="w-full p-3 rounded-xl border border-border bg-card text-xs font-bold outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => handleRemoveScheduleRow(idx)}
                          className="p-3 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-8">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="flex-1 py-4 rounded-3xl border border-border font-black text-sm hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSchedule}
                    className="flex-1 py-4 rounded-3xl bg-primary text-primary-foreground font-black text-sm shadow-lg shadow-primary/20"
                  >
                    Save Schedule
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DocViewerModal
        isOpen={!!viewingDoc}
        url={viewingDoc?.url}
        title={viewingDoc?.title}
        onClose={() => setViewingDoc(null)}
      />

      <AnimatePresence>
        {selectedTicket && (
          <TicketChat
            ticket={selectedTicket}
            prefilledStudentId={id}
            prefilledCategory={selectedTicket.prefilledCategory}
            onClose={() => {
              setSelectedTicket(null);
              fetchStudentTickets();
            }}
          />
        )}
      </AnimatePresence>

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        payment={selectedInvoice}
        student={student}
      />

      {/* Service Status & Payment Modal */}
      <ServiceModal 
        show={!!showStatusModal} 
        onClose={() => setShowStatusModal(null)}
        title="Update Application Status"
      >
        {(() => {
          const pendingAmount = showStatusModal ? payments.filter(p => p.approvalStatus === "pending" && p.type === "Documents & Services" && (p.serviceApplication?._id === showStatusModal._id || p.serviceApplication === showStatusModal._id || (p.serviceApplications && p.serviceApplications.includes(showStatusModal._id)))).reduce((s, p) => s + p.amount, 0) : 0;
          return (
            <ServiceUpdateStatusForm 
              application={showStatusModal}
              onSuccess={async () => {
                setShowStatusModal(null);
                const servicesRes = await getServiceApplications({ studentId: id });
                if (servicesRes.success) setServiceApplications(servicesRes.data);
                checkPaymentStatus();
              }} 
              cashfree={cashfree}
              pendingAmount={pendingAmount}
            />
          );
        })()}
      </ServiceModal>

      {/* ── Floating Cart Strip ── */}
      <AnimatePresence>
        {selectedCartItems.length > 0 && (() => {
          const totalFee = selectedCartItems.reduce((s, i) => s + (i.currentFee || 0), 0);
          const hasUnapplied = selectedCartItems.some(
            def => !serviceApplications.some(app => app.service?._id === def._id)
          );
          return (
            <motion.div
              key="cart-strip"
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed bottom-5 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-3xl"
                style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.45))" }}
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white">
                  {/* subtle shimmer bar at top */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* left: icon + meta */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                          <Package size={18} />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-500 text-[9px] font-black text-white flex items-center justify-center shadow-sm">
                          {selectedCartItems.length}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 leading-none mb-0.5">
                          Document Cart
                        </p>
                        <p className="text-base font-black leading-none">
                          ₹{totalFee.toLocaleString()}
                          <span className="text-[10px] font-bold text-slate-400 ml-2 normal-case tracking-normal">
                            {selectedCartItems.length} {selectedCartItems.length === 1 ? "service" : "services"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* clear */}
                      <button
                        type="button"
                        onClick={() => setSelectedCartItems([])}
                        className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="Clear cart"
                      >
                        <X size={15} />
                      </button>

                      {/* apply only – shows only when unapplied items exist */}
                      {hasUnapplied && (
                        <button
                          type="button"
                          disabled={isCartProcessing}
                          onClick={handleBulkApplyOnly}
                          className="px-4 py-2 rounded-xl border border-slate-600 hover:border-slate-400 bg-slate-800 hover:bg-slate-700 text-[11px] font-black uppercase tracking-wider text-slate-200 transition-all flex items-center gap-1.5 disabled:opacity-40"
                        >
                          <Plus size={11} />
                          Apply
                        </button>
                      )}

                      {/* view / pay – always clickable; explains why blocked when unapplied items exist */}
                      <button
                        type="button"
                        onClick={() => {
                          if (hasUnapplied) {
                            const unappliedCount = selectedCartItems.filter(
                              def => !serviceApplications.some(app => app.service?._id === def._id)
                            ).length;
                            dispatch(showAlert({
                              type: "warning",
                              message: `${unappliedCount} document${unappliedCount > 1 ? "s are" : " is"} not yet applied. Click "Apply" first to initiate the application${unappliedCount > 1 ? "s" : ""}, then you can pay.`,
                            }));
                            return;
                          }
                          setShowCartModal(true);
                        }}
                        className={cn(
                          "px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                          hasUnapplied
                            ? "bg-slate-700 text-slate-400 opacity-70 hover:opacity-100 hover:bg-slate-600"
                            : "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95"
                        )}
                      >
                        <CreditCard size={13} />
                        Pay Together
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── Cart Side-Drawer ── */}
      <AnimatePresence>
        {showCartModal && (
          <>
            {/* backdrop */}
            <motion.div
              key="cart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
              onClick={() => !isCartProcessing && setShowCartModal(false)}
            />

            {/* panel */}
            <motion.div
              key="cart-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-[480px] flex flex-col bg-card border-l border-border shadow-2xl"
            >
              {/* ─ Header ─ */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Package size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight">Document Cart</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {selectedCartItems.length} {selectedCartItems.length === 1 ? "service" : "services"} selected
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !isCartProcessing && setShowCartModal(false)}
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ─ Scrollable body ─ */}
              <div className="flex-1 overflow-y-auto">
                <form
                  id="cart-checkout-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (cartPaymentMethodTab === "online") {
                      return handleCartPayOnline(e);
                    }
                    if (!cartPaymentData.transactionId.trim()) {
                      dispatch(showAlert({ type: "error", message: "Please specify the Transaction ID." }));
                      return;
                    }
                    if (!cartReceipt) {
                      dispatch(showAlert({ type: "error", message: "Please attach a payment receipt." }));
                      return;
                    }
                    setIsCartProcessing(true);
                    try {
                      const unapplied = selectedCartItems.filter(
                        def => !serviceApplications.some(app => app.service?._id === def._id)
                      );
                      for (const def of unapplied) {
                        await applyForService({
                          studentId: id,
                          serviceId: def._id,
                          adminRemarks: cartPaymentData.remarks || "Applied via bulk checkout",
                        });
                      }
                      const refreshRes = await getServiceApplications({ studentId: id });
                      if (!refreshRes.success) throw new Error("Failed to sync application records.");
                      setServiceApplications(refreshRes.data);
                      const updatedApps = refreshRes.data;

                      const validCartItems = selectedCartItems.filter(def => {
                        const matchApp = updatedApps.find(a => a.service?._id === def._id);
                        if (!matchApp) return false;
                        const appPending = payments.filter(p => p.approvalStatus === "pending" && p.type === "Documents & Services" && (p.serviceApplication === matchApp._id || (p.serviceApplications && p.serviceApplications.includes(matchApp._id)))).reduce((sum, p) => sum + p.amount, 0);
                        return (matchApp.feeAmount || 0) - (matchApp.paidAmount || 0) - appPending > 0;
                      });

                      const totalToPay = validCartItems.reduce((sum, def) => {
                        const matchApp = updatedApps.find(a => a.service?._id === def._id);
                        const appPending = payments.filter(p => p.approvalStatus === "pending" && p.type === "Documents & Services" && (p.serviceApplication === matchApp._id || (p.serviceApplications && p.serviceApplications.includes(matchApp._id)))).reduce((sum, p) => sum + p.amount, 0);
                        return sum + ((matchApp.feeAmount || 0) - (matchApp.paidAmount || 0) - appPending);
                      }, 0);

                      const applicationIds = validCartItems.map(def => {
                        return updatedApps.find(a => a.service?._id === def._id)?._id;
                      }).filter(id => id);

                      const data = new FormData();
                      applicationIds.forEach(id => data.append("applicationIds", id));
                      data.append("amount", totalToPay);
                      data.append("method", cartPaymentData.method);
                      data.append("transactionId", cartPaymentData.transactionId);
                      data.append("remarks", cartPaymentData.remarks || "Cart bulk payment");
                      if (cartReceipt) data.append("receipt", cartReceipt);
                      
                      const res = await recordBulkServicePayment(data);

                      if (res.success) {
                        dispatch(showAlert({ type: "success", message: "Bulk payment submitted for verification!" }));
                        setSelectedCartItems([]);
                        setCartReceipt(null);
                        setCartPaymentData({ method: "Offline / Cash", transactionId: "", remarks: "" });
                        setShowCartModal(false);
                        const final = await getServiceApplications({ studentId: id });
                        if (final.success) setServiceApplications(final.data);
                        checkPaymentStatus();
                      } else {
                        dispatch(showAlert({ type: "warning", message: "Some payments failed. Check individual statuses." }));
                      }
                    } catch (err) {
                      dispatch(showAlert({ type: "error", message: err.message || "Bulk checkout failed." }));
                    } finally {
                      setIsCartProcessing(false);
                    }
                  }}
                  className="p-7 space-y-7"
                >
                  {/* ── Cart Items ── */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Selected Services</p>
                    <div className="space-y-2">
                      {selectedCartItems.map((item) => {
                        const isApplied = serviceApplications.some(app => app.service?._id === item._id);
                        const ItemIcon = ICON_MAP[item.icon] || Layers;
                        return (
                          <motion.div
                            key={item._id}
                            layout
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-muted/30 hover:border-primary/20 transition-all group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <ItemIcon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-foreground truncate">{item.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-black text-primary">₹{(item.currentFee || 0).toLocaleString()}</span>
                                {isApplied ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">Applied · Unpaid</span>
                                ) : (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-500/10 text-slate-500 border border-slate-500/20">Not Applied</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = selectedCartItems.filter(i => i._id !== item._id);
                                setSelectedCartItems(updated);
                                if (updated.length === 0) setShowCartModal(false);
                              }}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X size={13} />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Total ── */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-primary/5 border border-primary/15">
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Total</span>
                    <span className="text-xl font-black text-primary">
                      ₹{selectedCartItems.reduce((s, i) => s + (i.currentFee || 0), 0).toLocaleString()}
                    </span>
                  </div>

                  {/* ── Divider ── */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Details</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* ── Tabs ── */}
                  <div className="flex bg-muted p-1 rounded-2xl mb-6">
                    <button
                      type="button"
                      onClick={() => setCartPaymentMethodTab("online")}
                      className={cn(
                        "flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                        cartPaymentMethodTab === "online"
                          ? "bg-card shadow-sm text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Pay Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setCartPaymentMethodTab("offline")}
                      className={cn(
                        "flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                        cartPaymentMethodTab === "offline"
                          ? "bg-card shadow-sm text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Upload Receipt
                    </button>
                  </div>

                  {cartPaymentMethodTab === "offline" && (
                    <>
                      {/* ── Method + TxID ── */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Method</label>
                          <select
                            required
                            value={cartPaymentData.method}
                            onChange={e => setCartPaymentData({ ...cartPaymentData, method: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border focus:border-primary outline-none transition-all font-bold text-sm appearance-none"
                          >
                            <option value="Online">Online</option>
                            <option value="Offline / Cash">Offline / Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Google Pay">Google Pay</option>
                            <option value="PhonePe">PhonePe</option>
                            <option value="UPI">Other UPI</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Transaction ID</label>
                          <input
                            required
                            value={cartPaymentData.transactionId}
                            onChange={e => setCartPaymentData({ ...cartPaymentData, transactionId: e.target.value })}
                            placeholder="e.g. TXN123…"
                            className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border focus:border-primary outline-none transition-all font-bold text-sm"
                          />
                        </div>
                      </div>

                      {/* ── Receipt upload ── */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Receipt</label>
                        <input type="file" id="cart-receipt-panel" className="hidden" accept="image/*,.pdf" onChange={e => setCartReceipt(e.target.files[0])} />
                        <label
                          htmlFor="cart-receipt-panel"
                          className={cn(
                            "flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border border-dashed cursor-pointer transition-all",
                            cartReceipt
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                              : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60 hover:border-primary/40"
                          )}
                        >
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cartReceipt ? "bg-emerald-100" : "bg-muted")}>
                            {cartReceipt ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Upload size={15} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate">{cartReceipt ? cartReceipt.name : "Attach receipt"}</p>
                            <p className="text-[10px] text-muted-foreground">{cartReceipt ? `${(cartReceipt.size / 1024).toFixed(0)} KB` : "JPG, PNG or PDF · Max 5 MB"}</p>
                          </div>
                          {cartReceipt && (
                            <button type="button" onClick={e => { e.preventDefault(); setCartReceipt(null); }} className="p-1 rounded hover:bg-red-50 text-red-400 transition-all">
                              <X size={12} />
                            </button>
                          )}
                        </label>
                      </div>
                    </>
                  )}

                  {/* ── Remarks ── */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Remarks <span className="normal-case font-medium">(optional)</span></label>
                    <textarea
                      rows={2}
                      value={cartPaymentData.remarks}
                      onChange={e => setCartPaymentData({ ...cartPaymentData, remarks: e.target.value })}
                      placeholder="Any extra payment details..."
                      className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border focus:border-primary outline-none transition-all font-medium text-sm resize-none"
                    />
                  </div>
                </form>
              </div>

              {/* ─ Footer ─ */}
              <div className="px-7 py-5 border-t border-border bg-card space-y-3">
                {/* Warning: unapplied items block payment */}
                {selectedCartItems.some(def => !serviceApplications.some(app => app.service?._id === def._id)) && (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold leading-snug">
                      Some selected documents are not yet applied. Use <span className="font-black">Apply</span> in the cart strip to initiate them first, then you can pay.
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  form="cart-checkout-form"
                  disabled={isCartProcessing || selectedCartItems.length === 0 || selectedCartItems.some(def => !serviceApplications.some(app => app.service?._id === def._id))}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-[0.18em] shadow-lg shadow-primary/20 hover:brightness-105 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCartProcessing ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard size={15} />
                      Pay {selectedCartItems.length} Service{selectedCartItems.length !== 1 ? "s" : ""} · ₹{selectedCartItems.reduce((s, i) => s + (i.currentFee || 0), 0).toLocaleString()}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => !isCartProcessing && setShowCartModal(false)}
                  disabled={isCartProcessing}
                  className="w-full py-3 rounded-2xl border border-border font-black text-sm text-muted-foreground hover:bg-muted transition-all disabled:opacity-40"
                >
                  Continue Browsing
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bulk Service Status & Payment Modal */}
      <ServiceModal 
        show={showBulkStatusModal} 
        onClose={() => setShowBulkStatusModal(false)}
        title="Update Status of All Mandatory Documents"
      >
        <BulkServiceUpdateStatusForm 
          applications={serviceApplications.filter(app => 
            mandatoryDefs.some(def => def._id === (app.service?._id || app.service))
          )}
          onSuccess={async () => {
            setShowBulkStatusModal(false);
            const servicesRes = await getServiceApplications({ studentId: id });
            if (servicesRes.success) setServiceApplications(servicesRes.data);
            checkPaymentStatus();
          }} 
        />
      </ServiceModal>

      <ServiceModal
        show={showBulkPayModal}
        onClose={() => setShowBulkPayModal(false)}
        title="Pay All Mandatory Documents Together"
      >
        {(() => {
          const apps = serviceApplications.filter(app => 
            mandatoryDefs.some(def => def._id === (app.service?._id || app.service)) && app.paymentStatus !== "Paid"
          );
          const pendingAmount = payments.filter(p => p.approvalStatus === "pending" && p.type === "Documents & Services" && apps.some(a => a._id === p.serviceApplication?._id || a._id === p.serviceApplication || (p.serviceApplications && p.serviceApplications.includes(a._id)))).reduce((s, p) => s + p.amount, 0);
          return (
            <BulkServiceRecordPaymentForm 
              applications={apps}
              onSuccess={async () => {
                setShowBulkPayModal(false);
                const servicesRes = await getServiceApplications({ studentId: id });
                if (servicesRes.success) setServiceApplications(servicesRes.data);
                checkPaymentStatus();
              }}
              cashfree={cashfree}
              pendingAmount={pendingAmount}
              payments={payments}
            />
          );
        })()}
      </ServiceModal>
    </DashboardLayout>
  );
}

// ─────────────────────────────────────────────
// Document Services Modal & Form Helpers
// ─────────────────────────────────────────────

const ServiceModal = ({ show, onClose, title, children }) => {
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
          className="relative bg-card border border-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden text-foreground"
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

const ServiceUpdateStatusForm = ({ application, onSuccess, cashfree }) => {
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
      const res = await updateApplicationStatus(application._id, formData);
      if (res.success) onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const remainingFee = Math.max(0, (application?.feeAmount || 0) - (application?.paidAmount || 0));
  const isFullyPending = remainingFee > 0 && pendingAmount >= remainingFee;

  if (isUnpaid) {
    if (isFullyPending) {
       return (
        <div className="space-y-6 text-center py-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6">
          <Clock className="w-12 h-12 mx-auto text-amber-500" />
          <p className="text-sm font-black uppercase tracking-widest text-amber-600">Payment Pending Approval</p>
          <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
            A payment of ₹{pendingAmount.toLocaleString()} is currently awaiting admin verification. Access is locked until it is approved.
          </p>
        </div>
      );
    }
    
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
        <ServiceRecordPaymentForm application={application} onSuccess={onSuccess} cashfree={cashfree} pendingAmount={pendingAmount} />
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

const ServiceRecordPaymentForm = ({ application, onSuccess, cashfree, pendingAmount = 0 }) => {
  const remainingBalance = application.feeAmount - (application.paidAmount || 0) - pendingAmount;
  
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

      const res = await recordServicePayment(application._id, data);
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
      const res = await createServiceCashfreeOrder(application._id, {
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

const BulkServiceUpdateStatusForm = ({ applications, onSuccess }) => {
  const [formData, setFormData] = useState({
    status: applications[0]?.status || "Pending Applications",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.remarks.trim()) {
      dispatch(showAlert({ type: "error", message: "Please enter remarks." }));
      return;
    }
    setLoading(true);
    try {
      const promises = applications.map(app => 
        updateApplicationStatus(app._id, formData)
      );
      await Promise.all(promises);
      dispatch(showAlert({ type: "success", message: "Successfully updated status of all mandatory documents!" }));
      onSuccess();
    } catch (error) {
      dispatch(showAlert({ type: "error", message: "Failed to update status for some documents." }));
    } finally {
      setLoading(false);
    }
  };

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
        {loading ? "Updating..." : "Commit Status Change (All)"}
      </button>
    </form>
  );
};

const BulkServiceRecordPaymentForm = ({ applications, onSuccess, cashfree, pendingAmount = 0, payments = [] }) => {
  const totalDue = applications.reduce((sum, app) => sum + (app.feeAmount || 0) - (app.paidAmount || 0), 0) - pendingAmount;
  
  if (totalDue <= 0) {
    return (
      <div className="space-y-6 text-center py-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6">
        <Clock className="w-12 h-12 mx-auto text-amber-500" />
        <p className="text-sm font-black uppercase tracking-widest text-amber-600">Payments Pending Approval</p>
        <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
          Payments covering the remaining mandatory fees are currently awaiting admin verification. You cannot make further payments until they are processed.
        </p>
      </div>
    );
  }
  
  const [paymentMethodTab, setPaymentMethodTab] = useState("online");
  const [formData, setFormData] = useState({
    amount: totalDue,
    method: "Offline / Cash",
    transactionId: "",
    remarks: ""
  });
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handlePayOnline = async (e) => {
    e.preventDefault();
    if (!totalDue || totalDue <= 0) return;

    setLoading(true);
    try {
      const res = await createBulkServiceCashfreeOrder({
        applicationIds: applications.map(app => app._id),
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
          message: error.response?.data?.message || "Failed to initiate bulk online payment",
        })
      );
    } finally {
      setLoading(false);
    }
  };

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
      dispatch(showAlert({ type: "error", message: "Please attach a receipt." }));
      return;
    }
    setLoading(true);
    try {
      const validApplications = applications.filter(app => {
        const appPending = payments.filter(p => p.approvalStatus === "pending" && p.type === "Documents & Services" && (p.serviceApplication?._id === app._id || p.serviceApplication === app._id || (p.serviceApplications && p.serviceApplications.includes(app._id)))).reduce((sum, p) => sum + p.amount, 0);
        return (app.feeAmount - (app.paidAmount || 0) - appPending) > 0;
      });

      const totalToPay = validApplications.reduce((sum, app) => {
        const appPending = payments.filter(p => p.approvalStatus === "pending" && p.type === "Documents & Services" && (p.serviceApplication?._id === app._id || p.serviceApplication === app._id || (p.serviceApplications && p.serviceApplications.includes(app._id)))).reduce((sum, p) => sum + p.amount, 0);
        return sum + (app.feeAmount - (app.paidAmount || 0) - appPending);
      }, 0);

      const applicationIds = validApplications.map(app => app._id);
      
      const data = new FormData();
      applicationIds.forEach(id => data.append("applicationIds", id));
      data.append("amount", totalToPay);
      data.append("method", formData.method);
      data.append("transactionId", formData.transactionId);
      data.append("remarks", formData.remarks || "Bulk payment of all mandatory documents");
      if (receipt) {
        data.append("receipt", receipt);
      }

      const res = await recordBulkServicePayment(data);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Successfully recorded payment for all mandatory documents!" }));
        onSuccess();
      } else {
        dispatch(showAlert({ type: "error", message: "Failed to record some payments." }));
      }
    } catch (error) {
      dispatch(showAlert({ type: "error", message: error.response?.data?.message || "Bulk payment recording failed" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={paymentMethodTab === "online" ? handlePayOnline : handlePayment} className="space-y-6">
      <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Due (Bundle)</p>
            <p className="text-3xl font-black text-primary">₹{totalDue.toLocaleString()}</p>
          </div>
          <CreditCard className="text-primary opacity-20" size={48} />
        </div>
        
        <div className="space-y-2 pt-4 border-t border-primary/10 max-h-[120px] overflow-y-auto custom-scrollbar">
          {applications.map(app => (
            <div key={app._id} className="flex justify-between items-center text-xs">
              <span className="font-bold text-muted-foreground truncate max-w-[250px]">{app.service?.title}</span>
              <span className="font-black text-foreground">₹{(app.feeAmount - (app.paidAmount || 0)).toLocaleString()}</span>
            </div>
          ))}
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
        {paymentMethodTab === "offline" && (
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
                  <option value="Online">Online</option>
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
                  placeholder="e.g., TXN123..."
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
                  id="bulk-receipt"
                  className="hidden"
                  onChange={(e) => setReceipt(e.target.files[0])}
                  accept="image/*,.pdf"
                />
                <label 
                  htmlFor="bulk-receipt"
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
            </div>
          </>
        )}

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
        disabled={loading}
        className="w-full py-5 rounded-3xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mx-auto" />
        ) : (
          "Record Bulk Payment & Process"
        )}
      </button>
    </form>
  );
};
