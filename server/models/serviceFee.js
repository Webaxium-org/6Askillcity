import mongoose from "mongoose";

const ServiceFeeSchema = new mongoose.Schema({
  service: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ServiceDefinition", 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  effectiveDate: { 
    type: Date, 
    default: Date.now 
  },
  remarks: { 
    type: String 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }
}, { timestamps: true });

export default mongoose.model("ServiceFee", ServiceFeeSchema);
