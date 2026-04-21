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
} from "lucide-react";
import { useTheme } from "../global/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { cn } from "./StatCard";

const Sidebar = ({
  isOpen,
  active,
  setActive,
  setSidebarOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "partners", label: "Partners", icon: UserPlus },
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
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActive(item.id);
                setSidebarOpen(false);
              }}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center rounded-lg transition-all duration-200",
                isCollapsed ? "justify-center py-3" : "space-x-3 px-3 py-2.5",
                active === item.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon
                className={cn("shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")}
              />
              {!isCollapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </button>
          ))}
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
                  User
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
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);

  const confirmLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar
        isOpen={sidebarOpen}
        active={activeTab}
        setActive={setActiveTab}
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
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
