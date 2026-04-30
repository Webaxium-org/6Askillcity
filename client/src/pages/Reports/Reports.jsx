import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import {
  BarChart3,
  Calendar,
  Layers,
  CreditCard,
  BookOpen,
  GraduationCap,
  FileText,
  FileCheck,
  Files,
  ClipboardCheck,
  FileSignature,
  FileUp,
  MapPin,
  TrendingUp,
  Search,
  ChevronRight,
  Filter,
  PieChart,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

const reportCategories = [
  { id: "all", label: "All Reports", icon: LayoutGrid },
  { id: "academic", label: "Academic", icon: BookOpen },
  { id: "financial", label: "Financial & Analytics", icon: BarChart3 },
  { id: "documents", label: "Documentation", icon: Files },
  { id: "admissions", label: "Admissions", icon: TrendingUp },
];

const reports = [
  // Analytics
  {
    id: "financial-report",
    title: "Financial Distribution Report",
    description: "Revenue breakdown: To 6A, to Team, and to University (Percentage wise).",
    category: "financial",
    icon: PieChart,
    color: "bg-emerald-500",
  },

  // Academic
  {
    id: "year-wise",
    title: "Year Wise Report",
    description: "Academic year performance and student enrollment breakdown.",
    category: "academic",
    icon: Calendar,
    color: "bg-indigo-500",
  },
  {
    id: "batch-wise",
    title: "Batch Wise Report",
    description: "Manage and track student cohorts by batch assignments.",
    category: "academic",
    icon: Layers,
    color: "bg-violet-500",
  },
  {
    id: "course-wise",
    title: "Course Wise Report",
    description: "Program popularity and enrollment metrics per course.",
    category: "academic",
    icon: GraduationCap,
    color: "bg-purple-500",
  },
  {
    id: "sem-wise",
    title: "Semester Wise Report",
    description: "Tracking student progress and status across semesters.",
    category: "academic",
    icon: BookOpen,
    color: "bg-sky-500",
  },

  // Documentation
  {
    id: "affidavit",
    title: "Affidavit Report",
    description: "Status and verification tracking for student affidavits.",
    category: "documents",
    icon: FileSignature,
    color: "bg-amber-500",
  },
  {
    id: "migration",
    title: "Migration Report",
    description: "Tracking migration certificates and transfer status.",
    category: "documents",
    icon: FileUp,
    color: "bg-orange-500",
  },
  {
    id: "docs-report",
    title: "Documents Report",
    description: "General verification status for primary student documents.",
    category: "documents",
    icon: Files,
    color: "bg-yellow-500",
  },
  {
    id: "mandatory-docs",
    title: "Mandatory Additional Doc",
    description: "Compliance tracking for required institutional documents.",
    category: "documents",
    icon: FileCheck,
    color: "bg-rose-500",
  },
  {
    id: "optional-docs",
    title: "Optional Additional Doc",
    description: "Review of non-mandatory supplementary documents.",
    category: "documents",
    icon: FileText,
    color: "bg-pink-500",
  },

  // Admissions
  {
    id: "admission-report",
    title: "Admission Intelligence Report",
    description: "Consolidated admission analytics with dynamic date range filtering (Daily, Weekly, Monthly, Yearly).",
    category: "admissions",
    icon: TrendingUp,
    color: "bg-emerald-600",
  },
  {
    id: "center-admission",
    title: "Month Wise Centers Admission",
    description: "Partner center performance breakdown by month.",
    category: "admissions",
    icon: MapPin,
    color: "bg-cyan-500",
  },
  {
    id: "fee-wise",
    title: "Fee Wise Report",
    description: "Detailed financial summary based on student fee categories.",
    category: "financial",
    icon: CreditCard,
    color: "bg-slate-700",
  },
];

export default function Reports() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const handleReportClick = (report) => {
    if (report.id === "fee-wise") {
      navigate("/dashboard/payment-management");
    } else if (report.id === "admission-report") {
      navigate("/dashboard/student-management");
    } else if (report.id === "center-admission") {
      navigate("/dashboard/partner-management");
    } else {
      navigate(`/dashboard/reports/${report.id}`);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesCategory = activeCategory === "all" || report.category === activeCategory;
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout title="Reports Center">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="relative overflow-hidden p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-[3rem] border border-border/50">
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Intelligence Hub</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-[1.1]">
              Operational <span className="text-primary">Intelligence</span> & Reporting
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              Access comprehensive data breakdowns across academic cycles, financial distributions, 
              and administrative compliance metrics.
            </p>
          </div>
          
          {/* Decorative Blobs */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute right-40 bottom-0 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card/50 backdrop-blur-sm p-6 rounded-[2rem] border border-border/50">
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search reports by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-transparent focus:bg-background focus:border-primary/30 rounded-2xl text-sm outline-none transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto">
            <div className="flex items-center gap-1 p-1.5 bg-muted/50 rounded-xl border border-border/50">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "grid" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:bg-card/50"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "list" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:bg-card/50"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted transition-all">
              <Filter className="w-4 h-4" />
              Advanced
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex items-center gap-2 min-w-max">
            {reportCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all relative overflow-hidden group",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                )}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
                {activeCategory === category.id && (
                  <motion.div
                    layoutId="catGlow"
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Display */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredReports.map((report) => (
                <ReportCard key={report.id} report={report} onClick={() => handleReportClick(report)} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {filteredReports.map((report) => (
                <ReportListItem key={report.id} report={report} onClick={() => handleReportClick(report)} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredReports.length === 0 && (
          <div className="py-32 text-center bg-card/30 rounded-[3rem] border border-dashed border-border">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-bold italic">No reports match your current filter.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ReportCard({ report, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group bg-card border border-border rounded-[2.5rem] p-8 text-left hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all relative overflow-hidden"
    >
      <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500", report.color)}>
        <report.icon className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="text-xl font-black mb-3 leading-tight group-hover:text-primary transition-colors">{report.title}</h3>
      <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-8">
        {report.description}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-muted rounded-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {report.category}
        </span>
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.button>
  );
}

function ReportListItem({ report, onClick }) {
  return (
    <motion.button
      whileHover={{ x: 10 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 sm:gap-6 p-4 bg-card/80 border border-border rounded-2xl hover:border-primary/30 hover:bg-card transition-all group overflow-hidden"
    >
      <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0", report.color)}>
        <report.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <h4 className="font-black text-sm sm:text-base group-hover:text-primary transition-colors truncate">{report.title}</h4>
        <p className="text-xs text-muted-foreground font-medium truncate">{report.description}</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-muted rounded-lg text-muted-foreground">
          {report.category}
        </span>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </motion.button>
  );
}
