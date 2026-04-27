import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Download, 
  Printer, 
  CheckCircle2, 
  Building2, 
  Mail, 
  Phone,
  Calendar,
  Hash,
  CreditCard
} from "lucide-react";

export default function InvoiceModal({ isOpen, onClose, payment, student }) {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white text-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none print:m-0"
          >
            {/* Header Controls (Hidden in Print) */}
            <div className="absolute top-6 right-6 flex items-center gap-2 print:hidden z-10">
              <button 
                onClick={handlePrint}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                title="Print Invoice"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice Content */}
            <div className="p-12 space-y-10" id="invoice-content">
              
              {/* Brand & Invoice Info */}
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
                         6A
                      </div>
                      <h1 className="text-2xl font-black tracking-tighter">SKILLCITY</h1>
                   </div>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-[200px]">
                      Advanced Skill Development & Career Hub
                   </p>
                </div>
                <div className="text-right space-y-1">
                   <h2 className="text-4xl font-black text-slate-300 uppercase tracking-tighter">Invoice</h2>
                   <div className="flex items-center justify-end gap-2 text-slate-500 font-bold text-sm">
                      <Hash className="w-3.5 h-3.5" />
                      <span>{payment.invoiceId}</span>
                   </div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Date: {new Date(payment.date || payment.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-100">
                 {/* From Info */}
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Issued By</h4>
                    <div className="space-y-1.5">
                       <p className="font-black text-lg">6A Skillcity HQ</p>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">
                          Skillcity Towers, Tech Park Phase II<br />
                          Bangalore, KA 560100<br />
                          India
                       </p>
                       <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                          <Mail className="w-3.5 h-3.5 text-primary" />
                          <span>billing@6askillcity.org</span>
                       </div>
                    </div>
                 </div>

                 {/* To Info */}
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Billed To</h4>
                    <div className="space-y-1.5">
                       <p className="font-black text-lg">{student?.name || "Student"}</p>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed">
                          {student?.email}<br />
                          {student?.phone || "+91 XXXXX XXXXX"}
                       </p>
                       <div className="mt-2 flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">
                             <Building2 className="w-3 h-3" /> {student?.university?.name || "University Not Set"}
                          </span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Table */}
              <div className="pt-6">
                 <table className="w-full">
                    <thead>
                       <tr className="border-b-2 border-slate-900">
                          <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest">Description</th>
                          <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest">Method</th>
                          <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       <tr>
                          <td className="py-6">
                             <p className="font-black text-slate-900">{student?.program?.name || "Program Fee Payment"}</p>
                             <p className="text-xs text-slate-500 font-medium mt-1">Transaction Ref: {payment.transactionId}</p>
                          </td>
                          <td className="py-6 text-right">
                             <span className="text-sm font-bold text-slate-600 uppercase">{payment.method}</span>
                          </td>
                          <td className="py-6 text-right">
                             <span className="text-lg font-black text-slate-900">₹{payment.amount?.toLocaleString()}</span>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-6">
                 <div className="w-64 space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                       <span>Subtotal</span>
                       <span>₹{payment.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                       <span>Tax (GST 0%)</span>
                       <span>₹0.00</span>
                    </div>
                    <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                       <span className="font-black text-slate-900 uppercase tracking-widest">Total Paid</span>
                       <span className="text-2xl font-black text-primary">₹{payment.amount?.toLocaleString()}</span>
                    </div>
                 </div>
              </div>

              {/* Footer */}
              <div className="pt-12 flex justify-between items-end border-t border-slate-100">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                       <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                       </div>
                       <span className="text-sm font-black uppercase tracking-widest">Payment Success</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium max-w-[250px] leading-relaxed">
                       This is a computer generated invoice and does not require a physical signature. For any discrepancies, please contact our support desk.
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Authorized Signatory</p>
                    <div className="font-black text-slate-900 tracking-tighter italic text-xl">6A Skillcity</div>
                 </div>
              </div>
            </div>

            {/* Print Footer Placeholder */}
            <div className="h-6 bg-slate-900 w-full print:hidden"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
