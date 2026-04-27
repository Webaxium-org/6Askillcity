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
  CheckCircle2,
  Clock,
  AlertCircle,
  Hash,
  Wallet,
  Activity,
  ChevronRight,
  Printer,
  Trash2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getStudentById } from "../../api/student.api";
import { 
  recordPayment, 
  getStudentPayments, 
  setPaymentSchedule, 
  getStudentSchedules,
  deletePaymentSchedule
} from "../../api/payment.api";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import InvoiceModal from "../../components/payment/InvoiceModal";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([{ dueDate: "", amount: "", description: "" }]);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, paymentsRes, schedulesRes] = await Promise.all([
        getStudentById(id),
        getStudentPayments(id),
        getStudentSchedules(id)
      ]);

      if (studentRes.success) setStudent(studentRes.data);
      if (paymentsRes.success) setPayments(paymentsRes.data);
      if (schedulesRes.success) setSchedules(schedulesRes.data);
    } catch (error) {
      dispatch(showAlert({ type: "error", message: "Failed to load payment details" }));
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) return;
    
    const totalFee = student?.programFee?.totalFee || 0;
    const remaining = totalFee - (student.totalFeePaid || 0);

    if (Number(paymentAmount) > remaining) {
      dispatch(showAlert({ 
        type: "error", 
        message: `Amount exceeds remaining fee (₹${remaining.toLocaleString()})` 
      }));
      return;
    }

    setIsProcessing(true);
    try {
      const res = await recordPayment(id, { 
        amount: paymentAmount, 
        remarks: paymentRemarks,
        method: "Offline (Dummy)"
      });
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Payment recorded successfully!" }));
        // Refresh all data to sync totals
        await fetchData();
        setShowPayModal(false);
        setPaymentAmount("");
        setPaymentRemarks("");
      }
    } catch (error) {
      dispatch(showAlert({ type: "error", message: error.response?.data?.message || "Payment failed" }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddScheduleRow = () => {
    setScheduleItems([...scheduleItems, { dueDate: "", amount: "", description: "" }]);
  };

  const handleRemoveScheduleRow = (idx) => {
    setScheduleItems(scheduleItems.filter((_, i) => i !== idx));
  };

  const handleUpdateSchedule = async () => {
     try {
        const res = await setPaymentSchedule(id, scheduleItems);
        if (res.success) {
           dispatch(showAlert({ type: "success", message: "Schedule updated successfully" }));
           await fetchData();
           setShowScheduleModal(false);
        }
     } catch (error) {
        dispatch(showAlert({ type: "error", message: "Failed to update schedule" }));
     }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    try {
      const res = await deletePaymentSchedule(scheduleId);
      if (res.success) {
        dispatch(showAlert({ type: "success", message: "Schedule deleted" }));
        setSchedules(schedules.filter(s => s._id !== scheduleId));
      }
    } catch (error) {
      dispatch(showAlert({ type: "error", message: "Failed to delete schedule" }));
    }
  };

  if (loading || !student) return (
    <DashboardLayout title="Student Payment">
       <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       </div>
    </DashboardLayout>
  );

  const totalFee = student?.programFee?.totalFee || 0;
  const remaining = totalFee - (student.totalFeePaid || 0);

  return (
    <DashboardLayout title="Payment Details">
      <div className="max-w-7xl mx-auto pb-20">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Students
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Student & Summary Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
               <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary text-4xl font-black">
                     {student.name.charAt(0)}
                  </div>
                  <div>
                     <h2 className="text-2xl font-black">{student.name}</h2>
                     <p className="text-sm text-muted-foreground">{student.program?.name}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${student.paymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>
                     {student.paymentStatus}
                  </div>
               </div>

               <div className="mt-10 space-y-4">
                  <div className="p-5 rounded-3xl bg-muted/50 border border-border flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                           <BadgeDollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">Total Fee</span>
                     </div>
                     <span className="text-lg font-black">₹{totalFee.toLocaleString()}</span>
                  </div>
                  <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                           <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">Paid</span>
                     </div>
                     <span className="text-lg font-black text-emerald-600">₹{(student.totalFeePaid || 0).toLocaleString()}</span>
                  </div>
                  <div className="p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                           <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground">Remaining</span>
                     </div>
                     <span className="text-lg font-black text-blue-600">₹{remaining.toLocaleString()}</span>
                  </div>
               </div>

               <button 
                  onClick={() => setShowPayModal(true)}
                  disabled={totalFee > 0 && remaining <= 0}
                  className="w-full mt-8 py-4 rounded-[1.5rem] bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
               >
                  <CreditCard className="w-5 h-5" />
                  Make Payment
               </button>
            </div>
          </div>

          {/* Right Column: History & Schedule */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Payment Schedule Card */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
               <div className="p-8 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Calendar className="w-5 h-5 text-primary" />
                     <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground/80">Payment Schedule</h3>
                  </div>
                  <button 
                    onClick={() => setShowScheduleModal(true)}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-all"
                  >
                     <Plus className="w-4 h-4" />
                     Add Schedule
                  </button>
               </div>
               <div className="p-8">
                  {schedules.length === 0 ? (
                     <div className="py-10 text-center text-muted-foreground">
                        <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>No payment schedule set for this student.</p>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {schedules.map((item, idx) => (
                           <div key={idx} className="flex items-center justify-between p-5 bg-muted/30 rounded-3xl border border-border/50 group hover:border-primary/30 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                    {item.status === 'Paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black">{item.description}</p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">{new Date(item.dueDate).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className="text-right">
                                    <p className="text-lg font-black">₹{item.amount.toLocaleString()}</p>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${item.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                       {item.status}
                                    </span>
                                 </div>
                                 {item.status === "Pending" && (
                                    <button 
                                      onClick={() => handleDeleteSchedule(item._id)}
                                      className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>

            {/* Payment History Card */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
               <div className="p-8 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <History className="w-5 h-5 text-primary" />
                     <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground/80">Transaction History</h3>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                     {payments.length} Transactions
                  </span>
               </div>
               <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead className="bg-muted/30">
                        <tr>
                           <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Date</th>
                           <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Transaction ID</th>
                           <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Amount</th>
                           <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Invoice</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border/50">
                        {payments.map((payment, idx) => (
                           <tr key={idx} className="group hover:bg-muted/20 transition-all">
                              <td className="px-8 py-6">
                                 <p className="text-sm font-black">{new Date(payment.date).toLocaleDateString()}</p>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase">{payment.method}</p>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground bg-muted/50 w-fit px-2 py-1 rounded">
                                    <Hash className="w-3 h-3" />
                                    {payment.transactionId}
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-base font-black text-primary">₹{payment.amount.toLocaleString()}</p>
                              </td>
                              <td className="px-8 py-6">
                                 <button 
                                    className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-500/10 px-3 py-2 rounded-xl transition-all"
                                    onClick={() => {
                                       setSelectedInvoice(payment);
                                       setShowInvoiceModal(true);
                                    }}
                                 >
                                    <Receipt className="w-3.5 h-3.5" />
                                    View
                                 </button>
                              </td>
                           </tr>
                        ))}
                        {payments.length === 0 && (
                           <tr>
                              <td colSpan="4" className="px-8 py-20 text-center text-muted-foreground">
                                 No payment history found.
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Modal */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowPayModal(false)}
               className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="relative bg-card border border-border w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl"
            >
               <div className="p-10">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-14 h-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
                        <Wallet className="w-7 h-7" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black">Make Payment</h3>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Remaining: ₹{remaining.toLocaleString()}</p>
                     </div>
                  </div>
                  
                  <form onSubmit={handlePayment} className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Amount</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary">₹</span>
                           <input 
                              type="number"
                              required
                              max={remaining}
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder="Enter amount"
                              className="w-full pl-10 pr-4 py-4 rounded-[1.5rem] border border-border bg-muted/50 focus:border-primary outline-none transition-all font-black text-lg"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Remarks (Optional)</label>
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
                           onClick={() => setShowPayModal(false)}
                           className="flex-1 py-4 rounded-3xl border border-border font-black text-sm hover:bg-muted transition-all"
                        >
                           Cancel
                        </button>
                        <button 
                           type="submit"
                           disabled={isProcessing}
                           className="flex-[2] py-4 rounded-3xl bg-primary text-primary-foreground font-black text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                           {isProcessing ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : 'Confirm Payment'}
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
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowScheduleModal(false)}
               className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="relative bg-card border border-border w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl"
            >
               <div className="p-10">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
                           <Calendar className="w-7 h-7" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black">Plan Payment Schedule</h3>
                           <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Define future installments</p>
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
                        <div key={idx} className="grid grid-cols-12 gap-4 p-5 bg-muted/30 rounded-3xl border border-border/50 items-end">
                           <div className="col-span-3 space-y-1">
                              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Due Date</label>
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
                              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Amount</label>
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
                              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Description</label>
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

      <InvoiceModal 
         isOpen={showInvoiceModal}
         onClose={() => setShowInvoiceModal(false)}
         payment={selectedInvoice}
         student={student}
      />
    </DashboardLayout>
  );
}
