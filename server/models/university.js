import mongoose from "mongoose";

const UniversitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "University name is required"],
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    logo: {
      type: String, // Path to the uploaded logo
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("University", UniversitySchema);
