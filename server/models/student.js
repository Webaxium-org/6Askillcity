import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    // Basic Demographic Detail
    name: {
      type: String,
      required: [true, "Student full name is required"],
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    religion: { type: String, required: true },
    caste: { type: String, required: true },
    address: { type: String, required: true },
    email: {
      type: String,
      required: [true, "Student email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    alternativePhone: { type: String, required: true },
    otherPhone: String,

    // Family Details
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    fatherPhone: { type: String, required: true },
    motherPhone: { type: String, required: true },

    // Current Academic Selection
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: [true, "University selection is required"],
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: [true, "Course selection is required"],
    },
    branch: String,
    completionYear: String,
    programFee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProgramFee",
    },
    programFeeRefId: {
      type: String,
      trim: true,
    },

    // 10th Standard Details
    tenth: {
      certificate: { type: String, required: true }, // path
      completionYear: { type: String, required: true },
      board: { type: String, required: true },
      percentage: { type: String, required: true },
      totalMarks: { type: Number, required: true },
      obtainedMarks: { type: Number, required: true },
    },

    // Plus Two (+2) Details
    plusTwo: {
      certificate: { type: String, required: true }, // path
      completionYear: { type: String, required: true },
      board: { type: String, required: true },
      percentage: { type: String, required: true },
    },

    // Bachelors Details
    bachelors: {
      certificates: [String], // array of paths
      university: String,
      course: String,
      branch: String,
      papersPassed: Number,
      papersEqualised: Number,
    },

    // Masters Details
    masters: {
      certificates: [String], // array of paths
      university: String,
      course: String,
      branch: String,
      papersPassed: Number,
      papersEqualised: Number,
    },

    // Verification & Documents
    affidavit: String, // path
    videoKycStatus: {
      type: String,
      enum: ["Pending", "Completed", "Rejected"],
      default: "Pending",
    },
    migrationCertificate: String, // path
    projectSubmission: String, // path or status
    employmentStatus: {
      type: String,
      enum: ["Employed", "Unemployed", "Self-Employed", "Student"],
      default: "Unemployed",
    },

    // Uploaded Artifacts (Legacy/General)
    idProof: {
      type: String,
      required: true,
    },

    // Application Lifecycle
    applicationStatus: {
      type: String,
      enum: ["Draft", "Pending Eligibility", "Eligible", "Rejected"],
      default: "Draft",
    },
    eligibilityApprovalDate: {
      type: Date,
    },
    eligibilityApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    admin_remarks: {
      type: String,
      default: "",
    },
    nextFollowupDate: {
      type: Date,
      index: true,
    },

    // Progress tracking
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Payment Tracking Summary
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid"],
      default: "Unpaid",
    },
    totalFeePaid: {
      type: Number,
      default: 0,
    },

    // System Mappings
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionPoint",
      required: false,
    },
    highestQualification: {
      type: String,
      enum: ["Plus Two", "Bachelors", "Masters"],
      default: "Plus Two",
    },
    deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Student", StudentSchema);
