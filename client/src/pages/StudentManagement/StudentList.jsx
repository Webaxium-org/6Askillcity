import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  GraduationCap, 
  Building2, 
  BadgeDollarSign,
  ArrowUpDown,
  Download,
  Mail,
  MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getManagementStudents } from "../../api/payment.api";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";

export default function StudentList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getManagementStudents();
      if (res.success) {
        setStudents(res.data);
      }
    } catch (error) {
      dispatch(showAlert({ 
        type: "error", 
        message: "Failed to load student management list" 
      }));
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.university?.name.toLowerCase().includes(search.toLowerCase()) ||
    s.program?.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Partially Paid": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const totals = students.reduce((acc, curr) => ({
    total: acc.total + 1,
    paid: acc.paid + curr.totalFeePaid,
    pending: acc.pending + ((curr.programFee?.totalFee || 0) - curr.totalFeePaid)
  }), { total: 0, paid: 0, pending: 0 });

  return (
    <DashboardLayout title="Student Management">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <Users className="w-7 h-7" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Students</p>
                 <h4 className="text-2xl font-black">{totals.total}</h4>
              </div>
           </div>
           <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                 <BadgeDollarSign className="w-7 h-7" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Collected</p>
                 <h4 className="text-2xl font-black">₹{totals.paid.toLocaleString()}</h4>
              </div>
           </div>
           <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                 <BadgeDollarSign className="w-7 h-7" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Pending</p>
                 <h4 className="text-2xl font-black">₹{totals.pending.toLocaleString()}</h4>
              </div>
           </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card border border-border p-4 rounded-[2rem] shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, university or program..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-muted/30 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-muted text-sm font-bold transition-all">
                <Filter className="w-4 h-4" />
                Filters
             </button>
             <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                <Download className="w-4 h-4" />
                Export CSV
             </button>
          </div>
        </div>

        {/* Table/Card Container */}
        <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    <div className="flex items-center gap-2">
                       Student Info <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">University & Program</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Payment Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Fee Progress</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                   <tr>
                      <td colSpan="5" className="px-8 py-20">
                         <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="font-bold uppercase tracking-tighter text-xs">Fetching Dataset...</p>
                         </div>
                      </td>
                   </tr>
                ) : filteredStudents.length === 0 ? (
                   <tr>
                      <td colSpan="5" className="px-8 py-20 text-center space-y-3">
                         <Users className="w-12 h-12 mx-auto opacity-10" />
                         <p className="text-muted-foreground font-medium">No students found matching your criteria.</p>
                      </td>
                   </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const totalFee = student.programFee?.totalFee || 1;
                    const percent = Math.round((student.totalFeePaid / totalFee) * 100);
                    
                    return (
                      <motion.tr
                        key={student._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.01 }}
                        onClick={() => navigate(`/dashboard/student-management/${student._id}`)}
                        className="group hover:bg-muted/20 cursor-pointer transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg group-hover:scale-110 transition-transform">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{student.name}</p>
                              <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" /> {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                                 <Building2 className="w-3.5 h-3.5 text-primary" />
                                 <span className="truncate max-w-[150px]">{student.university?.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                 <GraduationCap className="w-3.5 h-3.5" />
                                 <span className="truncate max-w-[150px]">{student.program?.name}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(student.paymentStatus)}`}>
                             {student.paymentStatus}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right min-w-[200px]">
                           <div className="space-y-1.5 inline-block w-full max-w-[180px]">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                                 <span>₹{student.totalFeePaid.toLocaleString()}</span>
                                 <span>{percent}%</span>
                              </div>
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50 p-[1px]">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${percent}%` }}
                                   className={`h-full rounded-full ${percent === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                 />
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button className="p-3 rounded-2xl bg-muted/50 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                              <ChevronRight className="w-4 h-4" />
                           </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border/50">
             {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                   <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                   <p className="text-[10px] font-black uppercase text-muted-foreground">Loading Students...</p>
                </div>
             ) : filteredStudents.length === 0 ? (
                <div className="py-12 text-center">
                   <p className="text-sm text-muted-foreground font-bold">No students found.</p>
                </div>
             ) : (
                filteredStudents.map((student, idx) => {
                  const totalFee = student.programFee?.totalFee || 1;
                  const percent = Math.round((student.totalFeePaid / totalFee) * 100);
                  
                  return (
                    <motion.div 
                      key={student._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.01 }}
                      onClick={() => navigate(`/dashboard/student-management/${student._id}`)}
                      className="p-6 space-y-4 active:bg-muted/20 transition-colors"
                    >
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                {student.name.charAt(0)}
                             </div>
                             <div>
                                <h4 className="text-sm font-black">{student.name}</h4>
                                <p className="text-[10px] font-bold text-muted-foreground">{student.email}</p>
                             </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">University</p>
                             <p className="text-[10px] font-bold truncate">{student.university?.name}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Status</p>
                             <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(student.paymentStatus)}`}>
                               {student.paymentStatus}
                             </span>
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground">
                             <span>Paid: ₹{student.totalFeePaid.toLocaleString()}</span>
                             <span>{percent}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                             <div 
                                style={{ width: `${percent}%` }}
                                className={`h-full rounded-full ${percent === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                             />
                          </div>
                       </div>
                    </motion.div>
                  );
                })
             )}
          </div>
          
          {/* Table Footer / Pagination Placeholder */}
          <div className="p-6 bg-muted/10 border-t border-border flex items-center justify-between">
             <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Showing {filteredStudents.length} of {students.length} Students
             </p>
             <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-xl border border-border bg-card text-xs font-bold disabled:opacity-50">Previous</button>
                <div className="flex items-center gap-1">
                   <button className="w-8 h-8 rounded-xl bg-primary text-primary-foreground text-xs font-black">1</button>
                </div>
                <button className="px-4 py-2 rounded-xl border border-border bg-card text-xs font-bold disabled:opacity-50">Next</button>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
