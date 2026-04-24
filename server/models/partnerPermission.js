import mongoose from "mongoose";

const PartnerPermissionSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionPoint",
      required: true,
    },
    type: {
      type: String,
      enum: ["university", "program"],
      required: true,
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: function() { return this.type === "university"; }
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: function() { return this.type === "program"; }
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PartnerPermission", PartnerPermissionSchema);
