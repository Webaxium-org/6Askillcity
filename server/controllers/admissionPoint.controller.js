import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { generateStrongPassword } from "../helper/index.js";

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save files locally to uploads directory
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uuidv4()}${ext}`);
  },
});

const uploadParams = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file limit
}).fields([
  { name: "licenseePhoto", maxCount: 1 },
  { name: "licenseeAadharCard", maxCount: 1 },
  { name: "businessLicense", maxCount: 1 },
  { name: "ownershipRentalAgreement", maxCount: 1 },
  { name: "officePhotos", maxCount: 10 }, // Allow up to 10 office photos
]);

import AdmissionPoint from "../models/admissionPoint.js";

export const uploadAdmissionFiles = uploadParams;

export const createAdmissionPoint = async (req, res, next) => {
  try {
    const data = req.body;

    // Check if email already exists
    const existing = await AdmissionPoint.findOne({
      licenseeEmail: data.licenseeEmail,
    });
    if (existing) {
      return res.status(400).json({
        message: "An admission point with this email is already registered.",
      });
    }

    // Process uploaded paths
    const files = req.files || {};
    const extractPath = (fieldArray) => {
      if (fieldArray && fieldArray.length > 0) return fieldArray[0].path;
      return null;
    };

    const documents = {
      licenseePhoto: extractPath(files.licenseePhoto),
      licenseeAadharCard: extractPath(files.licenseeAadharCard),
      businessLicense: extractPath(files.businessLicense),
      ownershipRentalAgreement: extractPath(files.ownershipRentalAgreement),
      officePhotos: files.officePhotos
        ? files.officePhotos.map((f) => f.path)
        : [],
    };

    // Format structure dynamically according to model
    const admissionPoint = new AdmissionPoint({
      centerName: data.centerName,
      licenseeName: data.licenseeName,
      licenseeEmail: data.licenseeEmail,
      licenseeContactNumber: data.licenseeContactNumber,

      contactPerson: {
        name: data.contactPersonName,
        phone: data.contactPersonPhone,
        email: data.contactPersonEmail,
      },

      references: [
        {
          name: data.localRefName1,
          mobileNumber1: data.localRefMobile1,
        },
        {
          name: data.localRefName2,
          mobileNumber2: data.localRefMobile2,
        },
      ],

      location: {
        address: data.centerAddress,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
      },

      documents,
    });

    await admissionPoint.save();

    res.status(201).json({
      success: true,
      message:
        "Admission point registered successfully. Our team will review your application soon.",
      data: admissionPoint,
    });
  } catch (error) {
    // Check for mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }
    next(error);
  }
};

export const getPendingAdmissionPoints = async (req, res, next) => {
  try {
    const admissionPoints = await AdmissionPoint.find({
      status: "pending",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: admissionPoints,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdmissionPointStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    let updateData = { status };
    let plainPassword = null;

    if (status === "approved") {
      // plainPassword = generateStrongPassword();
      plainPassword = "2424";

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      updateData.password = hashedPassword;
    }

    const admissionPoint = await AdmissionPoint.findByIdAndUpdate(
      id,
      {
        ...updateData,
        $push: {
          history: {
            status,
            date: new Date(),
            // actionBy: req.user.id,
          },
        },
      },

      { new: true, runValidators: true },
    );

    if (!admissionPoint) {
      return res.status(404).json({
        success: false,
        message: "Admission point not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Admission point status updated to ${status} successfully`,
      data: admissionPoint,
    });
  } catch (error) {
    next(error);
  }
};
