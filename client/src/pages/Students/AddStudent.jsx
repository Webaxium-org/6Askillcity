import React, { useState, useRef } from "react";
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
  MapPin,
  UploadCloud,
  ChevronLeft,
  Save,
  ScanText,
} from "lucide-react";
import Tesseract from "tesseract.js";
import axios from "axios";

export default function AddStudent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
    phone: "",
    qualification: "",
    course: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);

    setScanning(true);
    setScanProgress(0);
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setScanProgress(Math.round(m.progress * 100));
          }
        },
      });

      const newFormData = { ...formData };
      let foundData = false;

      // Extract DOB (DD/MM/YYYY or DD-MM-YYYY)
      const dobMatch = text.match(/\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/);
      if (dobMatch) {
        // Convert to YYYY-MM-DD for standard input type="date"
        newFormData.dob = `${dobMatch[3]}-${dobMatch[2]}-${dobMatch[1]}`;
        foundData = true;
      }

      // Extract Phone Number (Looking for 10 consecutive digits potentially following a prefix)
      const phoneMatch = text.match(/(?:\+?91[\s-]?)?[6789]\d{9}/);
      if (phoneMatch) {
        const cleanPhone = phoneMatch[0].replace(/[\s-]/g, "");
        newFormData.phone = cleanPhone;
        foundData = true;
      }

      // Attempt generic Name extraction (Works for PAN which uses 'Name:')
      const nameMatch = text.match(/(?:Name|NAME)[\s:]*([A-Za-z\s]{3,25})\n/);
      if (nameMatch && nameMatch[1].trim().length > 2) {
        newFormData.name = nameMatch[1].trim();
        foundData = true;
      } else {
        // Advanced Heuristic for Aadhar: Name is typically the line directly preceding the DOB line
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const dobLineIndex = lines.findIndex(l => 
           l.toLowerCase().includes('dob') || 
           l.toLowerCase().includes('date of birth') || 
           l.toLowerCase().includes('year of birth')
        );
        
        if (dobLineIndex > 0) {
           const possibleName = lines[dobLineIndex - 1];
           // Ensure it's not grabbing header text if scanning is weird
           if (!possibleName.toLowerCase().includes('government') && !possibleName.toLowerCase().includes('india')) {
              // Strip stray characters that tesseract might add
              const cleanName = possibleName.replace(/[^A-Za-z\s]/g, '').trim();
              if (cleanName.length >= 3) {
                 newFormData.name = cleanName;
                 foundData = true;
              }
           }
        }
      }

      setFormData(newFormData);

      dispatch(
        showAlert({
          type: foundData ? "success" : "info",
          message: foundData
            ? "AI successfully extracted demographics from document!"
            : "Scanned, but couldn't locate formatted data. Please fill manually.",
        }),
      );
    } catch (error) {
      console.error("OCR Engine Failure:", error);
      dispatch(
        showAlert({
          type: "error",
          message: "AI Scanning failed to read the image.",
        }),
      );
    } finally {
      setScanning(false);
      setScanProgress(0);
      // Reset input so they can re-upload if needed
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });
      
      if (selectedFile) {
        payload.append("idProof", selectedFile);
      }

      await axios.post(
        `${import.meta.env.VITE_BASE_URL || "http://localhost:4040"}/api/students/register`,
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      dispatch(
        showAlert({
          type: "success",
          message: "Student enrolled successfully!",
        }),
      );
      navigate("/partner-dashboard");
    } catch (error) {
      console.error("Submission Error:", error);
      dispatch(
        showAlert({
          type: "error",
          message: error.response?.data?.message || "Failed to enroll student.",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Enroll New Student">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/partner-dashboard")}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Portal</span>
          </button>
        </div>

        {/* Main Form Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
        >
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 w-full" />
          <div className="p-6 sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <User className="w-6 h-6 text-purple-500" />
                Student Profiling
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Enter the candidate's core demographic and academic parameters.
                Ensure all data maps correctly to their identity proof.
              </p>
            </div>

            {/* Smart Document Scan Upload Zone */}
            <div className="mb-10 p-6 bg-blue-500/5 border-2 border-dashed border-blue-500/20 rounded-2xl relative overflow-hidden transition-all group">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
                  <ScanText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">
                    AI Document Autofill
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                    Save time by uploading an ID proof (Aadhar/PAN). Our AI
                    engine will scan it natively and instantly populate the form
                    fields below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={scanning}
                  className="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
                >
                  Select Identity Image
                </button>
              </div>

              <AnimatePresence>
                {scanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                  >
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                    <h4 className="font-bold text-foreground mb-2">
                      Analyzing Document...
                    </h4>
                    <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Show selected file banner if user uploaded something */}
            {selectedFile && (
               <div className="mb-6 mx-auto max-w-sm flex items-center justify-between px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-sm font-medium">
                  <span className="truncate max-w-[200px]">{selectedFile.name} (Attached)</span>
                  <button type="button" onClick={() => setSelectedFile(null)} className="text-emerald-500 hover:text-emerald-700 transition-colors">
                     Remove
                  </button>
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Identity Section */}
              <section className="space-y-5">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-2 opacity-80">
                  Personal Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        type="date"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                        placeholder="rahul@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        type="tel"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Academic Section */}
              <section className="space-y-5">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-2 opacity-80">
                  Academic Path
                </h3>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Highest Qualification
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        required
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm appearance-none"
                      >
                        <option value="" disabled>
                          Select qualification
                        </option>
                        <option value="12th">12th Grade / PUC</option>
                        <option value="diploma">Diploma</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Target Course Entry
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        required
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm appearance-none"
                      >
                        <option value="" disabled>
                          Assign a course
                        </option>
                        <option value="uiux">Advanced UI/UX Design</option>
                        <option value="fsd">Full Stack Web Development</option>
                        <option value="ds">Data Science & AI</option>
                        <option value="dm">
                          Digital Marketing Masterclass
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <div className="pt-6 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all flex items-center space-x-2 shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Confirm Enrollment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
