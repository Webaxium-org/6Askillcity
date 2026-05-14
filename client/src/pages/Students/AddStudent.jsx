import React, { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
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
  GitBranch,
  ChevronDown,
} from "lucide-react";
import { axiosInstance } from "../../api/axiosInstance";
import { getPermittedCourses } from "../../api/partner.api";

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+971", country: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
];

const COUNTRIES = [
  "India",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Oman",
  "Kuwait",
  "Bahrain",
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
];

const cn = (...classes) => classes.filter(Boolean).join(" ");

const FileUploadBox = ({
  label,
  field,
  value,
  multiple = false,
  onChange,
  error,
  required,
}) => {
  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value && (value instanceof File || typeof value === "string");

  return (
    <div className="space-y-1.5">
      <label
        className={cn(
          "text-[9px] font-black uppercase tracking-widest transition-colors",
          error ? "text-rose-500" : "text-foreground",
        )}
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div
        className={cn(
          "relative border border-dashed rounded-xl p-3 transition-all group",
          error
            ? "border-rose-500 bg-rose-500/5"
            : hasValue
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-border hover:border-primary/30 hover:bg-muted/30",
        )}
      >
        <input
          type="file"
          multiple={multiple}
          onChange={(e) => onChange(e, field)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center text-center py-1">
          {hasValue ? (
            <div
              className={cn(
                "flex items-center gap-2 text-[10px] font-bold",
                error ? "text-rose-600" : "text-emerald-600",
              )}
            >
              {error ? (
                <UploadCloud className="w-3 h-3" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              {multiple
                ? `${value.length} Files`
                : error
                  ? "ERROR"
                  : "Attached"}
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center gap-2 text-[9px] font-black transition-colors",
                error
                  ? "text-rose-500"
                  : "text-muted-foreground/50 group-hover:text-primary",
              )}
            >
              <UploadCloud className="w-3 h-3" />{" "}
              {error ? "REQUIRED" : "UPLOAD"}
            </div>
          )}
        </div>
      </div>
      {hasValue && (
        <div className="flex flex-col gap-1 px-1 pt-1">
          {multiple ? (
            value.map((v, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-primary/60" />
                <p className="text-[10px] font-bold text-muted-foreground truncate max-w-[200px]">
                  {v instanceof File ? v.name : v.split("/").pop()}
                </p>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-primary/60" />
              <p className="text-[10px] font-bold text-muted-foreground truncate max-w-[200px]">
                {value instanceof File
                  ? value.name
                  : typeof value === "string"
                    ? value.split("/").pop()
                    : "Attached"}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[8px] font-black uppercase text-rose-500 ml-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  options,
  icon: Icon,
  error,
  required,
}) => (
  <div className="space-y-1.5 group">
    <label
      className={cn(
        "text-[10px] font-black uppercase tracking-widest transition-colors",
        error
          ? "text-rose-500"
          : "text-foreground group-focus-within:text-primary",
      )}
    >
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-all",
            error
              ? "text-rose-500"
              : "text-muted-foreground/40 group-focus-within:text-primary",
          )}
        />
      )}
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={cn(
            "w-full py-3 rounded-xl bg-muted/30 border focus:bg-background outline-none font-bold transition-all appearance-none text-sm",
            error
              ? "border-rose-500 bg-rose-500/5 text-rose-600"
              : "border-border focus:border-primary/20",
            Icon ? "pl-12 pr-5" : "px-5",
          )}
        >
          <option value="">Select {label}</option>
          {options.map((opt, idx) => {
            const isObj = opt && typeof opt === "object";
            const optLabel = isObj ? opt.label : opt;
            const optValue = isObj ? opt.value : opt;
            return (
              <option key={isObj ? optValue : idx} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            "w-full py-3 rounded-xl bg-muted/30 border focus:bg-background outline-none font-bold transition-all text-sm placeholder:text-muted-foreground/30",
            error
              ? "border-rose-500 bg-rose-500/5 text-rose-600"
              : "border-border focus:border-primary/20",
            Icon ? "pl-12 pr-5" : "px-5",
          )}
        />
      )}
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[9px] font-black uppercase text-rose-500 mt-1 ml-1"
      >
        {error}
      </motion.p>
    )}
  </div>
);

const PhoneInputField = ({
  label,
  name,
  value,
  onChange,
  codeName,
  codeValue,
  otherPhoneCode,
  icon: Icon,
  error,
  required,
}) => (
  <div className="space-y-1.5 group">
    <label
      className={cn(
        "text-[10px] font-black uppercase tracking-widest transition-colors",
        error
          ? "text-rose-500"
          : "text-foreground group-focus-within:text-primary",
      )}
    >
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="flex gap-2">
      <div className="relative w-28 shrink-0">
        <select
          name={codeName}
          value={codeValue}
          onChange={onChange}
          className={cn(
            "w-full py-3 pl-4 pr-8 rounded-xl bg-muted/30 border focus:bg-background outline-none font-bold transition-all appearance-none text-sm",
            error
              ? "border-rose-500 bg-rose-500/5 text-rose-600"
              : "border-border focus:border-primary/20",
          )}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code + c.country} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        <div
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
            error
              ? "text-rose-500"
              : "text-muted-foreground/40 group-focus-within:text-primary",
          )}
        >
          <ChevronDown className="w-3 h-3" />
        </div>
      </div>
      <div className="relative flex-1">
        {Icon && (
          <Icon
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-all",
              error
                ? "text-rose-500"
                : "text-muted-foreground/40 group-focus-within:text-primary",
            )}
          />
        )}
        <input
          name={name}
          type="tel"
          value={value}
          onChange={onChange}
          placeholder="Phone number"
          className={cn(
            "w-full py-3 rounded-xl bg-muted/30 border focus:bg-background outline-none font-bold transition-all text-sm placeholder:text-muted-foreground/30",
            error
              ? "border-rose-500 bg-rose-500/5 text-rose-600"
              : "border-border focus:border-primary/20",
            Icon ? "pl-12 pr-5" : "px-5",
          )}
        />
      </div>
    </div>
    {error && (
      <p className="text-[8px] font-black uppercase text-rose-500 ml-1">
        {error}
      </p>
    )}
  </div>
);

const STEPS = [
  { id: "personal", title: "Identity", icon: User },
  { id: "family", title: "Family", icon: Users },
  { id: "academic", title: "Academic", icon: GraduationCap },
  { id: "enrollment", title: "Finalize", icon: ShieldCheck },
];

const ALL_REQUIRED_FIELDS = [
  { key: "name", label: "Student Name" },
  { key: "dob", label: "Date of Birth" },
  { key: "gender", label: "Gender" },
  { key: "religion", label: "Religion" },
  { key: "caste", label: "Caste" },
  { key: "country", label: "Country" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Primary Phone" },
  { key: "alternativePhone", label: "Alternative Phone" },
  { key: "address", label: "Permanent Address" },
  { key: "fatherName", label: "Father's Name" },
  { key: "motherName", label: "Mother's Name" },
  { key: "fatherPhone", label: "Father's Phone" },
  { key: "motherPhone", label: "Mother's Phone" },
  { key: "tenthCompletionYear", label: "10th Completion Year" },
  { key: "tenthBoard", label: "10th Board" },
  { key: "tenthTotalMarks", label: "10th Total Marks" },
  { key: "tenthObtainedMarks", label: "10th Obtained Marks" },
  { key: "plusTwoCompletionYear", label: "Plus Two Completion Year" },
  { key: "plusTwoBoard", label: "Plus Two Board" },
  { key: "plusTwoPercentage", label: "Plus Two Percentage" },
  { key: "university", label: "University" },
  { key: "program", label: "Program" },
  { key: "branch", label: "Branch" },
  { key: "batch", label: "Batch" },
  { key: "highestQualification", label: "Highest Qualification" },
  { key: "bachelorsCompletionYear", label: "Bachelors Completion Year" },
  { key: "mastersCompletionYear", label: "Masters Completion Year" },
];

const ALL_REQUIRED_FILES = [
  { key: "idProof", label: "Identity Proof" },
  { key: "tenthCertificate", label: "10th Certificate" },
  { key: "plusTwoCertificate", label: "Plus Two Certificate" },
];

export default function AddStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [studentId, setStudentId] = useState(id || null);

  const sslcFileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [permittedCourses, setPermittedCourses] = useState([]);
  const [permittedHierarchy, setPermittedHierarchy] = useState({
    universities: [],
    programs: [],
    branches: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, studentRes] = await Promise.all([
          getPermittedCourses(),
          studentId
            ? axiosInstance.get(`/students/${studentId}`)
            : Promise.resolve(null),
        ]);

        if (coursesRes.success) {
          setPermittedCourses(coursesRes.data);
          setPermittedHierarchy(
            coursesRes.permittedHierarchy || {
              universities: [],
              programs: [],
              branches: [],
            },
          );
        }

        if (studentRes?.data?.success) {
          const s = studentRes.data.data;

          const splitPhone = (fullPhone) => {
            if (!fullPhone) return { code: "+91", number: "" };
            // Sort by length desc to match longest code first (e.g. +971 vs +9)
            const sortedCodes = [...COUNTRY_CODES].sort(
              (a, b) => b.code.length - a.code.length,
            );
            const match = sortedCodes.find((c) => fullPhone.startsWith(c.code));
            if (match) {
              return {
                code: match.code,
                number: fullPhone.slice(match.code.length),
              };
            }
            return { code: "+91", number: fullPhone };
          };

          const p = splitPhone(s.phone);
          const ap = splitPhone(s.alternativePhone);
          const op = splitPhone(s.otherPhone);
          const fp = splitPhone(s.fatherPhone);
          const mp = splitPhone(s.motherPhone);

          setFormData({
            name: s.name || "",
            dob: s.dob ? s.dob.split("T")[0] : "",
            gender: s.gender || "",
            religion: s.religion || "",
            caste: s.caste || "",
            address: s.address || "",
            email: s.email || "",
            country: s.country || "India",
            phoneCode: p.code,
            phone: p.number,
            alternativePhoneCode: ap.code,
            alternativePhone: ap.number,
            otherPhoneCode: op.code,
            otherPhone: op.number,
            fatherName: s.fatherName || "",
            motherName: s.motherName || "",
            fatherPhoneCode: fp.code,
            fatherPhone: fp.number,
            motherPhoneCode: mp.code,
            motherPhone: mp.number,
            university: s.university?._id || s.university || "",
            program: s.program?._id || s.program || "",
            branch: s.branch?._id || s.branch || "",
            completionYear: s.completionYear || "",
            tenthCompletionYear: s.tenth?.completionYear || "",
            tenthBoard: s.tenth?.board || "",
            tenthTotalMarks: s.tenth?.totalMarks || "",
            tenthObtainedMarks: s.tenth?.obtainedMarks || "",
            tenthPercentage: s.tenth?.percentage || "",
            plusTwoCompletionYear: s.plusTwo?.completionYear || "",
            plusTwoBoard: s.plusTwo?.board || "",
            plusTwoPercentage: s.plusTwo?.percentage || "",
            bachelorsUniversity: s.bachelors?.university || "",
            bachelorsCourse: s.bachelors?.course || "",
            bachelorsBranch: s.bachelors?.branch || "",
            bachelorsCompletionYear: s.bachelors?.completionYear || "",
            bachelorsPapersPassed: s.bachelors?.papersPassed || "",
            bachelorsPapersEqualised: s.bachelors?.papersEqualised || "",
            mastersUniversity: s.masters?.university || "",
            mastersCourse: s.masters?.course || "",
            mastersBranch: s.masters?.branch || "",
            mastersCompletionYear: s.masters?.completionYear || "",
            mastersPapersPassed: s.masters?.papersPassed || "",
            mastersPapersEqualised: s.masters?.papersEqualised || "",
            videoKycStatus: s.videoKycStatus || "Pending",
            employmentStatus: s.employmentStatus || "Unemployed",
            highestQualification: s.highestQualification || "Plus Two",
            batch: s.batch || "",
            applicationStatus: s.applicationStatus || "Draft",
            enrollmentStatus: s.enrollmentStatus || "Identity",
          });

          // Determine current step from enrollmentStatus
          const stepIndex = [
            "Identity",
            "Family",
            "Academic",
            "Completed",
          ].indexOf(s.enrollmentStatus || "Identity");
          if (stepIndex !== -1) {
            setCurrentStep(stepIndex);
          }

          // Set existing files as paths (string) so they show as "Attached"
          setFiles({
            idProof: s.idProof?.path || s.idProof || null,
            tenthCertificate:
              s.tenth?.certificate?.path || s.tenth?.certificate || null,
            plusTwoCertificate:
              s.plusTwo?.certificate?.path || s.plusTwo?.certificate || null,
            bachelorsCertificates: (s.bachelors?.certificates || []).map(
              (c) => c.path || c,
            ),
            mastersCertificates: (s.masters?.certificates || []).map(
              (c) => c.path || c,
            ),
            affidavit: s.affidavit?.path || s.affidavit || null,
            migrationCertificate:
              s.migrationCertificate?.path || s.migrationCertificate || null,
            projectSubmission:
              s.projectSubmission?.path || s.projectSubmission || null,
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [studentId]);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    religion: "",
    caste: "",
    address: "",
    email: "",
    country: "India",
    phoneCode: "+91",
    phone: "",
    alternativePhoneCode: "+91",
    alternativePhone: "",
    otherPhoneCode: "+91",
    otherPhone: "",
    fatherName: "",
    motherName: "",
    fatherPhoneCode: "+91",
    fatherPhone: "",
    motherPhoneCode: "+91",
    motherPhone: "",
    university: "",
    program: "",
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
    bachelorsCompletionYear: "",
    bachelorsPapersPassed: "",
    bachelorsPapersEqualised: "",
    mastersUniversity: "",
    mastersCourse: "",
    mastersBranch: "",
    mastersCompletionYear: "",
    mastersPapersPassed: "",
    mastersPapersEqualised: "",
    videoKycStatus: "Pending",
    employmentStatus: "Unemployed",
    highestQualification: "Plus Two",
    batch: "",
    applicationStatus: "Draft",
    enrollmentStatus: "Identity",
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
        setFormData((p) => ({
          ...p,
          tenthPercentage: ((obtained / total) * 100).toFixed(2),
        }));
      }
    }
  }, [formData.tenthTotalMarks, formData.tenthObtainedMarks]);

  // Reset program/branch if selections become invalid
  useEffect(() => {
    if (formData.university) {
      // 1. Verify if selected program still belongs to the selected university
      const isProgValid = permittedHierarchy.programs.some(
        (p) =>
          (p.university?._id?.toString() || p.university?.toString()) ===
            formData.university && p._id.toString() === formData.program,
      );

      if (!isProgValid && formData.program) {
        // Reset program and branch if program is no longer valid for this uni
        setFormData((prev) => ({ ...prev, program: "", branch: "" }));
      } else if (formData.program) {
        // 2. If program is valid, verify if selected branch still belongs to the selected program
        const isBranchValid = permittedHierarchy.branches.some(
          (b) =>
            (b.program?._id?.toString() || b.program?.toString()) ===
              formData.program && b._id.toString() === formData.branch,
        );
        if (!isBranchValid && formData.branch) {
          setFormData((prev) => ({ ...prev, branch: "" }));
        }
      }
    }
  }, [formData.university, formData.program, permittedHierarchy]);

  // Auto-sync phone codes with selected country
  useEffect(() => {
    const countryData = COUNTRY_CODES.find(
      (c) => c.country === formData.country,
    );
    if (countryData) {
      setFormData((prev) => ({
        ...prev,
        phoneCode: countryData.code,
        alternativePhoneCode: countryData.code,
        otherPhoneCode: countryData.code,
        fatherPhoneCode: countryData.code,
        motherPhoneCode: countryData.code,
      }));
    }
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((p) => ({ ...p, [field]: file }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    }
  };

  const handleMultiFileChange = (e, field) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((p) => ({
      ...p,
      [field]: [...p[field], ...newFiles].slice(0, 5),
    }));
  };

  const handleOCR = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFiles((p) => ({ ...p, tenthCertificate: file }));
    setScanning(true);
    setScanProgress(30);

    try {
      const payload = new FormData();
      payload.append("certificate", file);

      setScanProgress(60);

      const response = await axiosInstance.post(
        "/ocr/scan-certificate",
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        setScanProgress(100);
        setFormData((prev) => ({ ...prev, ...response.data.data.fields }));
        dispatch(
          showAlert({ type: "success", message: "Gemini AI scan successful!" }),
        );
      }
    } catch (error) {
      console.error("OCR API Error:", error);
      dispatch(
        showAlert({
          type: "error",
          message:
            error.response?.data?.message ||
            "AI Scan failed. Please enter details manually.",
        }),
      );
    } finally {
      setTimeout(() => {
        setScanning(false);
        setScanProgress(0);
      }, 500);
      if (e.target) e.target.value = null;
    }
  };

  const saveDraft = async (
    quiet = true,
    newStatus = null,
    newEnrollmentStatus = null,
  ) => {
    if (!formData.name) {
      if (!quiet)
        dispatch(
          showAlert({
            type: "error",
            message: "Student name is required to save progress.",
          }),
        );
      return null;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      // Group phone fields to concatenate them
      const phoneFields = [
        { main: "phone", code: "phoneCode" },
        { main: "alternativePhone", code: "alternativePhoneCode" },
        { main: "otherPhone", code: "otherPhoneCode" },
        { main: "fatherPhone", code: "fatherPhoneCode" },
        { main: "motherPhone", code: "motherPhoneCode" },
      ];

      const phoneMainKeys = phoneFields.map((f) => f.main);
      const phoneCodeKeys = phoneFields.map((f) => f.code);

      Object.keys(formData).forEach((key) => {
        // Skip phone code fields as they will be merged with main phone fields
        if (phoneCodeKeys.includes(key)) return;

        if (formData[key] !== undefined && formData[key] !== null) {
          let value = formData[key];

          // If this is a main phone field, concatenate with its code
          if (phoneMainKeys.includes(key)) {
            const codeKey = phoneFields.find((f) => f.main === key).code;
            const code = formData[codeKey] || "";
            const number = formData[key] || "";
            // Only concatenate if number is provided
            value = number ? `${code}${number}` : "";
          }

          payload.append(key, value);
        }
      });

      if (newStatus) {
        payload.set("applicationStatus", newStatus);
      } else if (formData.applicationStatus) {
        payload.set("applicationStatus", formData.applicationStatus);
      }

      if (newEnrollmentStatus) {
        payload.set("enrollmentStatus", newEnrollmentStatus);
      } else if (formData.enrollmentStatus) {
        payload.set("enrollmentStatus", formData.enrollmentStatus);
      }

      // Files - only append if they are File objects (newly uploaded)
      [
        "idProof",
        "tenthCertificate",
        "plusTwoCertificate",
        "affidavit",
        "migrationCertificate",
        "projectSubmission",
      ].forEach((field) => {
        if (files[field] instanceof File) payload.append(field, files[field]);
      });

      files.bachelorsCertificates.forEach((f) => {
        if (f instanceof File) payload.append("bachelorsCertificates", f);
      });
      files.mastersCertificates.forEach((f) => {
        if (f instanceof File) payload.append("mastersCertificates", f);
      });

      let response;
      if (studentId) {
        response = await axiosInstance.put(`/students/${studentId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axiosInstance.post("/students/register", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        if (!studentId) {
          setStudentId(response.data.data._id);
          // Update URL without refreshing
          window.history.replaceState(
            null,
            "",
            `/dashboard/student/edit/${response.data.data._id}`,
          );
        }
        return response.data.data;
      }
    } catch (error) {
      console.error("Draft Save Error:", error);
      if (!quiet)
        dispatch(
          showAlert({ type: "error", message: "Failed to save draft." }),
        );
    } finally {
      setLoading(false);
    }
    return null;
  };
  const nextStep = async () => {
    // Validation for Step 0: Profile Identity
    if (currentStep === 0) {
      const requiredFields = [
        { key: "name", label: "Full Name" },
        { key: "dob", label: "Date of Birth" },
        { key: "gender", label: "Gender" },
        { key: "religion", label: "Religion" },
        { key: "caste", label: "Caste" },
        { key: "country", label: "Country" },
        { key: "email", label: "E-mail" },
        { key: "phone", label: "Primary Phone" },
        { key: "alternativePhone", label: "Alternative Phone" },
        { key: "address", label: "Permanent Address" },
      ];

      const newErrors = {};
      let firstErrorField = "";

      requiredFields.forEach((field) => {
        const val = formData[field.key]?.toString().trim();
        if (!val) {
          newErrors[field.key] = `${field.label} is required.`;
          if (!firstErrorField) firstErrorField = field.label;
        } else {
          // Email validation
          if (field.key === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val)) {
              newErrors.email = "Invalid E-mail format.";
              if (!firstErrorField) firstErrorField = "E-mail Format";
            }
          }
          // Phone validation
          if (["phone", "alternativePhone"].includes(field.key)) {
            const phoneRegex = /^\d{7,15}$/;
            if (!phoneRegex.test(val)) {
              newErrors[field.key] = `Invalid ${field.label} (7-15 digits).`;
              if (!firstErrorField) firstErrorField = field.label;
            }
          }
        }
      });

      // Optional: Alternate Phone validation if provided
      if (formData.otherPhone?.trim()) {
        const phoneRegex = /^\d{7,15}$/;
        if (!phoneRegex.test(formData.otherPhone.trim())) {
          newErrors.otherPhone = "Invalid Alternate Phone (7-15 digits).";
          if (!firstErrorField) firstErrorField = "Alternate Phone";
        }
      }

      // Identity Proof validation: Required if it's a new student (no studentId) and no file selected
      if (!studentId && !files.idProof) {
        newErrors.idProof = "Identity Proof is required.";
        if (!firstErrorField) firstErrorField = "Identity Proof";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        dispatch(
          showAlert({
            type: "error",
            message: firstErrorField.includes("Format")
              ? `Please enter a valid ${firstErrorField.split(" ")[0]}`
              : `Please fill all required fields correctly: ${firstErrorField}`,
          }),
        );
        return;
      }

      // Clear errors if all valid
      setErrors({});
    }

    // Validation for Step 3: Enrollment Selection
    if (currentStep === 3) {
      const requiredFields = [
        { key: "university", label: "University" },
        { key: "program", label: "Program" },
        { key: "branch", label: "Branch" },
        { key: "completionYear", label: "Completion Year" },
        { key: "batch", label: "Batch" },
      ];

      const newErrors = {};
      let firstErrorField = "";

      requiredFields.forEach((field) => {
        const val = formData[field.key]?.toString().trim();
        if (!val) {
          newErrors[field.key] = `${field.label} is required.`;
          if (!firstErrorField) firstErrorField = field.label;
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        dispatch(
          showAlert({
            type: "error",
            message: `Please fill all required enrollment fields: ${firstErrorField}`,
          }),
        );
        return;
      }

      setErrors({});
    }

    // Validation for Step 1: Family Details
    if (currentStep === 1) {
      const requiredFields = [
        { key: "fatherName", label: "Father's Name" },
        { key: "fatherPhone", label: "Father's Phone" },
      ];

      const newErrors = {};
      let firstErrorField = "";

      requiredFields.forEach((field) => {
        const val = formData[field.key]?.toString().trim();
        if (!val) {
          newErrors[field.key] = `${field.label} is required.`;
          if (!firstErrorField) firstErrorField = field.label;
        } else if (field.key === "fatherPhone") {
          const phoneRegex = /^\d{7,15}$/;
          if (!phoneRegex.test(val)) {
            newErrors.fatherPhone = "Invalid Father's Phone (7-15 digits).";
            if (!firstErrorField) firstErrorField = "Father's Phone Format";
          }
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        dispatch(
          showAlert({
            type: "error",
            message: firstErrorField.includes("Format")
              ? `Please enter a valid ${firstErrorField.split(" ")[0]}`
              : `Please fill all required fields: ${firstErrorField}`,
          }),
        );
        return;
      }

      setErrors({});
    }

    // Determine new enrollment status based on current step
    const enrollmentStatuses = ["Identity", "Family", "Academic", "Completed"];
    const newEnrollmentStatus =
      enrollmentStatuses[currentStep + 1] || "Completed";

    // Sync status to state and then save
    setFormData((prev) => ({
      ...prev,
      enrollmentStatus: newEnrollmentStatus,
    }));

    const saved = await saveDraft(
      false,
      formData.applicationStatus,
      newEnrollmentStatus,
    );
    if (saved) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for Final Step (Enrollment Selection)
    if (currentStep === 3) {
      const requiredFields = [
        { key: "university", label: "University" },
        { key: "program", label: "Program" },
        { key: "branch", label: "Branch" },
        { key: "completionYear", label: "Completion Year" },
        { key: "batch", label: "Batch" },
      ];

      const newErrors = {};
      let firstErrorField = "";

      requiredFields.forEach((field) => {
        const val = formData[field.key]?.toString().trim();
        if (!val) {
          newErrors[field.key] = `${field.label} is required.`;
          if (!firstErrorField) firstErrorField = field.label;
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        dispatch(
          showAlert({
            type: "error",
            message: `Please fill all required enrollment fields: ${firstErrorField}`,
          }),
        );
        return;
      }
      setErrors({});
    }

    // Final Save Draft before submission and set enrollmentStatus to Completed
    const saved = await saveDraft(
      false,
      formData.applicationStatus,
      "Completed",
    );
    if (!saved && !studentId) return;

    setLoading(true);

    try {
      await axiosInstance.post(`/students/${studentId || saved._id}/submit`);

      dispatch(
        showAlert({
          type: "success",
          message: "Application submitted for eligibility review!",
        }),
      );
      navigate("/dashboard/applications");
    } catch (error) {
      console.error("Submission Error:", error);
      dispatch(
        showAlert({
          type: "error",
          message:
            error.response?.data?.message || "Failed to submit application.",
        }),
      );
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
            <h2 className="text-3xl font-black tracking-tight text-foreground">
              Enroll Student
            </h2>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
              Hybrid AI Integrated
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/applications")}
            className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-2xl text-xs font-black hover:bg-muted/50 transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> BACK
          </button>
        </div>

        {/* Step Track */}
        <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm">
          <div className="flex items-center justify-between max-w-4xl mx-auto relative px-4">
            <div className="absolute top-[22px] left-8 right-8 h-1 bg-muted z-0 rounded-full" />
            <motion.div
              className="absolute top-[22px] left-8 h-1 bg-primary z-0 rounded-full"
              initial={false}
              animate={{
                width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - 64px)`,
              }}
            />
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center gap-3"
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center border-4 border-background transition-all shadow-lg",
                      idx <= currentStep
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {idx < currentStep ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      idx === currentStep
                        ? "text-primary"
                        : "text-muted-foreground/40",
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Compact AI Smart Scan */}
                <div className="flex justify-center px-4">
                  <div className="w-full max-w-xl bg-card border smart-scan-box rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 relative overflow-hidden shadow-lg group">
                    {scanning && (
                      <motion.div
                        initial={{ top: "-10%" }}
                        animate={{ top: "110%" }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.5,
                          ease: "linear",
                        }}
                        className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_10px_#10b981] z-10"
                      />
                    )}

                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                      <Sparkles className="w-7 h-7 animate-pulse" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <h3 className="text-lg font-black tracking-tight text-emerald-500 uppercase">
                        AI Smart Scan
                      </h3>
                      <p className="text-muted-foreground font-semibold text-[10px] leading-relaxed max-w-[280px] sm:max-w-none mx-auto sm:mx-0">
                        Powered by Gemini 1.5 Flash: Instantly extracts
                        demographics & academics from certificates.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => sslcFileInputRef.current?.click()}
                      className="w-full sm:w-auto px-6 py-3 bg-foreground text-background rounded-xl font-black shadow-lg hover:scale-105 transition-all text-[10px] uppercase shrink-0"
                    >
                      {scanning ? `${scanProgress}%` : "Scan with AI"}
                    </button>
                    <input
                      type="file"
                      ref={sslcFileInputRef}
                      className="hidden"
                      onChange={handleOCR}
                    />
                  </div>
                </div>

                <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-8">
                  <h3 className="text-lg font-black flex items-center gap-3">
                    <User className="text-primary w-5 h-5" /> Profile Identity
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InputField
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      icon={User}
                      error={errors.name}
                      required
                    />
                    <InputField
                      label="Date of Birth"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      type="date"
                      icon={Calendar}
                      error={errors.dob}
                      required
                    />
                    <InputField
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      options={["Male", "Female", "Other"]}
                      icon={Baby}
                      error={errors.gender}
                      required
                    />
                    <InputField
                      label="Religion"
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      error={errors.religion}
                      required
                    />
                    <InputField
                      label="Caste"
                      name="caste"
                      value={formData.caste}
                      onChange={handleChange}
                      error={errors.caste}
                      required
                    />
                    <InputField
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      options={COUNTRIES}
                      icon={MapPin}
                      error={errors.country}
                      required
                    />
                    <InputField
                      label="E-mail"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      icon={Mail}
                      error={errors.email}
                      required
                    />
                    <PhoneInputField
                      label="Primary Phone"
                      name="phone"
                      value={formData.phone}
                      codeName="phoneCode"
                      codeValue={formData.phoneCode}
                      onChange={handleChange}
                      icon={Phone}
                      error={errors.phone}
                      required
                    />
                    <PhoneInputField
                      label="Alternative Phone"
                      name="alternativePhone"
                      value={formData.alternativePhone}
                      codeName="alternativePhoneCode"
                      codeValue={formData.alternativePhoneCode}
                      onChange={handleChange}
                      icon={Phone}
                      error={errors.alternativePhone}
                      required
                    />
                    <PhoneInputField
                      label="Alternative Phone 2"
                      name="otherPhone"
                      value={formData.otherPhone}
                      codeName="otherPhoneCode"
                      codeValue={formData.otherPhoneCode}
                      onChange={handleChange}
                      icon={Phone}
                    />
                    <div className="md:col-span-2">
                      <InputField
                        label="Permanent Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        icon={MapPin}
                        error={errors.address}
                        required
                      />
                    </div>
                    <FileUploadBox
                      label="Identity Proof (ID)"
                      field="idProof"
                      value={files.idProof}
                      onChange={handleFileChange}
                      error={errors.idProof}
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-8"
              >
                <h3 className="text-lg font-black flex items-center gap-3">
                  <Users className="text-purple-500 w-5 h-5" /> Family Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField
                    label="Father's Name"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    icon={User}
                    error={errors.fatherName}
                    required
                  />
                  <PhoneInputField
                    label="Father's Phone"
                    name="fatherPhone"
                    value={formData.fatherPhone}
                    codeName="fatherPhoneCode"
                    codeValue={formData.fatherPhoneCode}
                    onChange={handleChange}
                    icon={Phone}
                    error={errors.fatherPhone}
                    required
                  />
                  <InputField
                    label="Mother's Name"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    icon={User}
                    error={errors.motherName}
                  />
                  <PhoneInputField
                    label="Mother's Phone"
                    name="motherPhone"
                    value={formData.motherPhone}
                    codeName="motherPhoneCode"
                    codeValue={formData.motherPhoneCode}
                    onChange={handleChange}
                    icon={Phone}
                    error={errors.motherPhone}
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-6">
                  <h3 className="text-md font-black flex items-center gap-3 text-emerald-500">
                    <GraduationCap className="w-5 h-5" /> 10th Standard / SSLC
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <InputField
                      label="Completion Year"
                      name="tenthCompletionYear"
                      value={formData.tenthCompletionYear}
                      onChange={handleChange}
                      type="number"
                      icon={Calendar}
                      error={errors.tenthCompletionYear}
                    />
                    <InputField
                      label="Board"
                      name="tenthBoard"
                      value={formData.tenthBoard}
                      onChange={handleChange}
                      error={errors.tenthBoard}
                    />
                    <InputField
                      label="Total Marks"
                      name="tenthTotalMarks"
                      value={formData.tenthTotalMarks}
                      onChange={handleChange}
                      type="number"
                      error={errors.tenthTotalMarks}
                    />
                    <InputField
                      label="Obtained Marks"
                      name="tenthObtainedMarks"
                      value={formData.tenthObtainedMarks}
                      onChange={handleChange}
                      type="number"
                      error={errors.tenthObtainedMarks}
                    />
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-foreground">
                        Percentage
                      </label>
                      <div className="px-5 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 font-black text-sm">
                        {formData.tenthPercentage || "0.00"}%
                      </div>
                    </div>
                    <FileUploadBox
                      label="10th Certificate"
                      field="tenthCertificate"
                      value={files.tenthCertificate}
                      onChange={handleFileChange}
                      error={errors.tenthCertificate}
                    />
                  </div>
                </div>
                <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-6">
                  <h3 className="text-md font-black flex items-center gap-3 text-blue-500">
                    <BookOpen className="w-5 h-5" /> Plus Two
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InputField
                      label="Completion Year"
                      name="plusTwoCompletionYear"
                      value={formData.plusTwoCompletionYear}
                      onChange={handleChange}
                      type="number"
                      error={errors.plusTwoCompletionYear}
                    />
                    <InputField
                      label="Board"
                      name="plusTwoBoard"
                      value={formData.plusTwoBoard}
                      onChange={handleChange}
                      error={errors.plusTwoBoard}
                    />
                    <InputField
                      label="Percentage"
                      name="plusTwoPercentage"
                      value={formData.plusTwoPercentage}
                      onChange={handleChange}
                      error={errors.plusTwoPercentage}
                    />
                    <FileUploadBox
                      label="+2 Certificate"
                      field="plusTwoCertificate"
                      value={files.plusTwoCertificate}
                      onChange={handleFileChange}
                      error={errors.plusTwoCertificate}
                    />
                  </div>
                </div>
                <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-6">
                  <h3 className="text-md font-black flex items-center gap-3 text-amber-500">
                    <GraduationCap className="w-5 h-5" /> Highest Qualification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Select Highest Qualification"
                      name="highestQualification"
                      value={formData.highestQualification}
                      onChange={handleChange}
                      options={["Plus Two", "Bachelors", "Masters"]}
                      icon={GraduationCap}
                      error={errors.highestQualification}
                    />
                  </div>
                </div>

                {(formData.highestQualification === "Bachelors" ||
                  formData.highestQualification === "Masters") && (
                  <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-6">
                    <h3 className="text-md font-black flex items-center gap-3 text-indigo-500">
                      <Building2 className="w-5 h-5" /> Bachelors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <InputField
                        label="University"
                        name="bachelorsUniversity"
                        value={formData.bachelorsUniversity}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Course"
                        name="bachelorsCourse"
                        value={formData.bachelorsCourse}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Branch"
                        name="bachelorsBranch"
                        value={formData.bachelorsBranch}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Completion Year"
                        name="bachelorsCompletionYear"
                        value={formData.bachelorsCompletionYear}
                        onChange={handleChange}
                        type="number"
                      />
                      <InputField
                        label="Passed Papers"
                        name="bachelorsPapersPassed"
                        value={formData.bachelorsPapersPassed}
                        onChange={handleChange}
                        type="number"
                      />
                      <InputField
                        label="Equalised"
                        name="bachelorsPapersEqualised"
                        value={formData.bachelorsPapersEqualised}
                        onChange={handleChange}
                        type="number"
                      />
                      <FileUploadBox
                        label="Certs (Max 5)"
                        field="bachelorsCertificates"
                        value={files.bachelorsCertificates}
                        multiple
                        onChange={handleMultiFileChange}
                      />
                    </div>
                  </div>
                )}

                {formData.highestQualification === "Masters" && (
                  <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-6">
                    <h3 className="text-md font-black flex items-center gap-3 text-rose-500">
                      <School className="w-5 h-5" /> Masters
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <InputField
                        label="University"
                        name="mastersUniversity"
                        value={formData.mastersUniversity}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Course"
                        name="mastersCourse"
                        value={formData.mastersCourse}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Branch"
                        name="mastersBranch"
                        value={formData.mastersBranch}
                        onChange={handleChange}
                      />
                      <InputField
                        label="Completion Year"
                        name="mastersCompletionYear"
                        value={formData.mastersCompletionYear}
                        onChange={handleChange}
                        type="number"
                      />
                      <InputField
                        label="Passed Papers"
                        name="mastersPapersPassed"
                        value={formData.mastersPapersPassed}
                        onChange={handleChange}
                        type="number"
                      />
                      <InputField
                        label="Equalised"
                        name="mastersPapersEqualised"
                        value={formData.mastersPapersEqualised}
                        onChange={handleChange}
                        type="number"
                      />
                      <FileUploadBox
                        label="Certs (Max 5)"
                        field="mastersCertificates"
                        value={files.mastersCertificates}
                        multiple
                        onChange={handleMultiFileChange}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-8">
                  <h3 className="text-lg font-black flex items-center gap-3">
                    <Briefcase className="text-orange-500 w-5 h-5" /> Enrollment
                    Selection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InputField
                      label="University"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      options={permittedHierarchy.universities.map((u) => ({
                        label: u.name,
                        value: u._id.toString(),
                      }))}
                      icon={Building2}
                      error={errors.university}
                      required
                    />
                    <InputField
                      label="Program"
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      options={permittedHierarchy.programs
                        .filter(
                          (p) =>
                            (p.university?._id?.toString() ||
                              p.university?.toString()) === formData.university,
                        )
                        .map((p) => ({
                          label: p.name,
                          value: p._id.toString(),
                        }))}
                      icon={GraduationCap}
                      error={errors.program}
                      required
                    />
                    <InputField
                      label="Branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      options={permittedHierarchy.branches
                        .filter(
                          (b) =>
                            (b.program?._id?.toString() ||
                              b.program?.toString()) === formData.program,
                        )
                        .map((b) => ({
                          label: b.name,
                          value: b._id.toString(),
                        }))}
                      icon={GitBranch}
                      error={errors.branch}
                      required
                    />
                    <InputField
                      label="Completion Year"
                      name="completionYear"
                      value={formData.completionYear}
                      onChange={handleChange}
                      type="number"
                      icon={Calendar}
                      error={errors.completionYear}
                      required
                    />
                    <InputField
                      label="Batch"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      options={[
                        ...(() => {
                          const batches = [];
                          const currentYear = new Date().getFullYear();
                          for (let y = currentYear; y <= currentYear + 3; y++) {
                            batches.push(`Jan-${y}`, `June-${y}`);
                          }
                          return batches;
                        })(),
                      ]}
                      icon={Sparkles}
                      error={errors.batch}
                      required
                    />
                  </div>
                </div>
                <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm space-y-8">
                  <h3 className="text-lg font-black flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500 w-5 h-5" />{" "}
                    Compliance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InputField
                      label="Video KYC"
                      name="videoKycStatus"
                      value={formData.videoKycStatus}
                      onChange={handleChange}
                      options={["Pending", "Completed", "Rejected"]}
                    />
                    <InputField
                      label="Employment"
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleChange}
                      options={[
                        "Employed",
                        "Unemployed",
                        "Self-Employed",
                        "Student",
                      ]}
                    />
                    <FileUploadBox
                      label="Affidavit"
                      field="affidavit"
                      value={files.affidavit}
                      onChange={handleFileChange}
                    />
                    <FileUploadBox
                      label="Migration"
                      field="migrationCertificate"
                      value={files.migrationCertificate}
                      onChange={handleFileChange}
                    />
                    <FileUploadBox
                      label="Project"
                      field="projectSubmission"
                      value={files.projectSubmission}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between bg-card border border-border rounded-[2rem] p-6 shadow-xl sticky bottom-6 z-50">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-black transition-all disabled:opacity-30 text-xs"
              >
                <ChevronLeft className="w-4 h-4" /> BACK
              </button>
            </div>
            {currentStep === STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="group flex items-center gap-2 px-10 py-3 rounded-2xl bg-primary text-white font-black hover:scale-[1.02] transition-all shadow-xl text-xs"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> SUBMIT FOR REVIEW
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="group flex items-center gap-2 px-10 py-3 rounded-2xl bg-foreground text-background font-black hover:scale-[1.02] transition-all shadow-xl text-xs"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    CONTINUE <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
