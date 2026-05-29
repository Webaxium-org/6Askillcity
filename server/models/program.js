import mongoose from "mongoose";

const ProgramSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Program name is required"],
      trim: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    programType: {
      type: String,
      enum: [
        "Bachelors Degree",
        "Masters Degree",
        "PG Diploma",
        "PG Deploma",
        "Skill Programs",
        "Skill Test",
      ],
      required: [true, "Program type is required"],
      default: "Bachelors Degree",
    },
    eligibilityChecklist: {
      type: [String],
      default: [],
    },
    mode: {
      type: String,
      enum: [
        "External",
        "On-Campus",
        "Skill Based",
      ],
      required: [true, "Program mode is required"],
      default: "External",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Program", ProgramSchema);
