import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Clock,
  CheckCircle,
} from "lucide-react";
import { getPublicBranches, getPublicPrograms } from "../../api/university.api";
import { useDispatch } from "react-redux";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// Simplified cn utility for class merging
const cn = (...classes) => classes.filter(Boolean).join(" ");

const subPrograms = [
  {
    id: "post-graduate-certificate",
    name: "Post Graduate Certificate",
    duration: "1 year",
    eligibility: "Any Degree",
  },
  {
    id: "diploma",
    name: "Diploma program",
    duration: "1 year",
    eligibility: "Highscholers / 10 th / Plus two / Graduation.",
  },
  {
    id: "post-diploma",
    name: "Post Diploma program",
    duration: "6 Months | 1 year",
    eligibility: "Sslc/ ITI / ITC / Plus two",
  },
  {
    id: "advanced-diploma",
    name: "Advanced Diploma program",
    duration: "9 Months",
    eligibility: "Highscholers / 10 th / Iti / Itc / Plus two",
  },
  {
    id: "dit",
    name: "Diploma in integrated Technology (DIT)",
    duration: "6 months",
    eligibility: "Plus two science/ VHSE holders",
  },
  {
    id: "professional-diploma",
    name: "Professional Diploma program",
    duration: "4 | 5 | 6 Months",
    eligibility: "Highscholers / 10 th / Plus two / Graduation.",
  },
  {
    id: "pdit",
    name: "Post Diploma in integrated Technology (PDIT)",
    duration: "3 months",
    eligibility: "ITI / Diploma holders",
  },
  {
    id: "certificate",
    name: "Certificate Program",
    duration: "1- 15 Days | 1,2,3, Months",
    eligibility: "Highscholers / 10 th / Plus two / Graduation.",
  },
];
// staticSkillPrograms array removed to use DB programs

const getProgramLabel = (programType) => {
  if (!programType) return "Skilled";
  const type = programType.trim();
  const lowerType = type.toLowerCase();

  if (lowerType.includes("bachelor")) {
    return "Under Graduate";
  }
  if (lowerType.includes("master")) {
    return "Postgraduate";
  }
  if (lowerType.includes("pg diploma") || lowerType.includes("pg deploma")) {
    return "Postgraduate Diploma";
  }
  if (lowerType.includes("skill")) {
    return "Skilled";
  }
  return type;
};

const SpecializationDetails = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const fromCategory = location.state?.fromCategory;
  const fromSkillLevel = location.state?.fromSkillLevel;

  const queryParams = new URLSearchParams(location.search);
  const programName = queryParams.get("programName");

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programInfo, setProgramInfo] = useState(null);
  const [selectedSubProgram, setSelectedSubProgram] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const isSkillProgramsRoute = programId === "skill-programs";
        const queryParams = new URLSearchParams(location.search);
        const programName = queryParams.get("programName");

        if (isSkillProgramsRoute) {
          if (programName) {
            const resPrograms = await getPublicPrograms({ isActive: "true" });
            let dbProg = null;
            if (resPrograms.success) {
              dbProg = resPrograms.data.find(
                (p) =>
                  p.name.trim().toLowerCase() ===
                  programName.trim().toLowerCase(),
              );
            }

            if (dbProg) {
              const resBranches = await getPublicBranches(dbProg._id);
              if (resBranches.success) {
                setBranches(resBranches.data);
                setProgramInfo(dbProg);
              }
            } else {
              setBranches([]);
              setProgramInfo({
                name: "Post Graduate Certificate",
                programType: "Skill Programs",
                university: { name: "The Global University" },
              });
            }
          } else {
            const resPrograms = await getPublicPrograms({ isActive: "true" });
            if (resPrograms.success) {
              const skillProgs = resPrograms.data.filter(
                (p) => p.programType === "Skill Programs",
              );
              const mappedBranches = skillProgs.map((p) => ({
                _id: p._id,
                name: p.name,
                program: p,
              }));
              setBranches(mappedBranches);
            } else {
              setBranches([]);
            }
            setProgramInfo({
              name: "Post Graduate Certificate",
              programType: "Skill Programs",
              university: { name: "The Global University" },
            });
          }
        } else {
          const res = await getPublicBranches(programId);
          if (res.success) {
            setBranches(res.data);
            if (res.data.length > 0 && res.data[0].program) {
              setProgramInfo(res.data[0].program);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load specialization details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [programId, location.search]);

  useEffect(() => {
    // Resolve level from query params
    const queryParams = new URLSearchParams(location.search);
    const levelId = queryParams.get("level");
    const programName = queryParams.get("programName");
    if (levelId) {
      const found = subPrograms.find((sub) => sub.id === levelId);
      if (found) {
        setSelectedSubProgram(found);
      } else {
        // Fallback to first subprogram if not found
        setSelectedSubProgram(subPrograms[0]);
      }
    } else if (programId === "skill-programs" && !programName) {
      // Default to first subprogram if we are on the skill-programs route without a level or programName param
      setSelectedSubProgram(subPrograms[0]);
    } else {
      setSelectedSubProgram(null);
    }
  }, [location.search, programId]);

  const isPostGraduateCertificate =
    (programInfo?.programType &&
      programInfo.programType.toLowerCase().includes("skill")) ||
    fromCategory === "skill-programs" ||
    programId === "skill-programs";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow pt-24 pb-20 relative">
        {/* Ambient Glowing Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#17468C]/5 rounded-full blur-[100px] translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-[#B82424]/5 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="container mx-auto px-6 relative z-10 max-w-4xl">
          {/* Back Navigation Bar */}
          <div className="sticky top-24 z-20 mb-10 w-fit">
            <button
              onClick={() => {
                navigate("/#programs", {
                  state: { fromCategory, fromSkillLevel },
                });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-border text-sm font-bold shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-300 text-foreground/80 hover:text-foreground cursor-pointer group"
            >
              <ArrowLeft
                size={16}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
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
                    {isPostGraduateCertificate
                      ? "Skilled"
                      : programInfo?.programType || "Specialization"}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    {isPostGraduateCertificate
                      ? (programName
                          ? programInfo?.name
                          : selectedSubProgram?.name) ||
                        programInfo?.name ||
                        "Post Graduate Certificate"
                      : programInfo?.name || "Program Details"}
                  </h1>
                  <p className="text-lg text-white/70 leading-relaxed font-medium">
                    Offered by{" "}
                    <span className="text-white font-extrabold underline decoration-[#17468C] decoration-4 underline-offset-4">
                      {programInfo?.university?.name || "The Global University"}
                    </span>
                  </p>
                  <div className="flex items-center gap-3 pt-4 text-xs font-bold text-white/50 uppercase tracking-widest">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    UGC Approved Program Structure
                  </div>
                </div>
              </motion.div>

              <motion.div
                key={
                  selectedSubProgram
                    ? `branches-list-${selectedSubProgram.id}`
                    : "branches-list-default"
                }
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Selected Subprogram Header Card (only when inside a skill program) */}
                {isPostGraduateCertificate && selectedSubProgram && (
                  <div className="bg-amber-50/50 border border-amber-100/60 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest">
                          Skill Level Info
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-800">
                        {selectedSubProgram.name}
                      </h2>

                      <div className="flex flex-wrap gap-4 pt-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-100 px-3 py-1 rounded-full">
                          <Clock size={14} className="text-slate-400" />
                          <span>Duration: {selectedSubProgram.duration}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-100 px-3 py-1 rounded-full">
                          <GraduationCap size={14} className="text-slate-400" />
                          <span>
                            Eligibility: {programInfo?.eligibilityChecklist && programInfo.eligibilityChecklist.length > 0 
                              ? programInfo.eligibilityChecklist.join(", ") 
                              : selectedSubProgram.eligibility}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-foreground">
                      Available Branches
                    </h2>
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
                    <BookOpen
                      size={48}
                      className="mx-auto text-muted-foreground/30"
                    />
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
                        transition={{ delay: idx * 0.05, duration: 0.4 }}
                        className="bg-white border border-border/80 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 rounded-3xl p-6 md:p-8 transition-all duration-300 relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        <div className="space-y-4 flex-grow">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">
                              {isPostGraduateCertificate
                                ? "Skilled"
                                : getProgramLabel(
                                    branch.program?.programType ||
                                      programInfo?.programType,
                                  )}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                              {branch.name}
                            </h3>
                          </div>

                          {isPostGraduateCertificate && selectedSubProgram ? (
                            <div className="flex flex-wrap gap-4 pt-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full w-fit">
                                <Clock
                                  size={14}
                                  className="text-slate-400 shrink-0"
                                />
                                <span>
                                  Duration: {selectedSubProgram.duration}
                                </span>
                              </div>
                              <div className="flex items-start gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-2xl w-fit">
                                <GraduationCap
                                  size={14}
                                  className="text-slate-400 shrink-0 mt-0.5"
                                />
                                <span className="leading-relaxed">
                                  Eligibility: {((branch.program?.eligibilityChecklist && branch.program.eligibilityChecklist.length > 0) || (programInfo?.eligibilityChecklist && programInfo.eligibilityChecklist.length > 0)) 
                                    ? (branch.program?.eligibilityChecklist || programInfo?.eligibilityChecklist).join(", ") 
                                    : selectedSubProgram.eligibility}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-4 pt-1">
                              {branch.duration && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full w-fit">
                                  <Calendar
                                    size={14}
                                    className="text-slate-400 shrink-0"
                                  />
                                  <span>Duration: {branch.duration}</span>
                                </div>
                              )}
                              {((branch.program?.eligibilityChecklist &&
                                branch.program.eligibilityChecklist.length >
                                  0) ||
                                (programInfo?.eligibilityChecklist &&
                                  programInfo.eligibilityChecklist.length >
                                    0)) && (
                                <div className="flex items-start gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-2xl w-fit">
                                  <GraduationCap
                                    size={14}
                                    className="text-slate-400 shrink-0 mt-0.5"
                                  />
                                  <span className="leading-relaxed">
                                    Eligibility:{" "}
                                    {(
                                      branch.program?.eligibilityChecklist ||
                                      programInfo?.eligibilityChecklist
                                    ).join(", ")}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
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
                                (Tuition: ₹
                                {branch.currentFee.tuitionFee?.toLocaleString()}
                                )
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
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SpecializationDetails;
