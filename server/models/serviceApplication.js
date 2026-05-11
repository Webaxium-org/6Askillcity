import mongoose from "mongoose";

const ServiceApplicationSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student", 
    required: true 
  },
  service: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ServiceDefinition", 
    required: true 
  },
  subCategory: { 
    type: String
  },
  feeAmount: { 
    type: Number, 
    required: true 
  },
  feeRef: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ServiceFee" 
  },
  status: {
    type: String,
    enum: [
      "Waiting for Payment",
      "Pending Applications", 
      "Application On Progress", 
      "Documents Received", 
      "Documents Sent Courier"
    ],
    default: "Waiting for Payment"
  },
  paymentStatus: {
    type: String,
    enum: ["Unpaid", "Partially Paid", "Paid"],
    default: "Unpaid"
  },
  paidAmount: { 
    type: Number, 
    default: 0 
  },
  pendingDate: Date,
  processingDate: Date,
  receivedDate: Date,
  sentDate: Date,
  history: [{
    status: String,
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    remarks: String
  }],
  documents: [{
    name: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  adminRemarks: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model("ServiceApplication", ServiceApplicationSchema);
