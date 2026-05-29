import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { getPublicBranches } from "../../api/university.api";
import { useDispatch } from "react-redux";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// Simplified cn utility for class merging
const cn = (...classes) => classes.filter(Boolean).join(" ");

const SpecializationDetails = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programInfo, setProgramInfo] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await getPublicBranches(programId);
        if (res.success) {
          setBranches(res.data);
          // Set parent program information from the first branch returned
          if (res.data.length > 0 && res.data[0].program) {
            setProgramInfo(res.data[0].program);
          }
        }
      } catch (err) {
        console.error("Failed to load specialization details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [programId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow pt-24 pb-20 relative overflow-hidden">
        {/* Ambient Glowing Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#17468C]/5 rounded-full blur-[100px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-[#B82424]/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/4 translate-y-1/4" />

        <div className="container mx-auto px-6 relative z-10 max-w-4xl">
          {/* Back Navigation Bar */}
          <div className="mb-10">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-border text-sm font-bold shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-300 text-foreground/80 hover:text-foreground cursor-pointer group"
            >
              <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
              Back to Programs
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                Loading branches & fees...
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Hero Specialization Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group border border-white/5"
              >
                {/* Decorative glowing orb inside card */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#17468C]/30 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#B82424]/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

                <div className="relative z-10 space-y-4">
                  <span className="inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-blue-300 border border-white/10">
                    {programInfo?.programType || "Specialization"}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    {programInfo?.name || "Program Details"}
                  </h1>
                  <p className="text-lg text-white/70 leading-relaxed font-medium">
                    Offered by <span className="text-white font-extrabold underline decoration-[#17468C] decoration-4 underline-offset-4">{programInfo?.university?.name || "The Global University"}</span>
                  </p>
                  <div className="flex items-center gap-3 pt-4 text-xs font-bold text-white/50 uppercase tracking-widest">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    UGC Approved Program Structure
                  </div>
                </div>
              </motion.div>

              {/* Branches Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-foreground">Available Branches</h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-0.5">
                      Choose your professional track or stream
                    </p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-slate-200/50 text-foreground font-bold text-xs">
                    {branches.length} Tracks Available
                  </span>
                </div>

                {branches.length === 0 ? (
                  <div className="p-12 text-center bg-white border border-border rounded-3xl space-y-3">
                    <BookOpen size={48} className="mx-auto text-muted-foreground/30" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      No branches available for this specialization.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {branches.map((branch, idx) => (
                      <motion.div
                        key={branch._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="bg-white border border-border/80 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 rounded-3xl p-6 md:p-8 transition-all duration-300 relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        <div className="space-y-4 flex-grow">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">
                              {branch.type || "Skilled"}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                              <Calendar size={14} />
                              {branch.duration}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                              {branch.name}
                            </h3>
                          </div>
                        </div>

                        {/* Fee Grid (If fees are set) */}
                        {branch.currentFee ? (
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:text-right shrink-0 flex md:flex-col justify-between items-center md:items-end gap-2 min-w-[160px]">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                              Total Course Fee
                            </p>
                            <div>
                              <p className="text-xl font-black text-foreground">
                                ₹{branch.currentFee.totalFee?.toLocaleString()}
                              </p>
                              <p className="text-[9px] font-bold text-muted-foreground mt-0.5">
                                (Tuition: ₹{branch.currentFee.tuitionFee?.toLocaleString()})
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:text-right shrink-0 flex md:flex-col justify-between items-center md:items-end gap-2 min-w-[160px]">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                              Admission Status
                            </p>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                              Admissions Open
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SpecializationDetails;
