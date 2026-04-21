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

    // Uploaded Artifacts
    idProof: {
      type: String, // String mapping to local path
      required: false, // Optional just in case AI upload isn't strictly mandatory
    },

    // System Mappings
    status: {
      type: String,
      enum: ["Active", "Pending", "Graduated", "Suspended"],
      default: "Pending",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionPoint",
      required: false, // Make false so it works standalone too while testing
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
