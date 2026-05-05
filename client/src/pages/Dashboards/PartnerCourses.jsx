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
  Info
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
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  const categories = ["All", ...new Set(courses.map(c => c.type))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (course.program?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.program?.university?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout title="Available Courses">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Permitted Courses</h2>
            <p className="text-muted-foreground mt-2">
              Browse and explore programs you are authorized to enroll students in.
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
            
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-1 shadow-sm overflow-x-auto max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[300px] rounded-2xl bg-muted animate-pulse border border-border" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border border-dashed rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No courses found</h3>
            <p className="text-muted-foreground max-w-xs mt-2">
              Hey {user?.fullName || user?.centerName} ({user?._id || user?.id}), we couldn't find any courses matching your criteria or you don't have any permissions yet.
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
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider">
                      {course.type}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {course.program?.name} - {course.name}
                  </h3>
                  
                  <div className="flex items-center text-muted-foreground mb-4">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium truncate">{course.program?.university?.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2 text-primary/60" />
                      {course.duration}
                    </div>
                    <div className="flex items-center text-sm font-bold text-primary">
                      <CreditCard className="w-4 h-4 mr-2 text-primary/60" />
                      ₹{course.fee?.totalFee?.toLocaleString() || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-tighter font-bold text-muted-foreground">Registration Fee</span>
                    <span className="text-sm font-bold text-foreground">₹{course.fee?.applicationFee?.toLocaleString() || "0"}</span>
                  </div>
                  <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PartnerCourses;
