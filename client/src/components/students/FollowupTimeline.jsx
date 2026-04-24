import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { getFollowups, addFollowup, deleteFollowup } from "../../api/student.api";
import {
  MessageSquare,
  Trash2,
  Plus,
  Tag,
  Calendar,
  Bell,
} from "lucide-react";

const CATEGORY_COLORS = {
  general: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  document: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  eligibility: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  callback: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  other: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

export function FollowupTimeline({ studentId, canAdd = true }) {
  const dispatch = useDispatch();
  const [followups, setFollowups] = useState([]);
  const [loadingFollowups, setLoadingFollowups] = useState(true);
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("general");
  const [nextFollowupDate, setNextFollowupDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFollowups = useCallback(async () => {
    if (!studentId) return;
    setLoadingFollowups(true);
    try {
      const res = await getFollowups(studentId);
      if (res.success) setFollowups(res.data);
    } catch {
      dispatch(showAlert({ type: "error", message: "Failed to load follow-ups." }));
    } finally {
      setLoadingFollowups(false);
    }
  }, [studentId, dispatch]);

  useEffect(() => { fetchFollowups(); }, [fetchFollowups]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSubmitting(true);
    try {
      const res = await addFollowup(studentId, note, category, nextFollowupDate);
      if (res.success) {
        setFollowups((prev) => [res.data, ...prev]);
        setNote("");
        setCategory("general");
        setNextFollowupDate("");
        dispatch(showAlert({ type: "success", message: "Follow-up logged and scheduled!" }));
      }
    } catch (err) {
      dispatch(showAlert({ type: "error", message: err.response?.data?.message || "Failed to save follow-up." }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteFollowup(id);
      setFollowups((prev) => prev.filter((f) => f._id !== id));
    } catch {
      dispatch(showAlert({ type: "error", message: "Failed to delete follow-up." }));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add followup form */}
      {canAdd && (
        <form onSubmit={handleAdd} className="bg-muted/30 border border-border rounded-xl p-3 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold">Add Internal Note</span>
          </div>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Log an update or internal review note..."
            className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm resize-none transition-all"
          />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded border border-input">
              <Tag className="w-3 h-3 text-muted-foreground" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-[10px] bg-transparent outline-none focus:text-primary transition-all cursor-pointer"
              >
                <option value="general">General</option>
                <option value="document">Document</option>
                <option value="eligibility">Eligibility</option>
                <option value="callback">Callback</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-background px-2 py-1 rounded border border-input">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground mr-1">Next:</span>
              <input
                type="date"
                value={nextFollowupDate}
                onChange={(e) => setNextFollowupDate(e.target.value)}
                className="text-[10px] bg-transparent outline-none focus:text-primary transition-all cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={!note.trim() || submitting}
              className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-[11px] font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Plus className="w-3 h-3" /> Log & Schedule</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {loadingFollowups ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading...</span>
          </div>
        ) : followups.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-[11px]">No follow-up notes yet.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {followups.map((f, idx) => (
              <motion.div
                key={f._id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.02 }}
                className="relative pl-5 pb-3"
              >
                {/* Timeline line */}
                {idx < followups.length - 1 && (
                  <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />
                )}
                {/* Dot */}
                <div className="absolute left-0 top-1 w-[14px] h-[14px] rounded-full bg-card border-2 border-primary/50 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                </div>

                <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-foreground truncate max-w-[80px]">{f.authorName}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${CATEGORY_COLORS[f.category] || CATEGORY_COLORS.general}`}>
                        {f.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(f._id)}
                      disabled={deletingId === f._id}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-0.5 rounded shrink-0"
                    >
                      {deletingId === f._id ? (
                        <div className="w-2.5 h-2.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-2.5 h-2.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-foreground/80 whitespace-pre-wrap leading-relaxed">{f.note}</p>
                  
                  {f.nextFollowupDate && (
                    <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      <Bell className="w-3 h-3" />
                      Next Scheduled: {new Date(f.nextFollowupDate).toLocaleDateString([], { dateStyle: 'medium' })}
                    </div>
                  )}

                  <div className="mt-2 text-[9px] text-muted-foreground italic flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(f.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
