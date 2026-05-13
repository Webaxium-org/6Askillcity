import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  GraduationCap,
  IndianRupee,
  History,
  ChevronRight,
  MoreVertical,
  Activity,
  CheckCircle,
  XCircle,
  MapPin,
  ExternalLink,
  Info,
  GitBranch,
  LayoutGrid,
  List,
  Filter,
  X,
  Clock,
  Sparkles,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUniversities,
  createUniversity,
  updateUniversity,
  getPrograms,
  createProgram,
  updateProgram,
  getBranches,
  createBranch,
  updateBranch,
  getProgramFees,
  updateProgramFee,
  getActivityLogs,
} from "../../api/university.api";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { handleFormError } from "../../utils/handleFormError";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";

const tabs = [
  { id: "universities", label: "Universities", icon: Building2 },
  { id: "programs", label: "Programs", icon: GraduationCap },
  { id: "branches", label: "Branches", icon: GitBranch },
  { id: "history", label: "Activity Logs", icon: History },
];

export default function UniversityManagement() {
  const [activeTab, setActiveTab] = useState("universities");
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const setQuickRange = (range) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
      case "today":
        start = today;
        end = today;
        break;
      case "week":
        const diff = today.getDate() - today.getDay();
        start = new Date(today.setDate(diff));
        end = new Date();
        break;
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      case "year":
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date();
        break;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  // Modals state
  const [isUniversityModalOpen, setIsUniversityModalOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [feeHistory, setFeeHistory] = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [modalTab, setModalTab] = useState("setup"); // setup or history
  const [feeForm, setFeeForm] = useState({
    applicationFee: 0,
    tuitionFee: 0,
    totalFee: 0,
  });
  const [programFees, setProgramFees] = useState({
    applicationFee: 0,
    tuitionFee: 0,
    totalFee: 0,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "universities") {
        const res = await getUniversities();
        if (res.success) setUniversities(res.data);
      } else if (activeTab === "programs") {
        const res = await getPrograms();
        if (res.success) setPrograms(res.data);
        const uniRes = await getUniversities();
        if (uniRes.success) setUniversities(uniRes.data);
      } else if (activeTab === "branches") {
        const res = await getBranches();
        if (res.success) setBranches(res.data);
        const progRes = await getPrograms();
        if (progRes.success) setPrograms(progRes.data);
      } else if (activeTab === "history") {
        const res = await getActivityLogs();
        if (res.success) setActivityLogs(res.data);
      }
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUniversity = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.isActive = formData.get("isActive") === "on";
    try {
      let res;
      if (editingUniversity) {
        res = await updateUniversity(editingUniversity._id, data);
        dispatch(
          showAlert({
            type: "success",
            message: "University updated successfully",
          }),
        );
      } else {
        res = await createUniversity(data);
        dispatch(
          showAlert({
            type: "success",
            message: "University created successfully",
          }),
        );
      }
      setIsUniversityModalOpen(false);
      setEditingUniversity(null);
      fetchData();
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.isActive = formData.get("isActive") === "on";
    try {
      let res;
      if (editingProgram) {
        res = await updateProgram(editingProgram._id, data);
        dispatch(
          showAlert({
            type: "success",
            message: "Program updated successfully",
          }),
        );
      } else {
        res = await createProgram(data);
        dispatch(
          showAlert({
            type: "success",
            message: "Program created successfully",
          }),
        );
      }
      setIsProgramModalOpen(false);
      setEditingProgram(null);
      fetchData();
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.isActive = formData.get("isActive") === "on";
    try {
      if (editingBranch) {
        await updateBranch(editingBranch._id, data);
        dispatch(
          showAlert({
            type: "success",
            message: "Branch updated successfully",
          }),
        );
      } else {
        await createBranch(data);
        dispatch(
          showAlert({
            type: "success",
            message: "Branch created successfully",
          }),
        );
      }
      setIsBranchModalOpen(false);
      setEditingBranch(null);
      fetchData();
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      totalFee: Number(formData.get("totalFee")),
      applicationFee: Number(formData.get("applicationFee")),
      tuitionFee: Number(formData.get("tuitionFee")),
    };
    try {
      await updateProgramFee(selectedBranch._id, data);
      dispatch(
        showAlert({ type: "success", message: "Fees updated successfully" }),
      );
      setIsFeeModalOpen(false);
      fetchData();
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const openFeeModal = async (branch) => {
    setSelectedBranch(branch);
    setIsFeeModalOpen(true);
    setModalTab("setup");
    setLoadingFees(true);
    try {
      const res = await getProgramFees(branch._id);
      if (res.success) {
        setFeeHistory(res.data);
        const current = res.data.find((f) => f.isCurrent);
        if (current) {
          setFeeForm({
            applicationFee: current.applicationFee,
            tuitionFee: current.tuitionFee,
            totalFee: current.totalFee,
          });
        } else {
          setFeeForm({ applicationFee: 0, tuitionFee: 0, totalFee: 0 });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFees(false);
    }
  };

  const filteredUniversities = universities.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" ? u.isActive : !u.isActive);

    const matchesDate =
      (!startDate || new Date(u.createdAt) >= new Date(startDate)) &&
      (!endDate || new Date(u.createdAt) <= new Date(new Date(endDate).setHours(23, 59, 59, 999)));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.university?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" ? p.isActive : !p.isActive);

    const matchesDate =
      (!startDate || new Date(p.createdAt) >= new Date(startDate)) &&
      (!endDate || new Date(p.createdAt) <= new Date(new Date(endDate).setHours(23, 59, 59, 999)));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.program?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.program?.university?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" ? b.isActive : !b.isActive);

    const matchesDate =
      (!startDate || new Date(b.createdAt) >= new Date(startDate)) &&
      (!endDate || new Date(b.createdAt) <= new Date(new Date(endDate).setHours(23, 59, 59, 999)));

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <DashboardLayout title="University Management">
      <div className="space-y-6">
        {/* Active Filter Chips */}
        <AnimatePresence>
          {(filterStatus !== "all" || startDate || endDate) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap items-center gap-2 px-2"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">
                Active:
              </span>

              {filterStatus !== "all" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-bold text-primary">
                  Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  <button
                    onClick={() => setFilterStatus("all")}
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {(startDate || endDate) && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-600">
                  Date: {startDate || "Start"} to {endDate || "End"}
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setFilterStatus("all");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 hover:underline ml-2"
              >
                Clear All
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card/50 backdrop-blur-sm p-6 rounded-[2.5rem] border border-border/50">
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-muted/30 border border-transparent focus:bg-background focus:border-primary/20 rounded-2xl text-sm outline-none transition-all font-medium placeholder:text-muted-foreground/40"
            />
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto">
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-border/50">
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

            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                "flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border",
                showFilters || filterStatus !== "all" || startDate || endDate
                  ? "bg-primary text-white border-primary"
                  : "bg-card border-border hover:bg-muted"
              )}
            >
              <Filter className="w-4 h-4" />
              {filterStatus !== "all" || startDate || endDate
                ? "Active Filters"
                : "Advanced"}
            </button>

            {/* Action Buttons */}
            {activeTab === "universities" && (
              <button
                onClick={() => {
                  setEditingUniversity(null);
                  setIsUniversityModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10"
              >
                <Plus className="w-4 h-4" /> Add University
              </button>
            )}
            {activeTab === "programs" && (
              <button
                onClick={() => {
                  setEditingProgram(null);
                  setIsProgramModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10"
              >
                <Plus className="w-4 h-4" /> Add Program
              </button>
            )}
            {activeTab === "branches" && (
              <button
                onClick={() => {
                  setEditingBranch(null);
                  setIsBranchModalOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10"
              >
                <Plus className="w-4 h-4" /> Add Branch
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Row - Image Style */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex items-center gap-3 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all relative overflow-hidden group border",
                  activeTab === tab.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20"
                    : "bg-card border-border/60 text-muted-foreground/80 hover:border-primary/50 hover:text-primary",
                )}
              >
                <tab.icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    activeTab === tab.id ? "text-white" : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "universities" && (
                <>
                  {filteredUniversities.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground bg-card border border-dashed rounded-[2.5rem]">
                      No universities found matching your search.
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredUniversities.map((uni) => (
                        <div
                          key={uni._id}
                          className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all group"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <button
                              onClick={() => {
                                setEditingUniversity(uni);
                                setIsUniversityModalOpen(true);
                              }}
                              className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                          <h3 className="font-bold text-lg mb-1">{uni.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <MapPin className="w-3.5 h-3.5" />
                            {uni.location}
                          </div>
                          <div className="pt-4 border-t border-border flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                              <span
                                className={`w-2 h-2 rounded-full ${uni.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                              />
                              {uni.isActive ? "Active" : "Inactive"}
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab("programs");
                                setSearchTerm(uni.name);
                              }}
                              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                            >
                              View Programs <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              University Name
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Location
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredUniversities.map((uni) => (
                            <tr
                              key={uni._id}
                              className="hover:bg-muted/30 transition-colors group"
                            >
                              <td className="px-6 py-4 font-bold">{uni.name}</td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {uni.location}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                    uni.isActive
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : "bg-red-500/10 text-red-600"
                                  }`}
                                >
                                  {uni.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setActiveTab("programs");
                                      setSearchTerm(uni.name);
                                    }}
                                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingUniversity(uni);
                                      setIsUniversityModalOpen(true);
                                    }}
                                    className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {activeTab === "programs" && (
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Program Name
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          University
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredPrograms.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-20 text-center text-muted-foreground"
                          >
                            No programs found.
                          </td>
                        </tr>
                      ) : (
                        filteredPrograms.map((prog) => (
                          <tr
                            key={prog._id}
                            className="hover:bg-muted/30 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold">{prog.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${prog.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                                />
                                {prog.isActive ? "Active" : "Inactive"}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              {prog.university?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setActiveTab("branches");
                                    setSearchTerm(prog.name);
                                  }}
                                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                  title="View Branches"
                                >
                                  <GitBranch className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProgram(prog);
                                    setIsProgramModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                                  title="Edit Program"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "branches" && (
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Branch Name
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Program
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Total Fee
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredBranches.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-20 text-center text-muted-foreground"
                          >
                            No branches found.
                          </td>
                        </tr>
                      ) : (
                        filteredBranches.map((branch) => (
                          <tr
                            key={branch._id}
                            className="hover:bg-muted/30 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold">{branch.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${branch.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                                />
                                {branch.isActive ? "Active" : "Inactive"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium">{branch.program?.name || "N/A"}</div>
                              {branch.program?.university?.name && (
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                  {branch.program?.university?.name}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-primary">
                              {branch.type || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {branch.duration}
                            </td>
                            <td className="px-6 py-4 text-sm font-black text-foreground">
                              {branch.currentFee ? `₹${branch.currentFee.totalFee.toLocaleString()}` : "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openFeeModal(branch)}
                                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                  title="Manage Fees"
                                >
                                  <IndianRupee className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingBranch(branch);
                                    setIsBranchModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                                  title="Edit Branch"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-4">
                  {activityLogs.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl py-20 text-center text-muted-foreground">
                      No activity logs found.
                    </div>
                  ) : (
                    activityLogs.map((log) => (
                      <div
                        key={log._id}
                        className="bg-card border border-border rounded-2xl p-4 flex gap-4 items-start hover:shadow-sm transition-all"
                      >
                        <div
                          className={`mt-1 p-2 rounded-xl flex-shrink-0 ${
                            log.action.includes("CREATE")
                              ? "bg-emerald-500/10 text-emerald-500"
                              : log.action.includes("UPDATE")
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-purple-500/10 text-purple-500"
                          }`}
                        >
                          <Activity className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-sm">
                              {log.action.replace(/_/g, " ")}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {log.details}
                          </p>
                          <div className="flex items-center gap-2 text-xs font-medium bg-muted/50 w-fit px-2 py-1 rounded-lg">
                            <span className="text-muted-foreground">By:</span>
                            <span>{log.performedBy?.fullName || "System"}</span>
                            <span className="text-muted-foreground mx-1">
                              •
                            </span>
                            <span className="text-muted-foreground">
                              Target:
                            </span>
                            <span>{log.targetType}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* University Modal */}
        <AnimatePresence>
          {isUniversityModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-xl font-bold mb-4">
                  {editingUniversity ? "Edit" : "Add"} University
                </h3>
                <form onSubmit={handleCreateUniversity} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                      University Name
                    </label>
                    <input
                      name="name"
                      defaultValue={editingUniversity?.name}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                      Location
                    </label>
                    <input
                      name="location"
                      defaultValue={editingUniversity?.location}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="uni-active"
                      defaultChecked={
                        editingUniversity ? editingUniversity.isActive : true
                      }
                      className="w-4 h-4 text-primary rounded"
                    />
                    <label htmlFor="uni-active" className="text-sm font-medium">
                      Active Status
                    </label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsUniversityModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                      Save University
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Program Modal */}
        <AnimatePresence>
          {isProgramModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-xl font-bold mb-4">
                  {editingProgram ? "Edit" : "Add"} Program
                </h3>
                <form onSubmit={handleCreateProgram} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                      Program Name
                    </label>
                    <input
                      name="name"
                      defaultValue={editingProgram?.name}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                      placeholder="e.g. B.Tech"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                      University
                    </label>
                    <select
                      name="university"
                      defaultValue={editingProgram?.university?._id || ""}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                    >
                      <option value="">Select University</option>
                      {universities.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="prog-active"
                      defaultChecked={
                        editingProgram ? editingProgram.isActive : true
                      }
                      className="w-4 h-4 text-primary rounded"
                    />
                    <label
                      htmlFor="prog-active"
                      className="text-sm font-medium"
                    >
                      Active Status
                    </label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsProgramModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                      Save Program
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Branch Modal */}
        <AnimatePresence>
          {isBranchModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-xl font-bold mb-4">
                  {editingBranch ? "Edit" : "Add"} Branch
                </h3>
                <form onSubmit={handleCreateBranch} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                      Branch Name
                    </label>
                    <input
                      name="name"
                      defaultValue={editingBranch?.name}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                      Program
                    </label>
                    <select
                      name="program"
                      defaultValue={editingBranch?.program?._id || ""}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                    >
                      <option value="">Select Program</option>
                      {programs.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                        Type
                      </label>
                      <select
                        name="type"
                        defaultValue={editingBranch?.type || ""}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                      >
                        <option value="">Select Type</option>
                        <option value="CT">CT</option>
                        <option value="Vocational">Vocational</option>
                        <option value="Skilled">Skilled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                        Duration
                      </label>
                      <input
                        name="duration"
                        defaultValue={editingBranch?.duration}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                        placeholder="e.g. 4 Years"
                      />
                    </div>
                  </div>

                  {!editingBranch && (
                    <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-3">
                      <h4 className="text-[10px] font-black uppercase text-emerald-600">
                        Initial Fee Structure (Optional)
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase">
                            App Fee
                          </label>
                          <input
                            name="applicationFee"
                            type="number"
                            onChange={(e) =>
                              setProgramFees((p) => ({
                                ...p,
                                applicationFee: Number(e.target.value),
                                totalFee: Number(e.target.value) + p.tuitionFee,
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase">
                            Tuition Fee
                          </label>
                          <input
                            name="tuitionFee"
                            type="number"
                            onChange={(e) =>
                              setProgramFees((p) => ({
                                ...p,
                                tuitionFee: Number(e.target.value),
                                totalFee:
                                  p.applicationFee + Number(e.target.value),
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-emerald-500/10 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          Total Amount:
                        </span>
                        <span className="text-sm font-black text-emerald-600">
                          ₹{programFees.totalFee.toLocaleString()}
                        </span>
                        <input
                          type="hidden"
                          name="totalFee"
                          value={programFees.totalFee}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="prog-active"
                      defaultChecked={
                        editingProgram ? editingProgram.isActive : true
                      }
                      className="w-4 h-4 text-primary rounded"
                    />
                    <label
                      htmlFor="prog-active"
                      className="text-sm font-medium"
                    >
                      Active Status
                    </label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsBranchModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                      Save Branch
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Fee Management Modal */}
        <AnimatePresence>
          {isFeeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card w-full max-w-4xl rounded-3xl shadow-2xl border border-border flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] overflow-hidden"
              >
                {/* Mobile Tab Switcher */}
                <div className="flex md:hidden border-b border-border p-1 bg-muted/30">
                  <button
                    onClick={() => setModalTab("setup")}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${modalTab === "setup" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
                  >
                    Set Fees
                  </button>
                  <button
                    onClick={() => setModalTab("history")}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${modalTab === "history" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
                  >
                    History
                  </button>
                </div>

                {/* Form Section */}
                <div
                  className={`flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 border-b md:border-b-0 md:border-r border-border h-[60vh] md:h-auto ${modalTab !== "setup" ? "hidden md:block" : "block"}`}
                >
                  <div className="flex items-center gap-3 text-emerald-500 mb-4">
                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground">
                        Set New Fees
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        For {selectedBranch?.name}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateFee} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">
                            Application Fee
                          </label>
                          <input
                            name="applicationFee"
                            type="number"
                            value={feeForm.applicationFee}
                            onChange={(e) =>
                              setFeeForm((p) => ({
                                ...p,
                                applicationFee: Number(e.target.value),
                                totalFee: Number(e.target.value) + p.tuitionFee,
                              }))
                            }
                            required
                            className="w-full px-4 py-3 rounded-2xl border border-input bg-background outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-semibold"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">
                            Tuition Fee
                          </label>
                          <input
                            name="tuitionFee"
                            type="number"
                            value={feeForm.tuitionFee}
                            onChange={(e) =>
                              setFeeForm((p) => ({
                                ...p,
                                tuitionFee: Number(e.target.value),
                                totalFee:
                                  p.applicationFee + Number(e.target.value),
                              }))
                            }
                            required
                            className="w-full px-4 py-3 rounded-2xl border border-input bg-background outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-semibold"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
                          Total Fee (Calculated)
                        </label>
                        <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
                          <IndianRupee className="w-6 h-6" />
                          {feeForm.totalFee.toLocaleString()}
                          <input
                            type="hidden"
                            name="totalFee"
                            value={feeForm.totalFee}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">
                          Sum of Application and Tuition fees
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsFeeModalOpen(false)}
                        className="flex-1 py-3.5 rounded-2xl border border-border hover:bg-muted font-bold transition-all text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-[2] py-3.5 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-emerald-500/20 text-sm"
                      >
                        Update Fee Structure
                      </button>
                    </div>
                  </form>
                </div>

                {/* History Section */}
                <div
                  className={`w-full md:w-80 bg-muted/30 flex flex-col flex-1 md:flex-none shrink-0 min-h-0 h-[60vh] md:h-auto ${modalTab !== "history" ? "hidden md:flex" : "flex"}`}
                >
                  <div className="p-6 border-b border-border/50 flex items-center gap-2">
                    <History className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-bold text-sm">Fee History</h4>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
                    {loadingFees ? (
                      <div className="py-10 text-center text-xs text-muted-foreground">
                        Loading history...
                      </div>
                    ) : feeHistory.length === 0 ? (
                      <div className="py-10 text-center text-xs text-muted-foreground">
                        No history available.
                      </div>
                    ) : (
                      feeHistory.map((fee, idx) => (
                        <div
                          key={fee._id}
                          className={`p-4 rounded-2xl border transition-all ${fee.isCurrent ? "bg-card border-emerald-500/30 shadow-md ring-1 ring-emerald-500/10" : "bg-card/50 border-border opacity-70"}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-muted">
                              v{feeHistory.length - idx}
                            </span>
                            {fee.isCurrent && (
                              <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-black">
                            ₹{fee.totalFee.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium mt-1">
                            Updated:{" "}
                            {new Date(fee.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-6 border-t border-border/50">
                    <div className="flex items-start gap-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                      <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                        Updating fees only affects new applications.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 h-screen w-screen bg-slate-900/40 backdrop-blur-md z-[9999]"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 h-screen w-full max-w-md bg-card border-l border-border/50 z-[10000] shadow-[-20px_0_80px_rgba(0,0,0,0.15)] flex flex-col"
              >
                {/* Header */}
                <div className="p-10 border-b border-border/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">
                      Filters
                    </h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Institutional Filtering
                  </p>
                </div>

                {/* Filter Content */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12">
                  {/* Status */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                          Record Status
                        </h4>
                        <p className="text-[9px] font-bold text-muted-foreground">
                          Filter by active/inactive state
                        </p>
                      </div>
                    </div>
                    <div className="flex p-1 bg-muted/50 rounded-2xl border border-border/50">
                      {["all", "active", "inactive"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                            filterStatus === status
                              ? "bg-card text-primary shadow-sm border border-border/50"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center text-emerald-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
                          Creation Period
                        </h4>
                        <p className="text-[9px] font-bold text-muted-foreground">
                          Select date range for records
                        </p>
                      </div>
                    </div>
                    {/* Quick Ranges */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {["today", "week", "month", "year"].map((range) => (
                        <button
                          key={range}
                          onClick={() => setQuickRange(range)}
                          className="py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                        >
                          {range === "week"
                            ? "This Week"
                            : range === "month"
                              ? "This Month"
                              : range === "year"
                                ? "This Year"
                                : "Today"}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="group">
                        <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-emerald-500/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 ml-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black outline-none focus:border-emerald-500/30 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-10 border-t border-border/10 bg-muted/5">
                  <button
                    onClick={() => {
                      setFilterStatus("all");
                      setStartDate("");
                      setEndDate("");
                      setShowFilters(false);
                    }}
                    className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                  >
                    Reset All Protocol
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
