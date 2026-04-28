import React, { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../redux/alertSlice";
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Save,
  ScanText,
  FileText,
  ShieldCheck,
  Briefcase,
  Users,
  GraduationCap,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Loader2,
  School,
  Building2,
  MapPin,
  Baby,
  Cpu,
} from "lucide-react";
import axios from "axios";
import Tesseract from "tesseract.js";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const FileUploadBox = ({ label, field, value, multiple = false, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</label>
    <div className={cn(
      "relative border-2 border-dashed rounded-2xl p-3 transition-all group",
      (multiple ? value.length > 0 : value) ? "border-emerald-500/30 bg-emerald-500/5" : "border-border hover:border-primary/30 hover:bg-muted/30"
    )}>
      <input type="file" multiple={multiple} onChange={(e) => onChange(e, field)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
      <div className="flex flex-col items-center justify-center text-center py-1">
        {(!multiple && value) || (multiple && value.length > 0) ? (
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
             <CheckCircle2 className="w-3 h-3" /> {multiple ? `${value.length} Files` : "Attached"}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/50 group-hover:text-primary transition-colors">
            <UploadCloud className="w-3 h-3" /> UPLOAD
          </div>
        )}
      </div>
    </div>
  </div>
);

const InputField = ({ label, name, value, onChange, type = "text", placeholder, options, icon: Icon }) => (
  <div className="space-y-1.5 group">
    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 group-focus-within:text-primary transition-colors">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-all" />}
      {options ? (
        <select name={name} value={value} onChange={onChange} className={cn("w-full py-3 rounded-2xl bg-muted/30 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none font-bold transition-all appearance-none text-sm", Icon ? "pl-12 pr-5" : "px-5")}>
          <option value="">Select {label}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className={cn("w-full py-3 rounded-2xl bg-muted/30 border-2 border-transparent focus:bg-background focus:border-primary/20 outline-none font-bold transition-all text-sm placeholder:text-muted-foreground/30", Icon ? "pl-12 pr-5" : "px-5")} />
      )}
    </div>
  </div>
);

const STEPS = [
  { id: "personal", title: "Identity", icon: User },
  { id: "family", title: "Family", icon: Users },
  { id: "academic", title: "Academic", icon: GraduationCap },
  { id: "enrollment", title: "Finalize", icon: ShieldCheck },
];

export default function AddStudent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sslcFileInputRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    religion: "",
    caste: "",
    address: "",
    email: "",
    phone: "",
    alternativePhone: "",
    otherPhone: "",
    fatherName: "",
    motherName: "",
    fatherPhone: "",
    motherPhone: "",
    branch: "",
    completionYear: "",
    tenthCompletionYear: "",
    tenthBoard: "",
    tenthTotalMarks: "",
    tenthObtainedMarks: "",
    tenthPercentage: "",
    plusTwoCompletionYear: "",
    plusTwoBoard: "",
    plusTwoPercentage: "",
    bachelorsUniversity: "",
    bachelorsCourse: "",
    bachelorsBranch: "",
    bachelorsPapersPassed: "",
    bachelorsPapersEqualised: "",
    mastersUniversity: "",
    mastersCourse: "",
    mastersBranch: "",
    mastersPapersPassed: "",
    mastersPapersEqualised: "",
    videoKycStatus: "Pending",
    employmentStatus: "Unemployed",
  });

  const [files, setFiles] = useState({
    idProof: null,
    tenthCertificate: null,
    plusTwoCertificate: null,
    bachelorsCertificates: [],
    mastersCertificates: [],
    affidavit: null,
    migrationCertificate: null,
    projectSubmission: null,
  });

  // Auto-calculate percentage for 10th
  useEffect(() => {
    if (formData.tenthTotalMarks && formData.tenthObtainedMarks) {
      const total = parseFloat(formData.tenthTotalMarks);
      const obtained = parseFloat(formData.tenthObtainedMarks);
      if (total > 0) {
        setFormData(p => ({ ...p, tenthPercentage: ((obtained / total) * 100).toFixed(2) }));
      }
    }
  }, [formData.tenthTotalMarks, formData.tenthObtainedMarks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (file) setFiles((p) => ({ ...p, [field]: file }));
  };

  const handleMultiFileChange = (e, field) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((p) => ({ ...p, [field]: [...p[field], ...newFiles].slice(0, 5) }));
  };

  const runLocalTesseract = async (file) => {
    try {
      const worker = await Tesseract.createWorker("eng", 1, {
        logger: m => { if (m.status === "recognizing text") setScanProgress(Math.round(m.progress * 100)); },
      });
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const cleanText = text.replace(/\s\s+/g, ' ').trim();
      const fields = {};
      
      const nameMatch = text.match(/(?:Name of Candidate|Name)[\s]*[:]*[\s]*([A-Z\s.]{3,45})/i);
      if (nameMatch) fields.name = nameMatch[1].trim().replace(/BOARD|GOVERNMENT|CERTIFICATE/gi, "").trim();

      const dobMatch = text.match(/(?:Date of Birth|DOB)[\s]*[\(]*[in figures]*[\)]*[\s]*[:]*[\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);
      if (dobMatch) { const p = dobMatch[1].split(/[\/\-]/); fields.dob = `${p[2]}-${p[1]}-${p[0]}`; }

      const sexMatch = text.match(/(?:Sex|Gender)[\s]*[:]*[\s]*(MALE|FEMALE)/i);
      if (sexMatch) fields.gender = sexMatch[1].charAt(0).toUpperCase() + sexRes[1].slice(1).toLowerCase();

      const yearMatch = text.match(/(?:Month & Year|Year)[\s]*[:]*[\s]*[A-Z\s]*(\d{4})/i);
      if (yearMatch) fields.tenthCompletionYear = yearMatch[1];

      return fields;
    } catch (err) {
      console.error("Local OCR Failed:", err);
      return {};
    }
  };

  const handleOCR = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFiles(p => ({ ...p, tenthCertificate: file }));
    setScanning(true);
    setScanProgress(10);

    try {
      const payload = new FormData();
      payload.append("certificate", file);

      setScanProgress(30);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL || "http://localhost:4040"}/api/ocr/scan-certificate`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );

      if (response.data.fallback) {
        setScanProgress(40);
        dispatch(showAlert({ type: "info", message: "Cloud AI pending activation. Using local engine..." }));
        const localFields = await runLocalTesseract(file);
        setFormData(prev => ({ ...prev, ...localFields }));
        dispatch(showAlert({ type: "success", message: "Local scan complete." }));
      } else if (response.data.success) {
        setScanProgress(100);
        setFormData(prev => ({ ...prev, ...response.data.data.fields }));
        dispatch(showAlert({ type: "success", message: "Google AI scan successful!" }));
      }

    } catch (error) {
      console.error("OCR API Error:", error);
      // HARD FALLBACK
      const localFields = await runLocalTesseract(file);
      setFormData(prev => ({ ...prev, ...localFields }));
      dispatch(showAlert({ type: "info", message: "Used local fallback scanner." }));
    } finally {
      setTimeout(() => { setScanning(false); setScanProgress(0); }, 500);
      if (e.target) e.target.value = null;
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => { if (formData[key]) payload.append(key, formData[key]); });
      ["idProof", "tenthCertificate", "plusTwoCertificate", "affidavit", "migrationCertificate", "projectSubmission"].forEach(field => {
        if (files[field]) payload.append(field, files[field]);
      });
      files.bachelorsCertificates.forEach(f => payload.append("bachelorsCertificates", f));
      files.mastersCertificates.forEach(f => payload.append("mastersCertificates", f));

      await axios.post(
        `${import.meta.env.VITE_BASE_URL || "http://localhost:4040"}/api/students/register`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );

      dispatch(showAlert({ type: "success", message: "Enrollment successful!" }));
      navigate("/dashboard/applications");
    } catch (error) {
      console.error("Submission Error:", error);
      dispatch(showAlert({ type: "error", message: error.response?.data?.message || "Failed to enroll student." }));
    } finally {
      setLoading(false);
    }
  };



  return (
    <DashboardLayout title="Enroll New Student">
      <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
        <style>
          {`
            @keyframes border-glow {
              0% { border-color: rgba(16, 185, 129, 0.2); box-shadow: 0 0 5px rgba(16, 185, 129, 0.1); }
              50% { border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
              100% { border-color: rgba(16, 185, 129, 0.2); box-shadow: 0 0 5px rgba(16, 185, 129, 0.1); }
            }
            .smart-scan-box {
              animation: border-glow 4s infinite ease-in-out;
            }
          `}
        </style>

        {/* Header */}
        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-3xl font-black tracking-tight text-foreground">Enroll Student</h2>
              <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Hybrid AI Integrated</p>
           </div>
           <button onClick={() => navigate("/dashboard/applications")} className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-2xl text-xs font-black hover:bg-muted/50 transition-all shadow-sm">
             <ChevronLeft className="w-4 h-4" /> BACK
           </button>
        </div>

        {/* Step Track */}
        <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm">
           <div className="flex items-center justify-between max-w-4xl mx-auto relative px-4">
              <div className="absolute top-[22px] left-8 right-8 h-1 bg-muted z-0 rounded-full" />
              <motion.div className="absolute top-[22px] left-8 h-1 bg-primary z-0 rounded-full" initial={false} animate={{ width: `calc(${ (currentStep / (STEPS.length - 1)) * 100 }% - 64px)` }} />
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center border-4 border-background transition-all shadow-lg", idx <= currentStep ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                      {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", idx === currentStep ? "text-primary" : "text-muted-foreground/40")}>{step.title}</span>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="space-y-8">
           <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                   {/* Compact AI Smart Scan */}
                   <div className="flex justify-center">
                      <div className="w-full max-w-xl bg-card border-2 smart-scan-box rounded-[2rem] p-8 flex items-center gap-6 relative overflow-hidden shadow-lg group">
                         {scanning && <motion.div initial={{ top: "-10%" }} animate={{ top: "110%" }} transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }} className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_10px_#10b981] z-10" />}
                         
                         <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                            <Sparkles className="w-7 h-7 animate-pulse" />
                         </div>

                         <div className="flex-1 space-y-1">
                           <h3 className="text-lg font-black tracking-tight text-emerald-500 uppercase">AI Smart Scan</h3>
                           <p className="text-muted-foreground font-semibold text-[10px] leading-relaxed">
                             Hybrid Engine: Uses Google Vision or local Fallback to fill demographics & academics.
                           </p>
                         </div>

                         <button type="button" onClick={() => sslcFileInputRef.current?.click()} className="px-6 py-3 bg-foreground text-background rounded-xl font-black shadow-lg hover:scale-105 transition-all text-[10px] uppercase shrink-0">
                           {scanning ? `${scanProgress}%` : "Scan with AI"}
                         </button>
                         <input type="file" ref={sslcFileInputRef} className="hidden" onChange={handleOCR} />
                      </div>
                   </div>

                   <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-8">
                      <h3 className="text-lg font-black flex items-center gap-3"><User className="text-primary w-5 h-5" /> Profile Identity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                         <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} icon={User} />
                         <InputField label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" icon={Calendar} />
                         <InputField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Other"]} icon={Baby} />
                         <InputField label="Religion" name="religion" value={formData.religion} onChange={handleChange} />
                         <InputField label="Caste" name="caste" value={formData.caste} onChange={handleChange} />
                         <InputField label="E-mail" name="email" value={formData.email} onChange={handleChange} type="email" icon={Mail} />
                         <InputField label="Primary Phone" name="phone" value={formData.phone} onChange={handleChange} icon={Phone} />
                         <InputField label="Alternative Phone" name="alternativePhone" value={formData.alternativePhone} onChange={handleChange} icon={Phone} />
                         <InputField label="Other Phone" name="otherPhone" value={formData.otherPhone} onChange={handleChange} icon={Phone} />
                         <div className="md:col-span-2"><InputField label="Permanent Address" name="address" value={formData.address} onChange={handleChange} icon={MapPin} /></div>
                         <FileUploadBox label="Identity Proof (ID)" field="idProof" value={files.idProof} onChange={handleFileChange} />
                      </div>
                   </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-8">
                   <h3 className="text-lg font-black flex items-center gap-3"><Users className="text-purple-500 w-5 h-5" /> Family Details</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} icon={User} />
                      <InputField label="Father's Phone" name="fatherPhone" value={formData.fatherPhone} onChange={handleChange} icon={Phone} />
                      <InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} icon={User} />
                      <InputField label="Mother's Phone" name="motherPhone" value={formData.motherPhone} onChange={handleChange} icon={Phone} />
                   </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="s3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                   <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-6">
                      <h3 className="text-md font-black flex items-center gap-3 text-emerald-500"><GraduationCap className="w-5 h-5" /> 10th Standard / SSLC</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         <InputField label="Completion Year" name="tenthCompletionYear" value={formData.tenthCompletionYear} onChange={handleChange} icon={Calendar} />
                         <InputField label="Board" name="tenthBoard" value={formData.tenthBoard} onChange={handleChange} />
                         <InputField label="Total Marks" name="tenthTotalMarks" value={formData.tenthTotalMarks} onChange={handleChange} type="number" />
                         <InputField label="Obtained Marks" name="tenthObtainedMarks" value={formData.tenthObtainedMarks} onChange={handleChange} type="number" />
                         <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-muted-foreground/60">Percentage</label><div className="px-5 py-3 rounded-2xl bg-emerald-500/5 border-2 border-emerald-500/10 text-emerald-600 font-black text-sm">{formData.tenthPercentage || "0.00"}%</div></div>
                         <FileUploadBox label="10th Certificate" field="tenthCertificate" value={files.tenthCertificate} onChange={handleFileChange} />
                      </div>
                   </div>
                   <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-6">
                      <h3 className="text-md font-black flex items-center gap-3 text-blue-500"><BookOpen className="w-5 h-5" /> Plus Two</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <InputField label="Completion Year" name="plusTwoCompletionYear" value={formData.plusTwoCompletionYear} onChange={handleChange} />
                         <InputField label="Board" name="plusTwoBoard" value={formData.plusTwoBoard} onChange={handleChange} />
                         <InputField label="Percentage" name="plusTwoPercentage" value={formData.plusTwoPercentage} onChange={handleChange} />
                         <FileUploadBox label="+2 Certificate" field="plusTwoCertificate" value={files.plusTwoCertificate} onChange={handleFileChange} />
                      </div>
                   </div>
                   <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-6">
                      <h3 className="text-md font-black flex items-center gap-3 text-indigo-500"><Building2 className="w-5 h-5" /> Bachelors</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         <InputField label="University" name="bachelorsUniversity" value={formData.bachelorsUniversity} onChange={handleChange} />
                         <InputField label="Course" name="bachelorsCourse" value={formData.bachelorsCourse} onChange={handleChange} />
                         <InputField label="Branch" name="bachelorsBranch" value={formData.bachelorsBranch} onChange={handleChange} />
                         <InputField label="Passed" name="bachelorsPapersPassed" value={formData.bachelorsPapersPassed} onChange={handleChange} type="number" />
                         <InputField label="Equalised" name="bachelorsPapersEqualised" value={formData.bachelorsPapersEqualised} onChange={handleChange} type="number" />
                         <FileUploadBox label="Certs (Max 5)" field="bachelorsCertificates" value={files.bachelorsCertificates} multiple onChange={handleMultiFileChange} />
                      </div>
                   </div>
                   <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-6">
                      <h3 className="text-md font-black flex items-center gap-3 text-rose-500"><School className="w-5 h-5" /> Masters</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         <InputField label="University" name="mastersUniversity" value={formData.mastersUniversity} onChange={handleChange} />
                         <InputField label="Course" name="mastersCourse" value={formData.mastersCourse} onChange={handleChange} />
                         <InputField label="Branch" name="mastersBranch" value={formData.mastersBranch} onChange={handleChange} />
                         <InputField label="Passed" name="mastersPapersPassed" value={formData.mastersPapersPassed} onChange={handleChange} type="number" />
                         <InputField label="Equalised" name="mastersPapersEqualised" value={formData.mastersPapersEqualised} onChange={handleChange} type="number" />
                         <FileUploadBox label="Certs (Max 5)" field="mastersCertificates" value={files.mastersCertificates} multiple onChange={handleMultiFileChange} />
                      </div>
                   </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                   <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-8">
                      <h3 className="text-lg font-black flex items-center gap-3"><Briefcase className="text-orange-500 w-5 h-5" /> Enrollment Selection</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <InputField label="Branch" name="branch" value={formData.branch} onChange={handleChange} />
                         <InputField label="Completion Year" name="completionYear" value={formData.completionYear} onChange={handleChange} icon={Calendar} />
                      </div>
                   </div>
                   <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-8">
                      <h3 className="text-lg font-black flex items-center gap-3"><ShieldCheck className="text-emerald-500 w-5 h-5" /> Compliance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                         <InputField label="Video KYC" name="videoKycStatus" value={formData.videoKycStatus} onChange={handleChange} options={["Pending", "Completed", "Rejected"]} />
                         <InputField label="Employment" name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} options={["Employed", "Unemployed", "Self-Employed", "Student"]} />
                         <FileUploadBox label="Affidavit" field="affidavit" value={files.affidavit} onChange={handleFileChange} />
                         <FileUploadBox label="Migration" field="migrationCertificate" value={files.migrationCertificate} onChange={handleFileChange} />
                         <FileUploadBox label="Project" field="projectSubmission" value={files.projectSubmission} onChange={handleFileChange} />
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>

           <div className="flex items-center justify-between bg-card border border-border rounded-[2rem] p-6 shadow-xl sticky bottom-6 z-50">
               <button type="button" onClick={prevStep} disabled={currentStep === 0} className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-black transition-all disabled:opacity-30 text-xs">
                 <ChevronLeft className="w-4 h-4" /> BACK
               </button>
               {currentStep === STEPS.length - 1 ? (
                 <button type="button" onClick={handleSubmit} disabled={loading} className="group flex items-center gap-2 px-10 py-3 rounded-2xl bg-primary text-white font-black hover:scale-[1.02] transition-all shadow-xl text-xs">
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> SUBMIT</>}
                 </button>
               ) : (
                 <button type="button" onClick={nextStep} className="group flex items-center gap-2 px-10 py-3 rounded-2xl bg-foreground text-background font-black hover:scale-[1.02] transition-all shadow-xl text-xs">
                   CONTINUE <ChevronRight className="w-4 h-4" />
                 </button>
               )}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
