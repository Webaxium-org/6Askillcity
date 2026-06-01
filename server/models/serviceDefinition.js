import mongoose from "mongoose";

const ServiceDefinitionSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Service title is required"], 
    trim: true 
  },
  description: { 
    type: String 
  },
  currentFee: { 
    type: Number,
    default: 0
  },
  documentType: {
    type: String,
    enum: ["Optional", "Mandatory"],
    default: "Optional"
  },
  categories: [{
    type: String,
    trim: true
  }],
  currentFeeRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceFee"
  },
  status: { 
    type: String, 
    enum: ["Active", "Inactive"], 
    default: "Active" 
  },
  icon: {
    type: String,
    default: "Layers"
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }
}, { timestamps: true });

export default mongoose.model("ServiceDefinition", ServiceDefinitionSchema);
