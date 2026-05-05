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
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    religion: { type: String },
    caste: { type: String },
    address: { type: String },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    alternativePhone: { type: String },
    otherPhone: String,

    // Family Details
    fatherName: { type: String },
    motherName: { type: String },
    fatherPhone: { type: String },
    motherPhone: { type: String },

    // Current Academic Selection
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    completionYear: String,
    programFee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProgramFee",
    },
    programFeeRefId: {
      type: String,
      trim: true,
    },
    batch: {
      type: String,
    },

    // 10th Standard Details
    tenth: {
      certificate: {
        path: String,
        status: {
          type: String,
          enum: ["Pending", "Verified", "Rejected"],
          default: "Pending",
        },
        uploadedAt: Date,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "tenth.certificate.onModel",
        },
        onModel: { type: String, enum: ["User", "AdmissionPoint"] },
      },
      completionYear: { type: String },
      board: { type: String },
      percentage: { type: String },
      totalMarks: { type: Number },
      obtainedMarks: { type: Number },
    },

    // Plus Two (+2) Details
    plusTwo: {
      certificate: {
        path: String,
        status: {
          type: String,
          enum: ["Pending", "Verified", "Rejected"],
          default: "Pending",
        },
        uploadedAt: Date,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "plusTwo.certificate.onModel",
        },
        onModel: { type: String, enum: ["User", "AdmissionPoint"] },
      },
      completionYear: { type: String },
      board: { type: String },
      percentage: { type: String },
    },

    // Bachelors Details
    bachelors: {
      certificates: [
        {
          path: String,
          status: {
            type: String,
            enum: ["Pending", "Verified", "Rejected"],
            default: "Pending",
          },
          uploadedAt: Date,
          uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "bachelors.certificates.onModel",
          },
          onModel: { type: String, enum: ["User", "AdmissionPoint"] },
        },
      ],
      university: String,
      course: String,
      branch: String,
      papersPassed: Number,
      papersEqualised: Number,
    },

    // Masters Details
    masters: {
      certificates: [
        {
          path: String,
          status: {
            type: String,
            enum: ["Pending", "Verified", "Rejected"],
            default: "Pending",
          },
          uploadedAt: Date,
          uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "masters.certificates.onModel",
          },
          onModel: { type: String, enum: ["User", "AdmissionPoint"] },
        },
      ],
      university: String,
      course: String,
      branch: String,
      papersPassed: Number,
      papersEqualised: Number,
    },

    // Verification & Documents
    affidavit: {
      path: String,
      status: {
        type: String,
        enum: ["Pending", "Verified", "Rejected"],
        default: "Pending",
      },
      uploadedAt: Date,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "affidavit.onModel",
      },
      onModel: { type: String, enum: ["User", "AdmissionPoint"] },
    },
    videoKycStatus: {
      type: String,
      enum: ["Pending", "Completed", "Rejected"],
      default: "Pending",
    },
    migrationCertificate: {
      path: String,
      status: {
        type: String,
        enum: ["Pending", "Verified", "Rejected"],
        default: "Pending",
      },
      uploadedAt: Date,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "migrationCertificate.onModel",
      },
      onModel: { type: String, enum: ["User", "AdmissionPoint"] },
    },
    projectSubmission: {
      path: String,
      status: {
        type: String,
        enum: ["Pending", "Verified", "Rejected"],
        default: "Pending",
      },
      uploadedAt: Date,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "projectSubmission.onModel",
      },
      onModel: { type: String, enum: ["User", "AdmissionPoint"] },
    },
    employmentStatus: {
      type: String,
      enum: ["Employed", "Unemployed", "Self-Employed", "Student"],
      default: "Unemployed",
    },

    // Uploaded Artifacts (Legacy/General)
    idProof: {
      path: String,
      status: {
        type: String,
        enum: ["Pending", "Verified", "Rejected"],
        default: "Pending",
      },
      uploadedAt: Date,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "idProof.onModel",
      },
      onModel: { type: String, enum: ["User", "AdmissionPoint"] },
    },

    // Application Lifecycle
    applicationStatus: {
      type: String,
      enum: ["Draft", "Pending Eligibility", "Eligible", "Rejected"],
      default: "Draft",
    },
    applicationSubmittedDate: {
      type: Date,
      index: true,
    },
    applicationHistory: [
      {
        status: String,
        date: { type: Date, default: Date.now },
        actionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remarks: String,
      },
    ],
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
    enrollmentStatus: {
      type: String,
      enum: ["Identity", "Family", "Academic", "Completed"],
      default: "Identity",
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
