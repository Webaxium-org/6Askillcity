import mongoose from "mongoose";

const PaymentIntentSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["cashfree"],
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    scope: {
      type: String,
      enum: ["Course Fee", "Service Fee", "Bulk Service Fee"],
      required: true,
    },
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
    remarks: String,
    serviceApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceApplication",
    },
    serviceApplications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceApplication",
      },
    ],
    status: {
      type: String,
      enum: ["initiated", "completed", "failed"],
      default: "initiated",
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    gatewayData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

PaymentIntentSchema.index({ provider: 1, orderId: 1 }, { unique: true });

export default mongoose.model("PaymentIntent", PaymentIntentSchema, "paymentintents");
