import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Send, ChevronLeft, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../../components/dashboard/StatCard";
import { useSelector } from "react-redux";
import { getTicketById, addMessage, updateTicketStatus, createTicket } from "../../api/ticket.api";
import { getAllApprovedAdmissionPoints } from "../../api/admissionPoint.api";
import { getAllUsers } from "../../api/auth.api";
import { useSocket } from "../../context/SocketContext";

export default function TicketChat({ ticket, onClose }) {
  const { user } = useSelector((s) => s.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(!ticket?.isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCreator  = ticket && (ticket.creatorId?._id === user?.userId || ticket.creatorId === user?.userId);
  const isAssigned = ticket && (ticket.assignedToPartner?._id === user?.userId || ticket.assignedToPartner === user?.userId);
  const canUpdateStatus = user?.type === "admin" || (user?.type === "partner" && !isCreator && isAssigned);

  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  // new-ticket fields
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority]     = useState("Medium");
  const [assigneeType, setAssigneeType] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [partners, setPartners]     = useState([]);
  const [usersList, setUsersList]   = useState([]);

  // chat fields
  const [status, setStatus]             = useState(ticket?.status || "Open");
  const [postponedUntil, setPostponedUntil] = useState(
    ticket?.postponedUntil ? ticket.postponedUntil.split("T")[0] : ""
  );

  const userId = user?.userId || user?._id;

  /* ── data loading ── */
  useEffect(() => {
    if (ticket && !ticket.isNew) {
      (async () => {
        try {
          setLoading(true);
          const res = await getTicketById(ticket._id);
          if (res.success) {
            setMessages(res.data.messages);
            setStatus(res.data.ticket.status);
            if (res.data.ticket.postponedUntil)
              setPostponedUntil(res.data.ticket.postponedUntil.split("T")[0]);
          }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
      })();
    } else if (ticket?.isNew && user?.type === "admin") {
      (async () => {
        try {
          const [pRes, uRes] = await Promise.all([getAllApprovedAdmissionPoints(), getAllUsers()]);
          if (pRes.success) setPartners(pRes.data);
          if (uRes.success) setUsersList(uRes.data);
        } catch (e) { console.error(e); }
      })();
    }
  }, [ticket, user]);

  /* ── socket listener ── */
  useEffect(() => {
    if (!socket || ticket?.isNew) return;
    const fn = (msg) => { if (msg.ticketId === ticket._id) setMessages(p => [...p, msg]); };
    socket.on("new_ticket_message", fn);
    return () => socket.off("new_ticket_message", fn);
  }, [socket, ticket]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  /* ── handlers ── */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const res = await addMessage(ticket._id, newMessage);
      if (res.success) setNewMessage("");
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const handleStatusChange = async (newStatus, fromPicker = false) => {
    try {
      if (newStatus === "Postponed" && !fromPicker) { setStatus("Postponed"); return; }
      if (newStatus === "Postponed" && !postponedUntil) { alert("Please select a date first"); return; }
      setIsSubmitting(true);
      await updateTicketStatus(ticket._id, newStatus, newStatus === "Postponed" ? postponedUntil : null);
      setStatus(newStatus);
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !description || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const payload = { title, description, priority };
      if (assigneeType === "partner" && assigneeId) payload.assignedToPartner = assigneeId;
      if (assigneeType === "user"    && assigneeId) payload.assignedTo        = assigneeId;
      const res = await createTicket(payload);
      if (res.success) onClose();
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  /* ── render ── */
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="w-full sm:max-w-lg bg-card h-full shadow-2xl border-l border-border flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-border bg-card flex items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0 sm:hidden">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold truncate">
                {ticket?.isNew ? "Create New Ticket" : ticket.title}
              </h2>
              {!ticket?.isNew && (
                <p className="text-xs text-muted-foreground truncate">#{ticket._id}</p>
              )}
            </div>
          </div>
          <button onClick={onClose}
            className="hidden sm:flex p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {ticket?.isNew ? (
          /* ── Create Form ── */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                  placeholder="Summarize your issue..."
                  className="w-full border border-border bg-background px-4 py-2.5 rounded-xl focus:outline-none focus:border-primary text-sm transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required
                  placeholder="Provide details..." rows={5}
                  className="w-full border border-border bg-background px-4 py-2.5 rounded-xl focus:outline-none focus:border-primary text-sm resize-none transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-border bg-background px-4 py-2.5 rounded-xl focus:outline-none focus:border-primary text-sm">
                  {["Low", "Medium", "High", "Critical"].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              {user?.type === "admin" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Assign To</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select value={assigneeType} onChange={(e) => { setAssigneeType(e.target.value); setAssigneeId(""); }}
                      className="sm:w-1/3 border border-border bg-background px-4 py-2.5 rounded-xl focus:outline-none focus:border-primary text-sm">
                      <option value="">None (Unassigned)</option>
                      <option value="user">Admin/User</option>
                      <option value="partner">Partner</option>
                    </select>
                    {assigneeType === "partner" && (
                      <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} required
                        className="flex-1 border border-border bg-background px-4 py-2.5 rounded-xl focus:outline-none focus:border-primary text-sm">
                        <option value="">-- Select Partner --</option>
                        {partners.map(p => <option key={p._id} value={p._id}>{p.centerName} ({p.licenseeName})</option>)}
                      </select>
                    )}
                    {assigneeType === "user" && (
                      <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} required
                        className="flex-1 border border-border bg-background px-4 py-2.5 rounded-xl focus:outline-none focus:border-primary text-sm">
                        <option value="">-- Select User --</option>
                        {usersList.map(u => <option key={u._id} value={u._id}>{u.fullName} ({u.role})</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )}
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium shadow-sm hover:bg-primary/90 transition-all disabled:opacity-70 flex justify-center items-center gap-2">
                {isSubmitting ? "Creating..." : "Submit Ticket"}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Status bar */}
            <div className="px-4 sm:px-6 py-2.5 border-b border-border bg-muted/20 flex flex-wrap gap-3 items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</span>
                {canUpdateStatus ? (
                  <select value={status} onChange={(e) => handleStatusChange(e.target.value)} disabled={isSubmitting}
                    className="text-xs font-medium border border-border rounded-lg bg-background px-2 py-1 outline-none focus:border-primary">
                    {["Open", "In Progress", "Resolved", "Closed", "Postponed"].map(s => <option key={s}>{s}</option>)}
                  </select>
                ) : (
                  <span className="text-xs font-medium px-2 py-1 rounded-lg bg-muted">{status}</span>
                )}
              </div>
              {status === "Postponed" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <CalendarIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  {canUpdateStatus ? (
                    <>
                      <input type="date" value={postponedUntil} min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setPostponedUntil(e.target.value)}
                        className="text-xs border border-border rounded-lg bg-background px-2 py-1 outline-none" />
                      <button onClick={() => handleStatusChange("Postponed", true)}
                        disabled={isSubmitting || !postponedUntil}
                        className="text-xs bg-purple-500 text-white px-3 py-1 rounded-lg disabled:opacity-50 hover:bg-purple-600 transition-colors">
                        Save
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Until {postponedUntil ? new Date(postponedUntil).toLocaleDateString() : "—"}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-muted/5">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId?._id === userId || msg.senderId === userId;
                  const isSystem = msg.message?.startsWith("Updated ticket status");
                  if (isSystem) return (
                    <div key={msg._id || i} className="flex justify-center">
                      <span className="text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {msg.message}
                      </span>
                    </div>
                  );
                  return (
                    <motion.div key={msg._id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm",
                        isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-background border border-border text-foreground rounded-tl-sm"
                      )}>
                        {!isMe && (
                          <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
                            {msg.senderModel === "AdmissionPoint" ? msg.senderId?.centerName : msg.senderId?.fullName}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <div className={cn("text-[10px] mt-1.5 text-right", isMe ? "text-primary-foreground/60" : "text-muted-foreground")}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 bg-card border-t border-border shrink-0">
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-muted border border-transparent focus:bg-background focus:border-border rounded-xl px-4 py-3 outline-none text-sm resize-none min-h-[46px] max-h-32 transition-all"
                  rows={1}
                  onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px"; }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }} />
                <button type="submit" disabled={!newMessage.trim() || isSubmitting}
                  className="p-3 bg-primary text-primary-foreground rounded-xl shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 shrink-0">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
