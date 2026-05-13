import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { MessageSquare, Plus, Search, Clock, AlertCircle, CheckCircle2, ChevronRight, SlidersHorizontal, X, Filter, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, StatCard } from "../../components/dashboard/StatCard";
import { getTickets, getTicketMetrics } from "../../api/ticket.api";
import { useSelector, useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import TicketChat from "./TicketChat";
import { useSocket } from "../../context/SocketContext";

const getPriorityColor = (p) => {
  if (p === "Critical" || p === "High") return "bg-red-500/10 text-red-500 border-red-500/20";
  if (p === "Medium") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return "bg-muted text-muted-foreground border-transparent";
};
const getStatusColor = (s) => {
  const map = {
    Open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "In Progress": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Closed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Postponed: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };
  return map[s] || "bg-primary/10 text-primary border-primary/20";
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams] = useSearchParams();
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "All");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [metrics, setMetrics] = useState({ total: 0, open: 0, inProgress: 0, postponed: 0, closed: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const limit = 10;
  const { user } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openNewTicket) {
      setSelectedTicket({ isNew: true });
      // Clear state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== "All") params.status = filterStatus;
      if (startDate && endDate) { params.startDate = startDate; params.endDate = endDate; }
      const [res, metricsRes] = await Promise.all([getTickets(params), getTicketMetrics()]);
      if (res.success) { setTickets(res.data); setTotalPages(res.pagination.pages); }
      if (metricsRes.success) setMetrics(metricsRes.data);
    } catch { dispatch(showAlert({ type: "error", message: "Failed to load tickets" })); }
    finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(fetchTickets, 400); return () => clearTimeout(t); }, [page, limit, filterStatus, startDate, endDate, searchTerm]);
  useEffect(() => {
    if (!socket) return;
    const fn = ({ ticketId, status, postponedUntil }) => setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status, postponedUntil } : t));
    socket.on("ticket_status_updated", fn);
    return () => socket.off("ticket_status_updated", fn);
  }, [socket]);

  const setQuickRange = (range) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();
    switch (range) {
      case "today": start = today; end = today; break;
      case "week": const diff = today.getDate() - today.getDay(); start = new Date(today.setDate(diff)); end = new Date(); break;
      case "month": start = new Date(today.getFullYear(), today.getMonth(), 1); end = new Date(); break;
      default: break;
    }
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setPage(1);
  };

  return (
    <DashboardLayout title="Support Tickets">
      <div className="space-y-4 sm:space-y-6">

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            title="Total"
            value={metrics.total}
            icon={MessageSquare}
            color="blue"
            onClick={() => {
              setFilterStatus("All");
              setPage(1);
            }}
            className={cn(
              filterStatus === "All" && "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20"
            )}
          />
          <StatCard
            title="Open"
            value={metrics.open}
            icon={AlertCircle}
            color="rose"
            onClick={() => {
              setFilterStatus("Open");
              setPage(1);
            }}
            className={cn(
              filterStatus === "Open" && "ring-2 ring-rose-500 shadow-lg shadow-rose-500/20"
            )}
          />
          <StatCard
            title="In Progress"
            value={metrics.inProgress}
            icon={Clock}
            color="purple"
            onClick={() => {
              setFilterStatus("In Progress");
              setPage(1);
            }}
            className={cn(
              filterStatus === "In Progress" && "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20"
            )}
          />
          <StatCard
            title="Postponed"
            value={metrics.postponed}
            icon={Clock}
            color="amber"
            onClick={() => {
              setFilterStatus("Postponed");
              setPage(1);
            }}
            className={cn(
              filterStatus === "Postponed" && "ring-2 ring-amber-500 shadow-lg shadow-amber-500/20"
            )}
          />
          <StatCard
            title="Closed"
            value={metrics.closed}
            icon={CheckCircle2}
            color="emerald"
            onClick={() => {
              setFilterStatus("Closed");
              setPage(1);
            }}
            className={cn(
              filterStatus === "Closed" && "ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20"
            )}
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input type="text" placeholder="Search tickets..." value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border focus:border-primary outline-none text-sm w-full transition-all shadow-sm" />
            </div>
            <button onClick={() => setShowFilters(true)}
              className={cn(
                "px-4 py-2.5 rounded-xl border font-bold text-[11px] uppercase tracking-wider transition-all flex items-center gap-2",
                filterStatus !== "All" || startDate || endDate
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary shadow-sm"
              )}>
              <Filter className="w-3.5 h-3.5" />
              {filterStatus !== "All" || startDate || endDate ? "Active" : "Filters"}
            </button>
          </div>

          <button onClick={() => setSelectedTicket({ isNew: true })}
            className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm font-bold text-[11px] uppercase tracking-wider shrink-0">
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>

        {/* Active Filter Chips */}
        <AnimatePresence>
          {(filterStatus !== "All" || startDate || endDate) && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1">Active:</span>
              
              {filterStatus !== "All" && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-bold text-primary">
                  Status: {filterStatus}
                  <button onClick={() => setFilterStatus("All")} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
                </div>
              )}

              {(startDate || endDate) && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-600">
                  Period: {startDate || "Start"} - {endDate || "End"}
                  <button onClick={() => { setStartDate(""); setEndDate(""); }} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
                </div>
              )}

              <button onClick={() => { setFilterStatus("All"); setStartDate(""); setEndDate(""); }}
                className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:underline ml-1">
                Clear All
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ticket List */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <MessageSquare className="w-10 h-10 opacity-20" /><p className="text-sm">No tickets found</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      {["Ticket Details", "Creator / Assigned", "Status", "Created", ""].map(h => (
                        <th key={h} className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tickets.map((ticket, i) => (
                      <motion.tr
                        key={ticket._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={cn(
                          "hover:bg-muted/30 transition-colors cursor-pointer group",
                          ticket.status === "Closed" && "bg-emerald-500/5"
                        )}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-foreground text-sm">{ticket.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="uppercase text-[10px] tracking-wider font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">#{ticket._id.slice(-6)}</span>
                            <span className={cn("uppercase text-[10px] tracking-wider font-bold px-2 py-0.5 rounded border", getPriorityColor(ticket.priority))}>{ticket.priority}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {ticket.creatorModel === "AdmissionPoint"
                            ? <span className="text-purple-500 font-medium">{ticket.creatorId?.centerName || "Partner"}</span>
                            : <div className="flex flex-col">
                                <span className="text-blue-500 font-medium">{ticket.creatorId?.fullName || "Admin"}</span>
                                {ticket.assignedToPartner && <span className="text-xs text-muted-foreground">→ {ticket.assignedToPartner?.centerName}</span>}
                                {!ticket.assignedToPartner && ticket.assignedTo && <span className="text-xs text-muted-foreground">→ {ticket.assignedTo?.fullName}</span>}
                              </div>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border", getStatusColor(ticket.status))}>{ticket.status}</span>
                          {ticket.status === "Postponed" && ticket.postponedUntil && (
                            <div className="text-[10px] text-muted-foreground mt-1">Until {new Date(ticket.postponedUntil).toLocaleDateString()}</div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4 text-right">
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-border">
                {tickets.map((ticket, i) => (
                  <motion.div
                    key={ticket._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      "p-4 active:bg-muted/50 transition-colors cursor-pointer",
                      ticket.status === "Closed" && "bg-emerald-500/5"
                    )}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm leading-snug line-clamp-2">{ticket.title}</div>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider">#{ticket._id.slice(-6)}</span>
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider", getPriorityColor(ticket.priority))}>{ticket.priority}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground truncate">
                        {ticket.creatorModel === "AdmissionPoint" ? ticket.creatorId?.centerName || "Partner" : ticket.creatorId?.fullName || "Admin"}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded border", getStatusColor(ticket.status))}>{ticket.status}</span>
                        <span className="text-[11px] text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/10">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                    className="px-3 py-1.5 rounded-lg text-sm border border-border bg-background hover:bg-muted disabled:opacity-40 transition-colors">Previous</button>
                  <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm border border-border bg-background hover:bg-muted disabled:opacity-40 transition-colors">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <TicketChat ticket={selectedTicket} onClose={() => { setSelectedTicket(null); fetchTickets(); }} />
        )}
      </AnimatePresence>

      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)}
              className="fixed inset-0 h-screen w-screen bg-slate-900/40 backdrop-blur-md z-[9999]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-screen w-full max-w-md bg-card border-l border-border z-[10000] shadow-2xl flex flex-col">
              <div className="p-8 border-b border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Advanced Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-muted rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">Refine your ticket search</p>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Status Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ticket Status</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["All", "Open", "In Progress", "Postponed", "Closed"].map((s) => (
                      <button key={s} onClick={() => setFilterStatus(s)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                          filterStatus === s ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-muted/30 border-transparent text-muted-foreground hover:border-border"
                        )}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Date Range</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["today", "week", "month"].map((r) => (
                      <button key={r} onClick={() => setQuickRange(r)}
                        className="py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-border hover:bg-primary hover:text-white transition-all">
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Date</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-transparent focus:border-primary outline-none text-sm font-medium transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Date</label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-transparent focus:border-primary outline-none text-sm font-medium transition-all" />
                    </div>
                  </div>
                  {filterStatus !== "All" && (
                    <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-medium text-blue-600 leading-relaxed uppercase tracking-wider">
                        Filtering by <span className="font-black underline">{filterStatus === "Postponed" ? "Postponed Until" : filterStatus === "Closed" ? "Closed At" : "Created At"}</span> date.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 border-t border-border/50 bg-muted/20">
                <button onClick={() => { setFilterStatus("All"); setStartDate(""); setEndDate(""); setShowFilters(false); }}
                  className="w-full py-4 rounded-2xl border border-rose-500/30 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all">
                  Reset All Filters
                </button>
                <button onClick={() => setShowFilters(false)}
                  className="w-full mt-3 py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
