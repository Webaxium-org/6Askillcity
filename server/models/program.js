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
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    type: {
      type: String,
      enum: ["CT", "Vocational", "Skilled"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Program", ProgramSchema);
