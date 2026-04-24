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
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getUniversities, 
  createUniversity, 
  updateUniversity,
  getPrograms,
  createProgram,
  updateProgram,
  getProgramFees,
  updateProgramFee,
  getActivityLogs
} from "../../api/university.api";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import { handleFormError } from "../../utils/handleFormError";
import { useNavigate } from "react-router-dom";

const tabs = [
  { id: "universities", label: "Universities", icon: Building2 },
  { id: "programs", label: "Programs", icon: GraduationCap },
  { id: "history", label: "Activity Logs", icon: History },
];

export default function UniversityManagement() {
  const [activeTab, setActiveTab] = useState("universities");
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals state
  const [isUniversityModalOpen, setIsUniversityModalOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [feeHistory, setFeeHistory] = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);

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
        dispatch(showAlert({ type: "success", message: "University updated successfully" }));
      } else {
        res = await createUniversity(data);
        dispatch(showAlert({ type: "success", message: "University created successfully" }));
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
        dispatch(showAlert({ type: "success", message: "Program updated successfully" }));
      } else {
        res = await createProgram(data);
        dispatch(showAlert({ type: "success", message: "Program created successfully" }));
      }
      setIsProgramModalOpen(false);
      setEditingProgram(null);
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
      // otherFees could be expanded here
    };
    try {
      await updateProgramFee(selectedProgram._id, data);
      dispatch(showAlert({ type: "success", message: "Fees updated. A new fee version has been created." }));
      setIsFeeModalOpen(false);
      fetchData();
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const openFeeModal = async (program) => {
    setSelectedProgram(program);
    setIsFeeModalOpen(true);
    setLoadingFees(true);
    try {
      const res = await getProgramFees(program._id);
      if (res.success) setFeeHistory(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFees(false);
    }
  };

  const filteredUniversities = universities.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.university?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="University Management">
      <div className="space-y-6">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border">
          <div className="flex p-1 bg-muted rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-muted border-transparent focus:bg-background focus:border-primary/30 rounded-xl text-sm outline-none transition-all w-full md:w-64 border"
              />
            </div>
            {activeTab === "universities" && (
              <button
                onClick={() => { setEditingUniversity(null); setIsUniversityModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> Add University
              </button>
            )}
            {activeTab === "programs" && (
              <button
                onClick={() => { setEditingProgram(null); setIsProgramModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> Add Program
              </button>
            )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUniversities.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground">
                      No universities found.
                    </div>
                  ) : (
                    filteredUniversities.map((uni) => (
                      <div
                        key={uni._id}
                        className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                          <button 
                            onClick={() => { setEditingUniversity(uni); setIsUniversityModalOpen(true); }}
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
                            <span className={`w-2 h-2 rounded-full ${uni.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {uni.isActive ? 'Active' : 'Inactive'}
                          </div>
                          <button 
                             onClick={() => { setActiveTab("programs"); setSearchTerm(uni.name); }}
                             className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                          >
                            View Programs <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "programs" && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Program Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">University</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredPrograms.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-20 text-center text-muted-foreground">No programs found.</td>
                        </tr>
                      ) : (
                        filteredPrograms.map((prog) => (
                          <tr key={prog._id} className="hover:bg-muted/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="font-semibold">{prog.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${prog.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {prog.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">{prog.university?.name || "N/A"}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{prog.category}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{prog.duration}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => openFeeModal(prog)}
                                  className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                  title="Manage Fees"
                                >
                                  <IndianRupee className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => { setEditingProgram(prog); setIsProgramModalOpen(true); }}
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

              {activeTab === "history" && (
                <div className="space-y-4">
                  {activityLogs.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl py-20 text-center text-muted-foreground">
                      No activity logs found.
                    </div>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log._id} className="bg-card border border-border rounded-2xl p-4 flex gap-4 items-start hover:shadow-sm transition-all">
                        <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${
                          log.action.includes("CREATE") ? "bg-emerald-500/10 text-emerald-500" :
                          log.action.includes("UPDATE") ? "bg-blue-500/10 text-blue-500" :
                          "bg-purple-500/10 text-purple-500"
                        }`}>
                          <Activity className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-sm">{log.action.replace(/_/g, " ")}</h4>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                          <div className="flex items-center gap-2 text-xs font-medium bg-muted/50 w-fit px-2 py-1 rounded-lg">
                            <span className="text-muted-foreground">By:</span>
                            <span>{log.performedBy?.fullName || "System"}</span>
                            <span className="text-muted-foreground mx-1">•</span>
                            <span className="text-muted-foreground">Target:</span>
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
                className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border"
              >
                <h3 className="text-xl font-bold mb-4">{editingUniversity ? "Edit" : "Add"} University</h3>
                <form onSubmit={handleCreateUniversity} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">University Name</label>
                    <input name="name" defaultValue={editingUniversity?.name} required className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="Enter name" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Location</label>
                    <input name="location" defaultValue={editingUniversity?.location} required className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="City, Country" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" name="isActive" id="uni-active" defaultChecked={editingUniversity ? editingUniversity.isActive : true} className="w-4 h-4 text-primary rounded" />
                    <label htmlFor="uni-active" className="text-sm font-medium">Active Status</label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsUniversityModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted font-medium transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">Save University</button>
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
                className="bg-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-border"
              >
                <h3 className="text-xl font-bold mb-4">{editingProgram ? "Edit" : "Add"} Program</h3>
                <form onSubmit={handleCreateProgram} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Program Name</label>
                    <input name="name" defaultValue={editingProgram?.name} required className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="e.g. B.Tech Computer Science" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">University</label>
                    <select name="university" defaultValue={editingProgram?.university?._id || ""} required className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm">
                      <option value="">Select University</option>
                      {universities.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Category</label>
                      <input name="category" defaultValue={editingProgram?.category} required className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="e.g. Engineering" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Duration</label>
                      <input name="duration" defaultValue={editingProgram?.duration} required className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-primary transition-all text-sm" placeholder="e.g. 4 Years" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" name="isActive" id="prog-active" defaultChecked={editingProgram ? editingProgram.isActive : true} className="w-4 h-4 text-primary rounded" />
                    <label htmlFor="prog-active" className="text-sm font-medium">Active Status</label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsProgramModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted font-medium transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">Save Program</button>
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
                className="bg-card w-full max-w-4xl p-6 rounded-2xl shadow-xl border border-border flex flex-col md:flex-row gap-8 max-h-[90vh] overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="flex items-center gap-2 text-emerald-500 mb-2">
                    <IndianRupee className="w-5 h-5" />
                    <h3 className="text-xl font-bold text-foreground">Set New Fees</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">Update the fee structure for <b>{selectedProgram?.name}</b>. This will create a new history record.</p>
                  
                  <form onSubmit={handleUpdateFee} className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Total Fee</label>
                        <input name="totalFee" type="number" required className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm" placeholder="0.00" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Application Fee</label>
                          <input name="applicationFee" type="number" required className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm" placeholder="0.00" />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Tuition Fee</label>
                          <input name="tuitionFee" type="number" required className="w-full px-4 py-2.5 rounded-xl border border-input bg-background outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm" placeholder="0.00" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={() => setIsFeeModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border hover:bg-muted font-medium transition-colors">Cancel</button>
                      <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20">Update Fee Structure</button>
                    </div>
                  </form>
                </div>

                <div className="w-full md:w-80 bg-muted/30 rounded-2xl p-4 flex flex-col border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-bold text-sm">Fee History</h4>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {loadingFees ? (
                      <div className="py-10 text-center text-xs text-muted-foreground">Loading history...</div>
                    ) : feeHistory.length === 0 ? (
                      <div className="py-10 text-center text-xs text-muted-foreground">No history available.</div>
                    ) : (
                      feeHistory.map((fee, idx) => (
                        <div key={fee._id} className={`p-3 rounded-xl border transition-all ${fee.isCurrent ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm' : 'bg-background border-border opacity-70'}`}>
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-muted">v{feeHistory.length - idx}</span>
                             {fee.isCurrent && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">CURRENT</span>}
                          </div>
                          <div className="text-sm font-bold">₹{fee.totalFee.toLocaleString()}</div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            Updated: {new Date(fee.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                     <div className="flex items-start gap-2 p-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
                        <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-blue-700 leading-relaxed">
                          Student references are tied to the version active at enrollment time. Updating fees only affects new applications.
                        </p>
                     </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
