import mongoose from "mongoose";

const PaymentScheduleSchema = new mongoose.Schema(
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
    dueDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Overdue", "Cancelled"],
      default: "Pending",
    },
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model("PaymentSchedule", PaymentScheduleSchema);
