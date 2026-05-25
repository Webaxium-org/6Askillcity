import React, { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  Clock,
  Calendar,
  CreditCard,
  Filter,
  GraduationCap,
  Building2,
  ChevronRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { getPermittedCourses } from "../../api/partner.api";

const PartnerCourses = () => {
  const { user } = useSelector((state) => state.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDetailCourse, setActiveDetailCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getPermittedCourses();
        if (response.success) {
          setCourses(response.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.program?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (course.program?.university?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout title="Available Courses">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              Permitted Courses
            </h2>
            <p className="text-muted-foreground mt-2">
              Browse and explore programs you are authorized to enroll students
              in.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses or universities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[300px] rounded-2xl bg-muted animate-pulse border border-border"
              />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border border-dashed rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              No courses found
            </h3>
            <p className="text-muted-foreground max-w-xs mt-2">
              Hey {user?.fullName || user?.centerName} ({user?._id || user?.id}
              ), we couldn't find any courses matching your criteria or you
              don't have any permissions yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:border-primary/50 transition-all duration-300 flex flex-col relative"
              >
                {/* Visual Accent */}
                <div className="h-2 w-full bg-gradient-to-r from-primary/80 to-blue-500/80" />

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {course.program?.programType === "Masters Degree" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-wider border border-emerald-500/15">
                          Masters Degree
                        </span>
                      ) : course.program?.programType === "Skill Programs" ||
                        course.program?.programType === "skill" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[9px] font-black uppercase tracking-wider border border-purple-500/15">
                          Skill Programs
                        </span>
                      ) : course.program?.programType === "Skill Test" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase tracking-wider border border-amber-500/15">
                          Skill Test
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase tracking-wider border border-blue-500/15">
                          Bachelors Degree
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        course.program?.mode === "On-Campus"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/15"
                          : course.program?.mode === "Skill Based"
                            ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/15"
                            : "bg-slate-500/10 text-slate-600 border-slate-500/15"
                      }`}>
                        {course.program?.mode || "External"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-muted-foreground mb-3">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span className="text-sm font-semibold truncate">
                      {course.program?.university?.name}
                    </span>
                  </div>

                  <div className="mb-2.5">
                    <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider block mb-0.5">
                      Course Name
                    </span>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {course.program?.name}
                    </h3>
                  </div>

                  <div className="mb-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider block mb-0.5">
                      Branch Name
                    </span>
                    <p className="text-sm font-semibold text-foreground/70 line-clamp-1">
                      {course.name}
                    </p>
                  </div>

                  {course.program?.eligibilityChecklist &&
                  course.program.eligibilityChecklist.length > 0 ? (
                    <div className="mb-4 space-y-1.5 flex-1">
                      <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider block">
                        Eligibility Documents
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto scrollbar-thin pr-1">
                        {course.program.eligibilityChecklist.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-muted text-[9px] font-bold text-muted-foreground border border-border/80 flex items-center gap-1"
                          >
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 flex-1" />
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-auto border-t border-border/50 pt-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider block mb-0.5">
                        Duration
                      </span>
                      <div className="flex items-center text-xs font-semibold text-foreground/80">
                        <Clock className="w-3.5 h-3.5 mr-1 text-primary/60" />
                        {course.duration}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-muted-foreground/80 tracking-wider block mb-0.5">
                        Total Fee
                      </span>
                      <div className="flex items-center text-xs font-bold text-primary">
                        <CreditCard className="w-3.5 h-3.5 mr-1 text-primary/60" />₹
                        {course.fee?.totalFee?.toLocaleString() || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-tighter font-bold text-muted-foreground">
                      Registration Fee
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      ₹{course.fee?.applicationFee?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveDetailCourse(course)}
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                    title="View Course Details"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Premium Detail Modal */}
        <AnimatePresence>
          {activeDetailCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card w-full max-w-lg p-6 rounded-2xl shadow-xl border border-border max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      Course Overview
                    </span>
                    <h3 className="text-2xl font-bold text-foreground mt-2">
                      {activeDetailCourse.program?.name}
                    </h3>
                    <p className="text-sm font-semibold text-muted-foreground mt-0.5">
                      {activeDetailCourse.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveDetailCourse(null)}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* University Card */}
                  <div className="p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          University
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {activeDetailCourse.program?.university?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border bg-muted/20">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                            Course Type
                          </span>
                          <span className="text-sm font-bold text-foreground capitalize">
                            {activeDetailCourse.program?.programType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-muted/20">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                            Duration
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            {activeDetailCourse.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-muted/20 col-span-2">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                            Mode
                          </span>
                          <span className="text-sm font-bold text-foreground capitalize">
                            {activeDetailCourse.program?.mode || "External"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fees Section */}
                  <div className="p-5 rounded-xl border border-border bg-muted/30">
                    <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider mb-3">
                      Fee Breakdown
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Registration / Application Fee
                        </span>
                        <span className="font-bold text-foreground">
                          ₹
                          {activeDetailCourse.fee?.applicationFee?.toLocaleString() ||
                            "0"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Tuition / Program Fee
                        </span>
                        <span className="font-bold text-foreground">
                          ₹
                          {activeDetailCourse.fee?.tuitionFee?.toLocaleString() ||
                            "0"}
                        </span>
                      </div>
                      <div className="h-px bg-border my-1" />
                      <div className="flex justify-between items-center">
                        <span className="font-black text-xs uppercase text-primary">
                          Total Course Fee
                        </span>
                        <span className="text-lg font-black text-primary">
                          ₹
                          {activeDetailCourse.fee?.totalFee?.toLocaleString() ||
                            "0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Eligibility Checklist */}
                  <div>
                    <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider mb-3">
                      Required Eligibility Documents
                    </h4>
                    {activeDetailCourse.program?.eligibilityChecklist &&
                    activeDetailCourse.program.eligibilityChecklist.length >
                      0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {activeDetailCourse.program.eligibilityChecklist.map(
                          (item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border bg-muted/10 text-xs font-medium text-foreground leading-normal"
                            >
                              <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                                ✓
                              </span>
                              <span>{item}</span>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-border border-dashed text-center text-xs text-muted-foreground italic">
                        No specific checklist required.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-6 mt-6 border-t border-border">
                  <button
                    onClick={() => setActiveDetailCourse(null)}
                    className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg"
                  >
                    Close Details
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default PartnerCourses;
