import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  LogOut,
  Trash2,
  Menu,
  User,
  LayoutDashboard,
  Users,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Bell,
  Check,
  CheckCheck,
  FileText,
  Clock,
  MessageSquare,
  Building2,
  CreditCard,
  GraduationCap,
  X,
  Activity,
  Layers,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useTheme } from "../global/ThemeProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "./StatCard";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../redux/userSlice";
import {
  addLiveNotification,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotificationsThunk,
} from "../../redux/notificationSlice";
import { showAlert } from "../../redux/alertSlice";
import { useSocket } from "../../context/SocketContext";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const getRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const TYPE_STYLES = {
  application_submitted: {
    border: "border-l-blue-500",
    dot: "bg-blue-500",
    icon: FileText,
    iconClass: "text-blue-500",
  },
  application_approved: {
    border: "border-l-emerald-500",
    dot: "bg-emerald-500",
    icon: Check,
    iconClass: "text-emerald-500",
  },
  application_rejected: {
    border: "border-l-rose-500",
    dot: "bg-rose-500",
    icon: X,
    iconClass: "text-rose-500",
  },
  payment_completed: {
    border: "border-l-emerald-500",
    dot: "bg-emerald-500",
    icon: CreditCard,
    iconClass: "text-emerald-500",
  },
  payment_due: {
    border: "border-l-amber-500",
    dot: "bg-amber-500",
    icon: CreditCard,
    iconClass: "text-amber-500",
  },
  new_ticket: {
    border: "border-l-amber-500",
    dot: "bg-amber-500",
    icon: MessageSquare,
    iconClass: "text-amber-500",
  },
  ticket_status_updated: {
    border: "border-l-violet-500",
    dot: "bg-violet-500",
    icon: MessageSquare,
    iconClass: "text-violet-500",
  },
  default: {
    border: "border-l-primary",
    dot: "bg-primary",
    icon: Bell,
    iconClass: "text-primary",
  },
};

const getTypeStyle = (type) => TYPE_STYLES[type] || TYPE_STYLES.default;

// ─────────────────────────────────────────────
// Sidebar Component
// ─────────────────────────────────────────────

const Sidebar = ({
  isOpen,
  setSidebarOpen,
  isCollapsed,
  setIsCollapsed,
  setShowLogoutWarning,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.user);
  const userName = user?.fullName || user?.centerName;
  const userRole = user?.type === "partner" ? "partner" : user?.role || "User";
  const navigate = useNavigate();
  const location = useLocation();

  const menuGroups = [
    {
      label: "System",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          path: "/dashboard",
        },
        ...(user?.role === "admin"
          ? [
              {
                id: "overview",
                label: "Overview",
                icon: Activity,
                path: "/dashboard/overview",
              },
            ]
          : []),
      ],
    },
    {
      label: "Academics",
      items: [
        ...(user?.type === "partner"
          ? [
              {
                id: "applications",
                label: "Enrollments",
                icon: FileText,
                path: "/dashboard/applications",
              },
              {
                id: "management",
                label: "My Students",
                icon: Users,
                path: "/dashboard/student-management",
              },
              {
                id: "courses",
                label: "Programs",
                icon: GraduationCap,
                path: "/dashboard/courses",
              },
            ]
          : []),
        ...(user?.type === "admin"
          ? [
              {
                id: "eligibility",
                label: "Review Queue",
                icon: Clock,
                path: "/dashboard/eligibility-queue",
              },
              {
                id: "management",
                label: "All Students",
                icon: Users,
                path: "/dashboard/student-management",
              },
              {
                id: "universities",
                label: "Universities",
                icon: Building2,
                path: "/dashboard/university-management",
              },
              {
                id: "partners",
                label: "Admission Points",
                icon: UserPlus,
                path: "/dashboard/partner-management",
              },
            ]
          : []),
      ],
    },
    {
      label: "Operations",
      items: [
        ...(user?.type === "partner" || user?.role === "admin"
          ? [
              {
                id: "payments",
                label: "Finance",
                icon: CreditCard,
                path: "/dashboard/payment-management",
              },
            ]
          : []),
        ...(user?.role === "admin"
          ? [
              {
                id: "reports",
                label: "Reports",
                icon: FileText,
                path: "/dashboard/reports",
              },
              {
                id: "documents-services",
                label: "Documents & Services",
                icon: Layers,
                path: "/dashboard/documents-services",
              },
            ]
          : []),
        {
          id: "tickets",
          label: "Help Desk",
          icon: MessageSquare,
          path: "/dashboard/tickets",
        },
        {
          id: "notifications",
          label: "Notifications",
          icon: Bell,
          path: "/dashboard/notifications",
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed z-40 top-0 left-0 h-full bg-card/80 backdrop-blur-xl border-r border-border shadow-2xl transition-all duration-500 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none rounded-r-[2.5rem]" />
        <div className="h-24 relative flex items-center px-6 border-b border-border/50 bg-background/20 backdrop-blur-md justify-center md:justify-start">
          <div className="flex items-center justify-center w-full">
            <img
              src={logo}
              alt="6ASkillCity"
              className={cn(
                "h-14 w-auto object-contain transition-all duration-500",
                isCollapsed ? "scale-110" : "scale-125",
              )}
            />
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all absolute -right-[14px] top-7 bg-card border border-border shadow-lg rounded-full z-50 hover:scale-110"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
                  {group.label}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (location.pathname === "/dashboard" &&
                      item.id === "dashboard");
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "w-full flex items-center rounded-xl transition-all duration-300 relative group/item ",
                        isCollapsed
                          ? "justify-center py-3"
                          : "space-x-3 px-3 py-2.5",
                        isActive
                          ? "text-primary-foreground font-bold"
                          : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabGlow"
                          className={cn(
                            "absolute bg-gradient-to-r from-primary to-primary/80 rounded-xl -z-10 shadow-lg shadow-primary/20 m-0",
                            isCollapsed ? "inset-1.5" : "inset-0",
                          )}
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}

                      <div
                        className={cn(
                          "relative flex items-center justify-center transition-all duration-300",
                          isActive ? "scale-110" : "group-hover/item:scale-110",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "shrink-0",
                            isCollapsed ? "w-6 h-6" : "w-5 h-5",
                          )}
                        />
                        {isActive && (
                          <span className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                        )}
                      </div>

                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm tracking-tight truncate flex-1 text-left"
                        >
                          {item.label}
                        </motion.span>
                      )}

                      {!isCollapsed && isActive && (
                        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-foreground shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Mobile-only Theme & Logout — explicitly hidden on md+ */}
        {!isCollapsed && (
          <div className="md:hidden px-4 py-4 space-y-2 border-t border-border/30 bg-background/10 shrink-0">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary transition-all shadow-sm"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              <span className="text-sm font-bold">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </button>

            <button
              onClick={() => {
                setSidebarOpen(false);
                setShowLogoutWarning(true);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-bold">Logout</span>
            </button>
          </div>
        )}

        <div className="p-4 border-t border-border bg-background/20">
          <div
            onClick={() => navigate("/dashboard/profile")}
            className={cn(
              "flex items-center rounded-2xl bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 group/user cursor-pointer",
              isCollapsed ? "justify-center p-2" : "space-x-3 px-3 py-3",
            )}
          >
            <div className="relative shrink-0">
              <User
                className={cn(
                  "rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover/user:scale-110",
                  isCollapsed ? "w-10 h-10 p-2" : "w-9 h-9 p-2",
                )}
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-full shadow-sm" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-black truncate leading-tight text-foreground group-hover/user:text-primary transition-colors">
                  {userName}
                </p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-black mt-1 opacity-70">
                  {userRole}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

// ─────────────────────────────────────────────
// DashboardLayout
// ─────────────────────────────────────────────

export const DashboardLayout = ({ children, title }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = React.useRef(null);
  const { socket } = useSocket();
  const { items: notifications, unreadCount } = useSelector(
    (state) => state.notifications,
  );

  React.useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  React.useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      dispatch(addLiveNotification(data));
      dispatch(
        showAlert({
          type: "info",
          message: `${data.title}: ${data.message}`,
        }),
      );
    };

    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, [socket, dispatch]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const handleNotificationClick = (notif) => {
    setShowNotifications(false);
    if (!notif.isRead) dispatch(markNotificationAsRead(notif._id));
    if (notif.link) navigate(notif.link);
  };

  const handleDeleteNotification = (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  const confirmLogout = () => {
    dispatch(logOut());
    navigate("/login");
  };

  // Dropdown: latest 10 only
  const dropdownNotifications = notifications.slice(0, 10);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar
        isOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        setShowLogoutWarning={setShowLogoutWarning}
      />

      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0",
          isCollapsed ? "md:pl-20" : "md:pl-64",
        )}
      >
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              {title || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notifications Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 shadow-sm"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-background shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-[22rem] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                    style={{ maxHeight: "480px" }}
                  >
                    {/* Dropdown Header */}
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-sm text-foreground">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => dispatch(markAllNotificationsAsRead())}
                          className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-bold"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Dropdown List — latest 10 */}
                    <div className="overflow-y-auto flex-1">
                      {dropdownNotifications.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground text-sm flex flex-col items-center">
                          <Bell className="w-8 h-8 mb-2 opacity-20" />
                          <p className="font-medium">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {dropdownNotifications.map((notif) => {
                            const style = getTypeStyle(notif.type);
                            const IconComp = style.icon;
                            return (
                              <div
                                key={notif._id || notif.id}
                                className={cn(
                                  "p-3 rounded-xl transition-all cursor-pointer relative group border-l-2",
                                  style.border,
                                  notif.isRead
                                    ? "bg-transparent hover:bg-muted border-y border-r border-transparent hover:border-border"
                                    : "bg-primary/5 hover:bg-primary/10 border-y border-r border-primary/10",
                                )}
                                onClick={() => handleNotificationClick(notif)}
                              >
                                <div className="flex items-start gap-2.5 pr-6">
                                  <div
                                    className={cn(
                                      "mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
                                      notif.isRead
                                        ? "bg-muted"
                                        : "bg-primary/10",
                                    )}
                                  >
                                    <IconComp
                                      className={cn(
                                        "w-3.5 h-3.5",
                                        style.iconClass,
                                      )}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4
                                      className={cn(
                                        "text-sm leading-snug truncate",
                                        notif.isRead
                                          ? "font-medium text-foreground/80"
                                          : "font-bold text-foreground",
                                      )}
                                    >
                                      {notif.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                      {notif.message}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                                      {getRelativeTime(notif.createdAt)}
                                    </span>
                                  </div>
                                  {!notif.isRead && (
                                    <div
                                      className={cn(
                                        "shrink-0 w-1.5 h-1.5 rounded-full mt-1.5",
                                        style.dot,
                                      )}
                                    />
                                  )}
                                </div>
                                <button
                                  onClick={(e) =>
                                    handleDeleteNotification(e, notif._id)
                                  }
                                  className="absolute right-2 top-2 p-1 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Dropdown Footer */}
                    <div className="px-4 py-3 border-t border-border bg-muted/20 shrink-0">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate("/dashboard/notifications");
                        }}
                        className="w-full flex items-center justify-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                      >
                        View All Notifications
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleTheme}
              className="hidden md:flex p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 shadow-sm"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setShowLogoutWarning(true)}
              className="hidden md:flex px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200 font-medium text-sm items-center space-x-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">{children}</main>
      </div>

      {/* Logout Warning Modal */}
      <AnimatePresence>
        {showLogoutWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowLogoutWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-sm p-6 rounded-2xl shadow-xl border border-border flex flex-col"
            >
              <div className="flex items-center space-x-3 text-red-500 mb-4">
                <LogOut className="w-6 h-6" />
                <h3 className="text-xl font-bold text-foreground">
                  Confirm Logout
                </h3>
              </div>
              <p className="text-muted-foreground mb-6 text-sm flex-1">
                Are you sure you want to log out? You will need to sign in again
                to access the dashboard.
              </p>
              <div className="flex items-center justify-end space-x-3 mt-auto">
                <button
                  onClick={() => setShowLogoutWarning(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium text-sm flex items-center space-x-2 shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
