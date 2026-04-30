import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import {
  ArrowLeft,
  Download,
  Printer,
  FileSpreadsheet,
  Search,
  Filter,
  BarChart,
  Table as TableIcon,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  getAcademicReport,
  getAdmissionReport,
  getDocumentReport,
  getFinancialReport,
  getFeeWiseReport,
} from "../../api/report.api";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export default function ReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [view, setView] = useState("table"); // 'table' or 'chart'

  // Filtering & Ranges
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interval, setInterval] = useState("daily"); // daily, weekly, monthly, yearly

  useEffect(() => {
    fetchReportData();
  }, [reportId, startDate, endDate, interval]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let res;
      switch (reportId) {
        case "year-wise":
          res = await getAcademicReport("year");
          break;
        case "course-wise":
          res = await getAcademicReport("course");
          break;
        case "admission-report":
          res = await getAdmissionReport(interval, { startDate, endDate });
          break;
        case "center-admission":
          res = await getAdmissionReport("center", { startDate, endDate });
          break;
        case "affidavit":
          res = await getDocumentReport("affidavit");
          break;
        case "migration":
          res = await getDocumentReport("migration");
          break;
        case "financial-report":
          res = await getFinancialReport();
          break;
        case "fee-wise":
          res = await getFeeWiseReport();
          break;
        default:
          res = { success: false, message: "Report type not implemented yet" };
      }

      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!data) return [];
    if (reportId === "financial-report") {
      return [
        { name: "6A", value: data.splits.to6A },
        { name: "University", value: data.splits.toUniversity },
        { name: "Admission Point", value: data.splits.toAdmissionPoint },
      ];
    }
    return data.map((item) => ({
      name: item._id || "Unknown",
      count: item.count,
    }));
  };

  const renderTable = () => {
    if (!data) return null;

    if (reportId === "fee-wise") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">
                  Fee Structure
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-center">
                  Students
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-right">
                  Expected (₹)
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-right">
                  Collected (₹)
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-right">
                  Pending (₹)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-bold">
                    {item._id || "No Fee Assigned"}
                  </td>
                  <td className="px-6 py-4 font-black text-center">
                    {item.count}
                  </td>
                  <td className="px-6 py-4 font-black text-right">
                    ₹{item.totalExpected?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-black text-right text-emerald-600">
                    ₹{item.totalPaid?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-black text-right text-rose-600">
                    ₹{(item.totalExpected - item.totalPaid).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (reportId === "financial-report") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">
                  Entity
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-right">
                  Amount (₹)
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-right">
                  Share (%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {Object.entries(data.splits).map(([key, value]) => (
                <tr key={key} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-bold capitalize">
                    {key.replace("to", "")}
                  </td>
                  <td className="px-6 py-4 font-black text-right">
                    ₹{value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-right text-muted-foreground">
                    {Math.round((value / data.total) * 100)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-primary/5">
                <td className="px-6 py-4 font-black">Total Revenue</td>
                <td className="px-6 py-4 font-black text-right text-primary">
                  ₹{data.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 font-black text-right text-primary">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    // Default aggregation table
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">
                Category / Period
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-center">
                Count
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-right">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4 font-bold">{item._id || "N/A"}</td>
                <td className="px-6 py-4 font-black text-center">
                  {item.count}
                </td>
                <td className="px-6 py-4 font-bold text-right text-muted-foreground">
                  {Math.round(
                    (item.count /
                      data.reduce((acc, curr) => acc + curr.count, 0)) *
                      100,
                  )}
                  %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <DashboardLayout title={reportId.replace(/-/g, " ").toUpperCase()}>
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Back and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </button>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Report Content Container */}
        <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
          {/* Controls Bar */}
          <div className="p-6 border-b border-border bg-muted/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 p-1 bg-muted rounded-xl border border-border/50">
                <button
                  onClick={() => setView("table")}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${view === "table" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <TableIcon className="w-4 h-4" />
                  Table
                </button>
                <button
                  onClick={() => setView("chart")}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${view === "chart" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <BarChart className="w-4 h-4" />
                  Visual
                </button>
              </div>

              {(reportId === "admission-report" ||
                reportId === "center-admission") && (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 bg-card border border-border rounded-xl text-[10px] font-bold outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <span className="text-muted-foreground font-bold">to</span>
                  <div className="flex flex-col gap-1">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 bg-card border border-border rounded-xl text-[10px] font-bold outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {reportId === "admission-report" && (
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="px-4 py-2 bg-card border border-border rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:border-primary/50 transition-all cursor-pointer"
                >
                  <option value="daily">Daily View</option>
                  <option value="weekly">Weekly View</option>
                  <option value="monthly">Monthly View</option>
                  <option value="yearly">Yearly View</option>
                </select>
              )}
              <div className="hidden sm:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-muted-foreground animate-pulse">
                  Compiling Report Data...
                </p>
              </div>
            ) : view === "chart" ? (
              <div className="h-[500px] w-full pt-8">
                <ResponsiveContainer width="100%" height="100%">
                  {reportId === "financial-report" ? (
                    <RePieChart>
                      <Pie
                        data={getChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={160}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getChartData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "1rem",
                          border: "none",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </RePieChart>
                  ) : (
                    <ReBarChart data={getChartData()}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(0,0,0,0.05)"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.02)" }}
                        contentStyle={{
                          borderRadius: "1rem",
                          border: "none",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                        barSize={60}
                      >
                        {getChartData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </ReBarChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              renderTable()
            )}
          </div>
        </div>

        {/* Quick Insights Cards */}
        {!loading && data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-card border border-border rounded-[2rem] shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                Total Entries
              </p>
              <p className="text-3xl font-black">
                {reportId === "financial-report"
                  ? "₹" + data.total.toLocaleString()
                  : data.reduce((acc, curr) => acc + curr.count, 0)}
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-[2rem] shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                Report Category
              </p>
              <p className="text-xl font-black text-primary capitalize">
                {reportId.split("-")[0]}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
