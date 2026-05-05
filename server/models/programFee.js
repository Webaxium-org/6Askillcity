import mongoose from "mongoose";

const ProgramFeeSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    totalFee: {
      type: Number,
      required: [true, "Total fee is required"],
    },
    applicationFee: {
      type: Number,
      default: 0,
    },
    tuitionFee: {
      type: Number,
      default: 0,
    },
    otherFees: {
      type: Map,
      of: Number,
      default: {},
    },
    isCurrent: {
      type: Boolean,
      default: true,
    },
    refId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProgramFee", ProgramFeeSchema);
