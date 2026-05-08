import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Trash,
  Search,
  Filter,
  FileText,
  CreditCard,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  X,
  Loader2,
  Archive,
  Star,
  Square,
  CheckSquare,
  MoreVertical,
  RotateCcw,
  Inbox,
  Tag,
  Users,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import {
  fetchNotificationsPage,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotificationsThunk,
  clearPageItems,
} from "../../redux/notificationSlice";
import { showAlert } from "../../redux/alertSlice";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const cn = (...classes) => classes.filter(Boolean).join(" ");

const getRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const notifDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (today.getTime() === notifDate.getTime()) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (today.getTime() - notifDate.getTime() === 86400000) {
    return "Yesterday";
  }

  if (now.getFullYear() === date.getFullYear()) {
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

const TYPE_CONFIG = {
  application_submitted: {
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  application_approved: {
    icon: Check,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  application_rejected: {
    icon: X,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  payment_completed: {
    icon: CreditCard,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  payment_due: {
    icon: CreditCard,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  new_ticket: {
    icon: MessageSquare,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  ticket_status_updated: {
    icon: MessageSquare,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  default: { icon: Bell, color: "text-primary", bg: "bg-primary/10" },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.default;

const TABS = [
  {
    id: "all",
    label: "Primary",
    icon: Inbox,
    activeColor: "text-blue-600",
    activeBg: "bg-blue-600/10",
  },
  {
    id: "unread",
    label: "Unread",
    icon: AlertCircle,
    activeColor: "text-red-600",
    activeBg: "bg-red-600/10",
  },
  {
    id: "read",
    label: "Read",
    icon: CheckCheck,
    activeColor: "text-green-600",
    activeBg: "bg-green-600/10",
  },
];

const PAGE_LIMIT = 50;

// ─────────────────────────────────────────────
// Notification Row (Gmail Style)
// ─────────────────────────────────────────────

const NotificationRow = ({
  notif,
  onRead,
  onDelete,
  onNavigate,
  isSelected,
  onToggleSelect,
}) => {
  const config = getTypeConfig(notif.type);
  const IconComponent = config.icon;
  const isUnread = !notif.isRead;

  return (
    <div
      className={cn(
        "group flex items-center border-b border-border/40 py-2.5 px-4 transition-all cursor-pointer relative select-none",
        isUnread
          ? "bg-card font-bold text-foreground"
          : "bg-card/30 font-medium text-muted-foreground hover:text-foreground",
        isSelected &&
          "bg-blue-50/50 dark:bg-blue-900/10 shadow-[inset_2px_0_0_#1a73e8]",
      )}
      onClick={() => onNavigate(notif)}
    >
      {/* 1. Selection & Star */}
      <div
        className="flex items-center gap-3 shrink-0 mr-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          onClick={() => onToggleSelect(notif._id)}
          className="text-muted-foreground/30 hover:text-foreground/60 transition-colors p-1 rounded-md"
        >
          {isSelected ? (
            <CheckSquare className="w-[18px] h-[18px] text-blue-600 fill-blue-600/10" />
          ) : (
            <Square className="w-[18px] h-[18px]" />
          )}
        </div>
        <div
          className={cn(
            "flex items-center justify-center w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity",
            config.color,
          )}
        >
          <IconComponent className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Sender / Title */}
      <div
        className={cn(
          "w-32 sm:w-56 shrink-0 truncate mr-6 text-sm",
          isUnread ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {notif.title}
      </div>

      {/* 3. Subject & Snippet */}
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden mr-4">
        <span
          className={cn(
            "text-sm truncate",
            isUnread ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {notif.message}
        </span>
      </div>

      {/* 4. Hover Actions */}
      <div
        className="hidden group-hover:flex items-center gap-1 shrink-0 bg-transparent absolute right-20 px-2 h-full top-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-0.5 bg-card/90 dark:bg-background/90 backdrop-blur-sm px-1 py-1 rounded-full shadow-sm border border-border/50">
          <button
            onClick={() => onRead(notif._id)}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-all"
            title={isUnread ? "Mark as read" : "Mark as unread"}
          >
            {isUnread ? (
              <Check className="w-4 h-4" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onDelete(notif._id)}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {notif.link && (
            <button
              onClick={() => onNavigate(notif)}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-all"
              title="Open Link"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Date */}
      <div className="group-hover:hidden w-20 text-right shrink-0 text-xs font-medium text-muted-foreground">
        {getRelativeTime(notif.createdAt)}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { pageItems, pageLoading, pagination, unreadCount } = useSelector(
    (state) => state.notifications,
  );

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load notifications
  const loadPage = useCallback(
    (page = 1, tab = activeTab) => {
      dispatch(
        fetchNotificationsPage({ page, limit: PAGE_LIMIT, filter: tab }),
      );
    },
    [dispatch, activeTab],
  );

  useEffect(() => {
    setSelectedIds([]);
    loadPage(1, activeTab);
  }, [activeTab]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSelectedIds([]);
    await dispatch(
      fetchNotificationsPage({
        page: pagination.page,
        limit: PAGE_LIMIT,
        filter: activeTab,
      }),
    );
    setIsRefreshing(false);
  };

  const handleNotificationNavigate = (notif) => {
    if (!notif.isRead) dispatch(markNotificationAsRead(notif._id));
    if (notif.link) navigate(notif.link);
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === pageItems.length && pageItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pageItems.map((n) => n._id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => dispatch(deleteNotification(id)));
    setSelectedIds([]);
    dispatch(
      showAlert({
        type: "success",
        message: `${selectedIds.length} items moved to trash.`,
      }),
    );
  };

  const handleBulkRead = () => {
    if (selectedIds.length === 0) return;
    let count = 0;
    selectedIds.forEach((id) => {
      const notif = pageItems.find((n) => n._id === id);
      if (notif && !notif.isRead) {
        dispatch(markNotificationAsRead(id));
        count++;
      }
    });
    setSelectedIds([]);
    if (count > 0) {
      dispatch(showAlert({ type: "success", message: `Marked ${count} items as read.` }));
    }
  };

  const handleBulkUnread = () => {
    if (selectedIds.length === 0) return;
    let count = 0;
    selectedIds.forEach((id) => {
      const notif = pageItems.find((n) => n._id === id);
      if (notif && notif.isRead) {
        dispatch(markNotificationAsRead(id));
        count++;
      }
    });
    setSelectedIds([]);
    if (count > 0) {
      dispatch(showAlert({ type: "success", message: `Marked ${count} items as unread.` }));
    }
  };

  const selectedStats = useMemo(() => {
    const selected = pageItems.filter(n => selectedIds.includes(n._id));
    return {
      hasRead: selected.some(n => n.isRead),
      hasUnread: selected.some(n => !n.isRead),
    };
  }, [selectedIds, pageItems]);

  const filteredItems = useMemo(() => {
    return searchQuery.trim()
      ? pageItems.filter(
          (n) =>
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : pageItems;
  }, [pageItems, searchQuery]);

  return (
    <DashboardLayout title="Notifications">
      <div className=" mx-auto h-[calc(100vh-140px)] flex flex-col bg-card rounded-xl border border-border/60 overflow-hidden shadow-2xl">
        {/* ── Header Area ────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/5">
          <div className="flex items-center gap-1">
            <div
              className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
              onClick={handleRefresh}
            >
              <RotateCcw
                className={cn(
                  "w-4 h-4 text-muted-foreground",
                  isRefreshing && "animate-spin",
                )}
              />
            </div>
            <div className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-2xl px-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search notifications"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/30 border-transparent hover:bg-muted/50 focus:bg-card focus:shadow-inner px-10 py-1.5 rounded-lg text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground px-2">
              {filteredItems.length > 0
                ? `${(pagination.page - 1) * PAGE_LIMIT + 1}-${Math.min(pagination.page * PAGE_LIMIT, pagination.total)} of ${pagination.total}`
                : "0 of 0"}
            </span>
            <div className="flex items-center">
              <button
                className="p-2 rounded-full hover:bg-muted disabled:opacity-20 transition-colors"
                disabled={pagination.page <= 1}
                onClick={() => loadPage(pagination.page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded-full hover:bg-muted disabled:opacity-20 transition-colors"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadPage(pagination.page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Toolbar Area ───────────────────────── */}
        <div className="flex items-center px-4 py-2 bg-card border-b border-border/40 min-h-[48px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 group">
              <div
                onClick={handleSelectAll}
                className="p-1 rounded hover:bg-muted cursor-pointer transition-colors"
              >
                {selectedIds.length > 0 &&
                selectedIds.length === pageItems.length ? (
                  <CheckSquare className="w-[18px] h-[18px] text-blue-600" />
                ) : selectedIds.length > 0 ? (
                  <div className="w-[18px] h-[18px] border-2 border-blue-600 bg-blue-600/10 rounded flex items-center justify-center">
                    <div className="w-2.5 h-0.5 bg-blue-600" />
                  </div>
                ) : (
                  <Square className="w-[18px] h-[18px] text-muted-foreground/40" />
                )}
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground/40 cursor-pointer hover:text-foreground" />
            </div>

            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-1"
                >
                  {selectedStats.hasUnread && (
                    <button
                      onClick={handleBulkRead}
                      className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-all"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-5 h-5" />
                    </button>
                  )}
                  {selectedStats.hasRead && (
                    <button
                      onClick={handleBulkUnread}
                      className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-all"
                      title="Mark as unread"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={handleBulkDelete}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="h-4 w-[1px] bg-border mx-2" />
                  <span className="text-xs font-bold text-blue-600">
                    {selectedIds.length} selected
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Category Tabs ──────────────────────── */}
        <div className="flex items-center bg-card">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 min-w-[180px] text-sm font-bold transition-all relative group",
                  isActive
                    ? tab.activeColor
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isActive ? tab.activeBg : "bg-transparent",
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {tab.label}
                {tab.id === "unread" && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-auto shadow-sm">
                    {unreadCount}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="gmail-active-tab"
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-0.5",
                      tab.id === "all"
                        ? "bg-blue-600"
                        : tab.id === "unread"
                          ? "bg-red-600"
                          : "bg-green-600",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── List Area ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-card/20">
          {pageLoading ? (
            <div className="flex flex-col">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3 px-4 border-b border-border/20 animate-pulse"
                >
                  <div className="w-4 h-4 bg-muted rounded shrink-0" />
                  <div className="w-4 h-4 bg-muted rounded shrink-0" />
                  <div className="w-40 h-3 bg-muted rounded shrink-0" />
                  <div className="flex-1 h-3 bg-muted rounded" />
                  <div className="w-12 h-3 bg-muted rounded shrink-0" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 h-full">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center">
                  <Inbox className="w-12 h-12 text-muted-foreground/10" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-lg border border-border">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">
                Your inbox is empty
              </h3>
              <p className="text-sm text-muted-foreground">
                Everything looks good! No new notifications.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredItems.map((notif) => (
                <NotificationRow
                  key={notif._id}
                  notif={notif}
                  onRead={(id) => dispatch(markNotificationAsRead(id))}
                  onDelete={(id) => dispatch(deleteNotification(id))}
                  onNavigate={handleNotificationNavigate}
                  isSelected={selectedIds.includes(notif._id)}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer / Status ──────────────────────── */}
        <div className="px-6 py-2 border-t border-border/40 bg-muted/5 flex justify-between items-center text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center gap-4">
            <span>{unreadCount} unread</span>
            <div className="h-3 w-[1px] bg-border" />
            <span>{pagination.total} total</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              Last synced:{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
