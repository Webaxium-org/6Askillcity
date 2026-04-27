import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import {
  CreditCard,
  Calendar,
  History,
  Users,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  BadgeDollarSign,
  Receipt,
  Hash,
  ChevronRight,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getGlobalPaymentStats } from "../../api/payment.api";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { useNavigate } from "react-router-dom";
import InvoiceModal from "../../components/payment/InvoiceModal";

export default function PaymentManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [data, setData] = useState({
    recentPayments: [],
    upcomingSchedules: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recent");
  const [search, setSearch] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getGlobalPaymentStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      dispatch(
        showAlert({
          type: "error",
          message: "Failed to load payment tracking",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = data.recentPayments.filter(
    (p) =>
      p.student?.name.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionId?.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredSchedules = data.upcomingSchedules.filter((s) =>
    s.student?.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout title="Payment Management">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="sm:col-span-2 bg-gradient-to-br from-primary to-blue-600 rounded-[2.5rem] p-8 text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest opacity-80">
                  Global Revenue
                </span>
              </div>
              <div>
                <h2 className="text-4xl font-black">
                  ₹
                  {data.recentPayments
                    .reduce((acc, p) => acc + p.amount, 0)
                    .toLocaleString()}
                </h2>
                <p className="text-xs font-bold opacity-60 mt-1">
                  Total collected in recent transactions
                </p>
              </div>
              <div className="flex gap-4">
                <button className="px-5 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-xs font-black uppercase tracking-widest">
                  Reports
                </button>
                <button className="px-5 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-xs font-black uppercase tracking-widest">
                  Analytics
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Recent Payments
              </p>
              <h4 className="text-2xl font-black mt-1">
                {data.recentPayments.length}
              </h4>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Upcoming Schedules
              </p>
              <h4 className="text-2xl font-black mt-1">
                {data.upcomingSchedules.length}
              </h4>
            </div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <div className="flex bg-muted/50 p-1.5 rounded-[1.5rem] border border-border w-fit whitespace-nowrap">
              <button
                onClick={() => setActiveTab("recent")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "recent" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Recent Payments
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "upcoming" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Upcoming Schedules
              </button>
            </div>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${activeTab === "recent" ? "payments" : "schedules"}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-card focus:border-primary outline-none transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest">
                Loading Global Ledger...
              </p>
            </div>
          ) : (
            <div>
              {activeTab === "recent" ? (
                <>
                  {/* Desktop Recent Payments Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Student
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Transaction Info
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Date & Method
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                            Amount
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {filteredPayments.map((p, idx) => (
                          <motion.tr
                            key={p._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.01 }}
                            className="group hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                  {p.student?.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-black group-hover:text-primary transition-colors">
                                    {p.student?.name}
                                  </p>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                    {p.student?.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-xs font-mono font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit">
                                <Hash className="w-3 h-3" /> {p.transactionId}
                              </div>
                              <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">
                                Ref: {p.invoiceId}
                              </p>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-sm font-black">
                                {new Date(p.date).toLocaleDateString()}
                              </p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                {p.method}
                              </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <p className="text-lg font-black text-emerald-600">
                                ₹{p.amount.toLocaleString()}
                              </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(p);
                                    setShowInvoiceModal(true);
                                  }}
                                  className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase"
                                >
                                  <Receipt className="w-3.5 h-3.5" /> Invoice
                                </button>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/student-management/${p.student?._id}`,
                                    )
                                  }
                                  className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white transition-all"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Recent Payments Card View */}
                  <div className="md:hidden divide-y divide-border/50">
                    {filteredPayments.map((p, idx) => (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.01 }}
                        className="p-6 space-y-4 active:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                              {p.student?.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black">
                                {p.student?.name}
                              </p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                {new Date(p.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-base font-black text-emerald-600">
                            ₹{p.amount.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase">
                            <span className="opacity-50">Ref:</span>{" "}
                            {p.invoiceId}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(p);
                                setShowInvoiceModal(true);
                              }}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-600"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/student-management/${p.student?._id}`,
                                )
                              }
                              className="p-2 rounded-lg bg-muted text-muted-foreground"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {filteredPayments.length === 0 && (
                    <div className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                      No recent transactions found
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Desktop Upcoming Schedules Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Student
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Due Date
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Description
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                            Scheduled Amount
                          </th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right whitespace-nowrap">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {filteredSchedules.map((s, idx) => (
                          <motion.tr
                            key={s._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.01 }}
                            className="group hover:bg-muted/20 transition-colors"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-black text-lg">
                                  {s.student?.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-black group-hover:text-primary transition-colors">
                                    {s.student?.name}
                                  </p>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                    {s.student?.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <p className="text-sm font-black">
                                  {new Date(s.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-tighter text-amber-500">
                                PENDING
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-sm font-bold text-muted-foreground">
                                {s.description}
                              </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <p className="text-lg font-black text-blue-600">
                                ₹{s.amount.toLocaleString()}
                              </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/dashboard/student-management/${s.student?._id}`,
                                  )
                                }
                                className="p-3 rounded-2xl bg-muted/50 text-muted-foreground hover:bg-primary hover:text-white transition-all"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Upcoming Schedules Card View */}
                  <div className="md:hidden divide-y divide-border/50">
                    {filteredSchedules.map((s, idx) => (
                      <motion.div
                        key={s._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.01 }}
                        className="p-6 space-y-4 active:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-black">
                              {s.student?.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black">
                                {s.student?.name}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase">
                                <Clock className="w-3 h-3" />{" "}
                                {new Date(s.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <p className="text-base font-black text-blue-600">
                            ₹{s.amount.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-muted-foreground">
                            {s.description}
                          </p>
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/student-management/${s.student?._id}`,
                              )
                            }
                            className="p-2 rounded-lg bg-muted text-muted-foreground"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {filteredSchedules.length === 0 && (
                    <div className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                      No upcoming schedules found
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        payment={selectedInvoice}
        student={selectedInvoice?.student}
      />
    </DashboardLayout>
  );
}
