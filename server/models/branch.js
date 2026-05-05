import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    type: {
      type: String,
      enum: ["CT", "Vocational", "Skilled"],
      required: [true, "Type is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Branch", BranchSchema);
