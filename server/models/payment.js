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
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);
