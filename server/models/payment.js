import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionPoint",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      default: "Offline",
    },
    transactionId: {
      type: String,
      unique: true,
    },
    invoiceId: {
      type: String,
      unique: true,
    },
    remarks: String,
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["Course Fee", "Documents & Services"],
      default: "Course Fee",
    },
    serviceApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceApplication",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    receipt: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Payment", PaymentSchema);
