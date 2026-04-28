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
    },
    religion: String,
    caste: String,
    address: String,
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
    alternativePhone: String,
    otherPhone: String,

    // Family Details
    fatherName: String,
    motherName: String,
    fatherPhone: String,
    motherPhone: String,

    // Current Academic Selection
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
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
      certificate: String, // path
      completionYear: String,
      board: String,
      percentage: String,
      totalMarks: Number,
      obtainedMarks: Number,
    },

    // Plus Two (+2) Details
    plusTwo: {
      certificate: String, // path
      completionYear: String,
      board: String,
      percentage: String,
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
      required: false,
    },

    // Application Lifecycle
    applicationStatus: {
      type: String,
      enum: ["Draft", "Pending Eligibility", "Eligible", "Rejected"],
      default: "Draft",
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
    deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Student", StudentSchema);
