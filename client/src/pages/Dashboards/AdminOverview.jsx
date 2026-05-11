import React from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import {
  FileText,
  CreditCard,
  Users,
  ClipboardCheck,
  GraduationCap,
  Stamp,
  ShieldCheck,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Globe,
  Briefcase,
} from "lucide-react";

const StatItem = ({ label, value, color = "blue" }) => {
  const dotColors = {
    blue: "bg-blue-500 shadow-blue-500/50",
    emerald: "bg-emerald-500 shadow-emerald-500/50",
    purple: "bg-purple-500 shadow-purple-500/50",
    amber: "bg-amber-500 shadow-amber-500/50",
    rose: "bg-rose-500 shadow-rose-500/50",
    cyan: "bg-cyan-500 shadow-cyan-500/50",
    slate: "bg-slate-500 shadow-slate-500/50",
    teal: "bg-teal-500 shadow-teal-500/50",
  };

  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-1.5 h-1.5 rounded-full ${dotColors[color]} shadow-[0_0_8px]`}
        />
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {label}
        </span>
      </div>
      <span className="text-sm font-bold font-mono bg-muted px-2 py-0.5 rounded-md">
        {value || 0}
      </span>
    </motion.div>
  );
};

const SectionCard = ({ title, items, icon: Icon, color = "blue" }) => {
  const colorVariants = {
    blue: "from-blue-500/20 to-indigo-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400",
    emerald:
      "from-emerald-500/20 to-teal-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    purple:
      "from-purple-500/20 to-violet-500/5 border-purple-500/20 text-purple-600 dark:text-purple-400",
    amber:
      "from-amber-500/20 to-orange-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400",
    rose: "from-rose-500/20 to-pink-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400",
    cyan: "from-cyan-500/20 to-sky-500/5 border-cyan-500/20 text-cyan-600 dark:text-cyan-400",
    slate:
      "from-slate-500/20 to-gray-500/5 border-slate-500/20 text-slate-600 dark:text-slate-400",
    teal: "from-teal-500/20 to-emerald-500/5 border-teal-500/20 text-teal-600 dark:text-teal-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group h-full flex flex-col"
    >
      <div
        className={`p-6 bg-gradient-to-br ${colorVariants[color]} border-b border-inherit`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-background/80 backdrop-blur-sm rounded-2xl shadow-sm">
            <Icon
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground uppercase tracking-widest text-[11px] opacity-70 mb-0.5">
              Category
            </h3>
            <h2 className="text-xl font-black text-foreground leading-tight">
              {title}
            </h2>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-1 flex-grow">
        {items.map((item, index) => (
          <StatItem key={index} label={item} color={color} />
        ))}
      </div>

      <div className="p-4 pt-0">
        <div className="h-px w-full bg-border/50 mb-4" />
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
            Total Metrics
          </span>
          <div
            className={`h-1.5 w-1.5 rounded-full animate-pulse ${
              color === "blue"
                ? "bg-blue-500/50"
                : color === "emerald"
                  ? "bg-emerald-500/50"
                  : color === "purple"
                    ? "bg-purple-500/50"
                    : color === "amber"
                      ? "bg-amber-500/50"
                      : color === "rose"
                        ? "bg-rose-500/50"
                        : color === "cyan"
                          ? "bg-cyan-500/50"
                          : color === "slate"
                            ? "bg-slate-500/50"
                            : "bg-teal-500/50"
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};

const AdminOverview = () => {
  const sections = [
    {
      title: "Application",
      icon: FileText,
      color: "blue",
      items: [
        "New Application",
        "Application On Review",
        "Application Rejected",
        "Application Approved",
      ],
    },
    {
      title: "Course Fee",
      icon: CreditCard,
      color: "emerald",
      items: [
        "Total Fee",
        "Fees To Be Paid",
        "Partial Fee Paid",
        "Course Fee Completed",
      ],
    },
    {
      title: "Student",
      icon: Users,
      color: "purple",
      items: [
        "To Be Enrolled",
        "Enrollment On Progress",
        "Enrolled Students",
        "Enrollment Cancelled",
      ],
    },
    {
      title: "Mandatory Documents",
      icon: ClipboardCheck,
      color: "amber",
      items: [
        "Whole Fees Paid",
        "Partial Fees Paid",
        "Fees Pending",
        "Pending Applications",
        "Application On Progress",
        "Documents Received",
        "Documents Sent Courier",
      ],
    },
    {
      title: "Optional Certificates",
      icon: GraduationCap,
      color: "rose",
      items: [
        "Job In India Documents",
        "Job Abroad Documents",
        "Study In India Documents",
        "Study Abroad Documents",
        "Whole Fees Paid",
        "Partial Fees Paid",
        "Fees Pending",
        "Pending Applications",
        "Application On Progress",
        "Documents Received",
        "Documents Sent Courier",
      ],
    },
    {
      title: "Final Degree",
      icon: Package,
      color: "cyan",
      items: [
        "Whole Fees Paid",
        "Partial Fees Paid",
        "Fees Pending",
        "Pending Applications",
        "Application On Progress",
        "Documents Received",
        "Documents Sent Courier",
      ],
    },
    {
      title: "Embassy Attestation",
      icon: Stamp,
      color: "slate",
      items: [
        "Embassy Fees Paid",
        "Fees Pending",
        "Pending Applications",
        "Embassy Attestation On Progress",
        "Stamped Doc Received",
        "Doc Sent Courier",
      ],
    },
    {
      title: "Verification",
      icon: ShieldCheck,
      color: "teal",
      items: [
        "Verification Works Pending",
        "Verification On Progress",
        "Verification Completed",
        "Verification & Courier Fee Paid",
        "Verification Sent",
        "Verification Completed",
      ],
    },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp size={14} />
              <span>System Insights</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight">
              Dashboard Overview
            </h2>
            <p className="text-muted-foreground font-medium">
              Real-time monitoring of applications, student progress, and
              administrative workflows.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-card border border-border p-2 rounded-2xl shadow-sm">
            <div className="px-4 py-2 text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Last Updated
              </p>
              <p className="text-sm font-bold">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="w-px h-10 bg-border" />
            <button className="p-3 bg-primary text-primary-foreground rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
              <Clock size={20} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sections.map((section, index) => (
            <SectionCard key={index} {...section} />
          ))}
        </div>

        {/* Quick Actions or Summary Footer could go here */}
      </div>
    </DashboardLayout>
  );
};

export default AdminOverview;
