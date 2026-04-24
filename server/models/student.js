import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    // Demographic Detail
    name: {
      type: String,
      required: [true, "Student full name is required"],
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
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

    // Academics
    qualification: {
      type: String,
      required: true,
      enum: ["12th", "diploma", "bachelors", "masters"],
    },
    course: {
      type: String,
      required: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },
    programFee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProgramFee",
    },

    // Uploaded Artifacts
    idProof: {
      type: String, // String mapping to local path
      required: false,
    },

    // Application Lifecycle (Student-to-Application Workflow)
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

    // Legacy system progress field (kept for backward compat)
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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
