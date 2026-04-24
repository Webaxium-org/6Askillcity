import React, { useState } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { StatCard, cn } from "../../components/dashboard/StatCard";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Dummy Students Data for Partner Portal
const DUMMY_STUDENTS = [
  {
    id: "STU-801",
    name: "Vikram Reddy",
    course: "Advanced UI/UX",
    status: "Active",
    date: "2026-04-20",
    email: "vikram.r@example.com",
    progress: 75,
  },
  {
    id: "STU-802",
    name: "Sneha Nair",
    course: "Full Stack Development",
    status: "Pending",
    date: "2026-04-19",
    email: "sneha.n@example.com",
    progress: 0,
  },
  {
    id: "STU-803",
    name: "Arjun Verma",
    course: "Cloud Architecture",
    status: "Active",
    date: "2026-04-18",
    email: "arjun.v@example.com",
    progress: 45,
  },
  {
    id: "STU-804",
    name: "Riya Kapoor",
    course: "Digital Marketing",
    status: "Active",
    date: "2026-04-15",
    email: "riya.k@example.com",
    progress: 90,
  },
  {
    id: "STU-805",
    name: "Manish Tiwari",
    course: "Data Science Bootcamp",
    status: "Graduated",
    date: "2025-10-10",
    email: "manish.t@example.com",
    progress: 100,
  },
];

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = DUMMY_STUDENTS.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <DashboardLayout title="Partner Center">
      <div className="space-y-8">
        {/* KPI Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Total Enrolled"
            value="142"
            icon={Users}
            trend={8.5}
            subtext="Lifetime students"
            color="blue"
          />
          <StatCard
            title="Active Sessions"
            value="89"
            icon={Activity}
            trend={12.4}
            subtext="Currently attending"
            color="emerald"
          />
          <StatCard
            title="Available Courses"
            value="24"
            icon={BookOpen}
            trend={1}
            subtext="Ready to assign"
            color="purple"
          />
          <StatCard
            title="Upcoming Batches"
            value="3"
            icon={CalendarDays}
            trend={-1.2}
            subtext="Starting next week"
            color="rose"
          />
        </motion.div>

        {/* Primary Data Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card border border-border rounded-xl shadow-sm flex flex-col"
        >
          {/* Header & Controls */}
          <div className="px-4 sm:px-6 py-5 border-b border-border flex flex-col gap-4">
            {/* Title row with Add button */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500 shrink-0" />
                  <span>Applications</span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage and track your submitted applications.
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/applications")}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm font-medium text-sm whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">View All Applications</span>
              </button>
            </div>

            {/* Search & Filter row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-muted/50 border border-transparent focus:bg-background focus:border-border outline-none text-sm transition-all w-full"
                />
              </div>
              <button className="p-2 rounded-xl bg-muted/50 border border-transparent hover:border-border text-foreground transition-all shrink-0">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Applicant Details
                  </th>
                  <th className="hidden sm:table-cell px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Assigned Course
                  </th>
                  <th className="hidden md:table-cell px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                          <Search className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                        No students found matching your search.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={student.id}
                      className="hover:bg-muted/50 transition-colors group cursor-pointer"
                    >
                      {/* Student Details */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-foreground font-bold shadow-sm shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground text-sm truncate">
                              {student.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">
                              {student.email}
                            </div>
                            {/* Course shown inline on xs when column is hidden */}
                            <div className="sm:hidden text-xs text-primary/80 mt-1 font-medium truncate">
                              {student.course}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Course — hidden on xs */}
                      <td className="hidden sm:table-cell px-6 py-4">
                        <span className="text-sm font-medium text-foreground">
                          {student.course}
                        </span>
                        <div className="w-24 h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              student.progress === 100
                                ? "bg-emerald-500"
                                : "bg-blue-500",
                            )}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </td>

                      {/* Enrollment Date — hidden below md */}
                      <td className="hidden md:table-cell px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(student.date).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border whitespace-nowrap",
                            student.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : student.status === "Pending"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-primary/10 text-primary border-primary/20",
                          )}
                        >
                          {student.status === "Graduated" && (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {student.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="px-4 sm:px-6 py-4 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              Showing {filteredStudents.length} of {DUMMY_STUDENTS.length}{" "}
              applications
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-50">
                Prev
              </button>
              <button className="px-3 py-1 rounded bg-muted font-medium">
                1
              </button>
              <button className="px-3 py-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
