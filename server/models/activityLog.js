import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["University", "Program", "ProgramFee", "AdmissionPoint", "PartnerPermission"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", ActivityLogSchema);
