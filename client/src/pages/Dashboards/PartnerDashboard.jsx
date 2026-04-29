import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { StatCard } from "../../components/dashboard/StatCard";
import {
  Users,
  BookOpen,
  CalendarDays,
  Briefcase,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Activity,
  CheckCircle,
  CreditCard,
  MessageSquare,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getPartnerDashboardStats } from "../../api/partner.api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");
const PARTNER_MONTHLY_TARGET = 10;

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedHalf, setSelectedHalf] = useState(
    new Date().getMonth() < 6 ? "H1" : "H2",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [selectedYear, selectedHalf]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getPartnerDashboardStats(selectedYear, selectedHalf);
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch partner stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const summary = stats?.summary || {};
  const recentApplications = stats?.recentApplications || [];
  const recentStudents = stats?.recentStudents || [];
  const enrollmentData = stats?.enrollmentData || [];
  const revenueData = stats?.revenueChartData || [];

  // Calculate current month's progress
  const currentMonthEnrollment =
    enrollmentData.length > 0
      ? enrollmentData[enrollmentData.length - 1].students
      : 0;
  const targetProgress = Math.min(
    (currentMonthEnrollment / PARTNER_MONTHLY_TARGET) * 100,
    100,
  );
  const isTargetMet = currentMonthEnrollment >= PARTNER_MONTHLY_TARGET;

  return (
    <DashboardLayout title="Partner Dashboard">
      <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              Partner Overview
            </h2>
            <p className="text-muted-foreground font-medium">
              Real-time student recruitment and application tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard/student/add")}
              className="group relative flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <UserPlus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">New Application</span>
            </button>
            <button
              onClick={() =>
                navigate("/dashboard/tickets", {
                  state: { openNewTicket: true },
                })
              }
              className="group relative flex items-center gap-2 px-6 py-3 rounded-2xl bg-card border border-border text-foreground font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <MessageSquare className="w-4 h-4 text-rose-500 relative z-10" />
              <span className="relative z-10">New Ticket</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Applications"
            value={loading ? "..." : summary.totalApplications || 0}
            icon={Briefcase}
            subtext="All submitted requests"
            color="blue"
            onClick={() => navigate("/dashboard/applications")}
          />
          <StatCard
            title="Total Enrolled"
            value={loading ? "..." : summary.totalStudents || 0}
            icon={Users}
            subtext="Lifetime student count"
            color="purple"
            onClick={() => navigate("/dashboard/student-management")}
          />
          <StatCard
            title="Total Earnings"
            value={
              loading
                ? "..."
                : `₹${summary.totalRevenue?.toLocaleString() || 0}`
            }
            icon={CreditCard}
            subtext="Commission & collections"
            color="emerald"
            onClick={() => navigate("/dashboard/payment-management")}
          />
          <StatCard
            title="Active Support"
            value={loading ? "..." : summary.activeTickets || 0}
            icon={MessageSquare}
            subtext="Open help desk tickets"
            color="rose"
            onClick={() => navigate("/dashboard/tickets")}
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Area Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-4 sm:p-8 shadow-sm flex flex-col min-h-[400px]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-xl font-black">Revenue Performance</h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Monthly fee collection trends
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-muted transition-colors"
                >
                  {[0, 1, 2, 3].map((i) => {
                    const y = new Date().getFullYear() - i;
                    return (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    );
                  })}
                </select>
                <select
                  value={selectedHalf}
                  onChange={(e) => setSelectedHalf(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-muted transition-colors"
                >
                  <option value="H1">Jan to June</option>
                  <option value="H2">July to Dec</option>
                </select>
              </div>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--primary)"
                        stopOpacity={0.1}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "1rem",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ fontWeight: 800, marginBottom: "0.25rem" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Enrollment Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-[2.5rem] p-4 sm:p-8 shadow-sm flex flex-col min-h-[400px]"
          >
            <div className="mb-8">
              <h3 className="text-xl font-black">Recruitment Activity</h3>
              <p className="text-sm text-muted-foreground font-medium">
                New eligible enrollments
              </p>
            </div>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "var(--primary)", opacity: 0.05 }}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "1rem",
                    }}
                  />
                  <Bar dataKey="students" radius={[6, 6, 0, 0]} barSize={30}>
                    {enrollmentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill="var(--primary)"
                        fillOpacity={0.4 + index * 0.12}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                <span>Monthly Target ({PARTNER_MONTHLY_TARGET})</span>
                <span
                  className={isTargetMet ? "text-emerald-500" : "text-primary"}
                >
                  {currentMonthEnrollment} / {PARTNER_MONTHLY_TARGET} (
                  {Math.round(targetProgress)}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-1000",
                    isTargetMet ? "bg-emerald-500" : "bg-primary",
                  )}
                  style={{ width: `${targetProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Data Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden flex flex-col"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <span>Recent Applications</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Last 5 submissions
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/applications")}
                className="text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentApplications.map((app) => (
                    <tr
                      key={app._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{app.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold">
                          {app.program?.name || "N/A"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {app.university?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            app.applicationStatus === "Eligible"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : app.applicationStatus === "Rejected"
                                ? "bg-rose-500/10 text-rose-500"
                                : "bg-amber-500/10 text-amber-500",
                          )}
                        >
                          {app.applicationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentApplications.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-10 text-center text-muted-foreground text-sm font-medium"
                      >
                        No recent applications found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Enrolled Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden flex flex-col"
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span>Enrolled Students</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Recently approved
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/student-management")}
                className="text-xs font-black uppercase tracking-widest text-purple-500 hover:text-purple-400 flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentStudents.map((stu) => (
                    <tr
                      key={stu._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs">
                            {stu.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{stu.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {stu.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            stu.paymentStatus === "Paid"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : stu.paymentStatus === "Partially Paid"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-rose-500/10 text-rose-500",
                          )}
                        >
                          {stu.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold mb-1">
                            {stu.progress || 0}%
                          </span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${stu.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recentStudents.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-10 text-center text-muted-foreground text-sm font-medium"
                      >
                        No enrolled students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
