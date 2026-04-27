import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  LogOut,
  Menu,
  User,
  LayoutDashboard,
  Users,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Bell,
  Check,
  FileText,
  Clock,
  MessageSquare,
  Building2,
  BadgeDollarSign,
  CreditCard,
} from "lucide-react";
import { useTheme } from "../global/ThemeProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "./StatCard";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "../../redux/userSlice";
import { addNotification, markAllAsRead } from "../../redux/notificationSlice";
import { showAlert } from "../../redux/alertSlice";
import { useSocket } from "../../context/SocketContext";

const Sidebar = ({ isOpen, setSidebarOpen, isCollapsed, setIsCollapsed }) => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    // Partner specific
    ...(user?.type === "partner"
      ? [
          {
            id: "applications",
            label: "Applications",
            icon: FileText,
            path: "/dashboard/applications",
          },
          {
            id: "profile",
            label: "My Profile",
            icon: User,
            path: "/dashboard/profile",
          },
        ]
      : []),
    // Admin specific
    ...(user?.type === "admin"
      ? [
          {
            id: "eligibility",
            label: "Eligibility Queue",
            icon: Clock,
            path: "/dashboard/eligibility-queue",
          },
          {
            id: "universities",
            label: "University Management",
            icon: Building2,
            path: "/dashboard/university-management",
          },
          {
            id: "partners",
            label: "Partner Management",
            icon: UserPlus,
            path: "/dashboard/partner-management",
          },
        ]
      : []),
    {
      id: "tickets",
      label: "Tickets",
      icon: MessageSquare,
      path: "/dashboard/tickets",
    },
    {
      id: "management",
      label: "Student Management",
      icon: Users,
      path: "/dashboard/student-management",
    },
    {
      id: "payments",
      label: "Payment Tracking",
      icon: CreditCard,
      path: "/dashboard/payment-management",
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
          "fixed z-40 top-0 left-0 h-full bg-card border-r border-border shadow-xl transition-all duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <div className="h-16 relative flex items-center px-6 border-b border-border bg-background/50 backdrop-blur-sm justify-center md:justify-start">
          {!isCollapsed ? (
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent truncate w-full">
              6ASkillCity
            </h2>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
              6A
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 hover:bg-muted text-muted-foreground transition-all absolute -right-[15px] top-5 bg-background border border-border shadow-sm rounded-full z-50 hover:text-foreground hover:scale-105"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (location.pathname === "/dashboard" && item.id === "overview");
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "w-full flex items-center rounded-lg transition-all duration-200",
                  isCollapsed ? "justify-center py-3" : "space-x-3 px-3 py-2.5",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "shrink-0",
                    isCollapsed ? "w-6 h-6" : "w-5 h-5",
                  )}
                />
                {!isCollapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div
            className={cn(
              "flex items-center rounded-xl bg-secondary text-secondary-foreground transition-all duration-300",
              isCollapsed ? "justify-center p-2" : "space-x-3 px-3 py-2.5",
            )}
          >
            <User
              className={cn(
                "shrink-0 rounded-full bg-background border border-border shadow-sm text-foreground",
                isCollapsed ? "w-10 h-10 p-2" : "w-8 h-8 p-1.5",
              )}
            />
            {!isCollapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-semibold truncate leading-tight">
                  {user?.fullName || user?.centerName}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5 truncate">
                  Dashboard
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export const DashboardLayout = ({ children, title }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { socket } = useSocket();
  const { items: notifications, unreadCount } = useSelector(
    (state) => state.notifications,
  );

  React.useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      dispatch(addNotification(data));
      dispatch(
        showAlert({
          type: "info",
          message: `${data.title}: ${data.message}`,
        }),
      );
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, dispatch]);

  const confirmLogout = () => {
    dispatch(logOut());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar
        isOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
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
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 shadow-sm"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col max-h-[400px]"
                  >
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                      <h3 className="font-semibold text-foreground">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => dispatch(markAllAsRead())}
                          className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium"
                        >
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center">
                          <Bell className="w-8 h-8 mb-2 opacity-20" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={cn(
                              "p-3 rounded-xl transition-colors cursor-pointer",
                              notif.read
                                ? "bg-transparent hover:bg-muted"
                                : "bg-primary/5 hover:bg-primary/10 border border-primary/10",
                            )}
                            onClick={() => {
                              setShowNotifications(false);
                              if (notif.ticketId) {
                                navigate("/dashboard/tickets");
                              }
                            }}
                          >
                            <h4
                              className={cn(
                                "text-sm mb-0.5",
                                notif.read
                                  ? "font-medium text-foreground"
                                  : "font-bold text-foreground",
                              )}
                            >
                              {notif.title}
                            </h4>
                            <p className="text-xs text-muted-foreground break-words">
                              {notif.message}
                            </p>
                            {!notif.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 shadow-sm"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setShowLogoutWarning(true)}
              className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200 font-medium text-sm flex items-center space-x-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
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
