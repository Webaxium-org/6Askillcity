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
  subCategories: [{ 
    type: String 
  }],
  currentFee: { 
    type: Number, 
    required: [true, "Service fee is required"] 
  },
  currentFeeRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceFee"
  },
  status: { 
    type: String, 
    enum: ["Active", "Inactive"], 
    default: "Active" 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }
}, { timestamps: true });

export default mongoose.model("ServiceDefinition", ServiceDefinitionSchema);
