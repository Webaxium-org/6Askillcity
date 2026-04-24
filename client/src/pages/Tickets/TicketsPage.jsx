import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { MessageSquare, Plus, Search, Clock, AlertCircle, CheckCircle2, ChevronRight, SlidersHorizontal, X } from "lucide-react";
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
  const map = { "Open": "bg-blue-500/10 text-blue-500 border-blue-500/20", "In Progress": "bg-amber-500/10 text-amber-500 border-amber-500/20", "Resolved": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", "Closed": "bg-slate-500/10 text-slate-500 border-slate-500/20", "Postponed": "bg-purple-500/10 text-purple-500 border-purple-500/20" };
  return map[s] || "bg-primary/10 text-primary border-primary/20";
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [metrics, setMetrics] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, postponed: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const limit = 10;
  const { user } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const { socket } = useSocket();

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

  return (
    <DashboardLayout title="Support Tickets">
      <div className="space-y-4 sm:space-y-6">

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard title="Total"       value={metrics.total}      icon={MessageSquare} color="blue"    />
          <StatCard title="Open"        value={metrics.open}       icon={AlertCircle}   color="rose"    />
          <StatCard title="In Progress" value={metrics.inProgress} icon={Clock}         color="purple"  />
          <StatCard title="Postponed"   value={metrics.postponed}  icon={Clock}         color="purple"  />
          <StatCard title="Resolved"    value={metrics.resolved}   icon={CheckCircle2}  color="emerald" />
        </div>

        {/* Toolbar */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input type="text" placeholder="Search tickets..." value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:bg-background focus:border-border outline-none text-sm w-full transition-all" />
            </div>
            <button onClick={() => setShowFilters(v => !v)}
              className={cn("p-2.5 rounded-xl border transition-all shrink-0", showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 border-transparent hover:border-border")}>
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button onClick={() => setSelectedTicket({ isNew: true })}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm font-medium text-sm shrink-0">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Ticket</span>
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="pt-3 border-t border-border flex flex-col sm:flex-row gap-2 flex-wrap">
                  <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                    className="flex-1 min-w-[130px] px-3 py-2 rounded-xl bg-muted/50 border border-transparent focus:bg-background focus:border-border outline-none text-sm">
                    {["All", "Open", "In Progress", "Resolved", "Postponed", "Closed"].map(s => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
                  </select>
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                      className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-transparent focus:bg-background focus:border-border outline-none text-sm" />
                    <span className="text-muted-foreground">–</span>
                    <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                      className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-transparent focus:bg-background focus:border-border outline-none text-sm" />
                  </div>
                  {(filterStatus !== "All" || startDate || endDate) && (
                    <button onClick={() => { setFilterStatus("All"); setStartDate(""); setEndDate(""); }}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <X className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
                      <motion.tr key={ticket._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => setSelectedTicket(ticket)}>
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
                  <motion.div key={ticket._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-4 active:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
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
    </DashboardLayout>
  );
}
