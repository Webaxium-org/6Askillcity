import mongoose from "mongoose";

const AdmissionPointSchema = new mongoose.Schema(
  {
    // Center & Licensee Identification
    centerName: {
      type: String,
      required: [true, "Center name is required"],
      trim: true,
    },
    licenseeName: {
      type: String,
      required: [true, "Licensee name is required"],
      trim: true,
    },
    licenseeEmail: {
      type: String,
      required: [true, "Licensee email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    licenseeContactNumber: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      select: false,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    history: [
      {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
        },
        date: {
          type: Date,
          default: Date.now,
        },
        actionBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    deleted: {
      type: Boolean,
      default: false,
      index: true,
      select: false,
    },

    // Primary Contact Person
    contactPerson: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },

    // Local Reference Persons (Array for flexibility)
    references: [
      {
        name: { type: String },
        mobileNumber1: { type: String },
        mobileNumber2: { type: String },
      },
    ],

    // Geographic Details
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    // File Uploads (Storing file paths/URLs as strings)
    documents: {
      licenseePhoto: { type: String },
      licenseeAadharCard: { type: String },
      businessLicense: { type: String },
      ownershipRentalAgreement: { type: String },
      officePhotos: [{ type: String }], // Array since the form says "Photos" (plural)
    },

    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("AdmissionPoint", AdmissionPointSchema);
