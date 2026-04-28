import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  XCircle,
  FileText,
  User,
  BookOpen,
  MapPin,
  Users,
  Building2,
  Download,
  ExternalLink,
  CalendarDays,
  Phone,
  Mail,
  Award,
  ShieldAlert,
  Clock,
} from "lucide-react";

const QUALIFICATION_LABELS = {
  "12th": "12th Grade / PUC",
  diploma: "Diploma",
  bachelors: "Bachelor's Degree",
  masters: "Master's Degree",
};

export const ReviewModal = ({
  isOpen,
  onClose,
  app,
  onApprove,
  onReject,
  approvingId,
}) => {
  if (!app) return null;

  const isApproving = approvingId === app._id;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${baseUrl}/${path.replace(/\\/g, "/")}`;
  };

  const DocumentLink = ({ label, path }) => {
    if (!path) return null;
    const url = getFileUrl(path);
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border group hover:border-primary/30 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">{label}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
              Document Asset
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg hover:bg-primary hover:text-white transition-all text-muted-foreground"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href={url}
            download
            className="p-2 rounded-lg hover:bg-primary hover:text-white transition-all text-muted-foreground"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-card w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20">
                  {app.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    {app.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
                      Eligibility Review
                    </span>
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Submitted{" "}
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-2xl hover:bg-muted text-muted-foreground transition-all border border-transparent hover:border-border"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-10">
                  {/* Basic & Demographic */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <User className="w-3 h-3" /> Personal Identity
                      </h4>
                      <div className="space-y-3 bg-muted/30 p-5 rounded-3xl border border-border">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-bold">{app.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-bold">{app.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CalendarDays className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-bold">
                            {app.dob
                              ? new Date(app.dob).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-border flex gap-4">
                          <div>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                              Gender
                            </p>
                            <p className="text-sm font-bold">{app.gender}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                              Country
                            </p>
                            <p className="text-sm font-bold">
                              {app.country || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Location & Social
                      </h4>
                      <div className="space-y-3 bg-muted/30 p-5 rounded-3xl border border-border">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                            Religion & Caste
                          </p>
                          <p className="text-sm font-bold">
                            {app.religion} / {app.caste}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                            Permanent Address
                          </p>
                          <p className="text-sm font-bold leading-relaxed">
                            {app.address}
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Academic History */}
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Award className="w-3 h-3" /> Academic Profile
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-3xl bg-muted/30 border border-border">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">
                          Target Enrollment
                        </p>
                        <p className="text-sm font-black text-primary">
                          {app.program?.name || app.course}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground mt-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />{" "}
                          {app.university?.name || "N/A"}
                        </p>
                      </div>
                      <div className="p-5 rounded-3xl bg-muted/30 border border-border">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">
                          Highest Qualification
                        </p>
                        <p className="text-sm font-black">
                          {app.highestQualification ||
                            QUALIFICATION_LABELS[app.qualification] ||
                            app.qualification}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground mt-1">
                          Completion Year: {app.completionYear || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      {/* Detailed Academic Stats */}
                      <div className="overflow-hidden border border-border rounded-3xl">
                        <table className="w-full text-left">
                          <thead className="bg-muted/50 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                              <th className="px-5 py-3">Level</th>
                              <th className="px-5 py-3">Board / University</th>
                              <th className="px-5 py-3">Year</th>
                              <th className="px-5 py-3">Result</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-sm">
                            {app.tenth && (
                              <tr>
                                <td className="px-5 py-3 font-bold">
                                  10th Std
                                </td>
                                <td className="px-5 py-3">{app.tenth.board}</td>
                                <td className="px-5 py-3">
                                  {app.tenth.completionYear}
                                </td>
                                <td className="px-5 py-3 font-black text-emerald-600">
                                  {app.tenth.percentage}%
                                </td>
                              </tr>
                            )}
                            {app.plusTwo && (
                              <tr>
                                <td className="px-5 py-3 font-bold">
                                  Plus Two (+2)
                                </td>
                                <td className="px-5 py-3">
                                  {app.plusTwo.board}
                                </td>
                                <td className="px-5 py-3">
                                  {app.plusTwo.completionYear}
                                </td>
                                <td className="px-5 py-3 font-black text-emerald-600">
                                  {app.plusTwo.percentage}%
                                </td>
                              </tr>
                            )}
                            {app.bachelors && app.bachelors.university && (
                              <tr>
                                <td className="px-5 py-3 font-bold">
                                  Bachelors
                                </td>
                                <td className="px-5 py-3">
                                  {app.bachelors.university}
                                </td>
                                <td className="px-5 py-3">—</td>
                                <td className="px-5 py-3 font-bold">
                                  {app.bachelors.course}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>

                  {/* Family */}
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Users className="w-3 h-3" /> Family Background
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-3xl bg-muted/30 border border-border flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                            Father
                          </p>
                          <p className="text-sm font-bold">{app.fatherName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-muted-foreground">
                            {app.fatherPhone}
                          </p>
                        </div>
                      </div>
                      <div className="p-5 rounded-3xl bg-muted/30 border border-border flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                            Mother
                          </p>
                          <p className="text-sm font-bold">{app.motherName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-muted-foreground">
                            {app.motherPhone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: Documents */}
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Required Documents
                    </h4>
                    <div className="space-y-3">
                      <DocumentLink
                        label="ID Proof (Aadhar/Passport)"
                        path={app.idProof}
                      />
                      <DocumentLink
                        label="10th Certificate"
                        path={app.tenth?.certificate}
                      />
                      <DocumentLink
                        label="Plus Two Certificate"
                        path={app.plusTwo?.certificate}
                      />
                      <DocumentLink label="Affidavit" path={app.affidavit} />
                      <DocumentLink
                        label="Migration Certificate"
                        path={app.migrationCertificate}
                      />

                      {/* Bachelors Multi-Certificates */}
                      {app.bachelors?.certificates?.map((cert, idx) => (
                        <DocumentLink
                          key={`bach-${idx}`}
                          label={`Bachelor Cert ${idx + 1}`}
                          path={cert}
                        />
                      ))}

                      {/* Masters Multi-Certificates */}
                      {app.masters?.certificates?.map((cert, idx) => (
                        <DocumentLink
                          key={`mast-${idx}`}
                          label={`Master Cert ${idx + 1}`}
                          path={cert}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Partner / Submitted By */}
                  {app.registeredBy && (
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Building2 className="w-3 h-3" /> Submitted By
                      </h4>
                      <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10">
                        <p className="text-sm font-black text-primary">
                          {app.registeredBy.centerName}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground mt-1">
                          {app.registeredBy.licenseeEmail}
                        </p>
                      </div>
                    </section>
                  )}

                  <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                    <div className="flex gap-3 text-amber-600">
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest">
                          Review Notice
                        </p>
                        <p className="text-[11px] font-medium leading-relaxed mt-1">
                          Please verify all documents and student details before
                          approving. Once eligible, the student can proceed to
                          fee payment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 border-t border-border bg-muted/30 flex gap-4 shrink-0">
              <button
                onClick={() => onReject(app)}
                className="flex-1 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 font-bold transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" /> Reject Application
              </button>
              <button
                onClick={() => onApprove(app._id)}
                disabled={isApproving}
                className="flex-[2] py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
              >
                {isApproving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Approve & Mark as Eligible
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
