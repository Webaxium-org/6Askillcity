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
import ActivityLog from "../models/activityLog.js";
import PartnerPermission from "../models/partnerPermission.js";
import createError from "http-errors";

// Helper to log activity
const logActivity = async (action, details, performedBy, targetType, targetId) => {
  try {
    await ActivityLog.create({
      action,
      details,
      performedBy,
      targetType,
      targetId,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const uploadAdmissionFiles = uploadParams;

export const createAdmissionPoint = async (req, res, next) => {
  try {
    const data = req.body;

    // Check if email already exists
    const existing = await AdmissionPoint.findOne({
      licenseeEmail: data.licenseeEmail,
    });
    if (existing) {
      throw createError(400, "An admission point with this email is already registered.");
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

export const getApprovedAdmissionPoints = async (req, res, next) => {
  try {
    const admissionPoints = await AdmissionPoint.find({
      status: "approved",
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
      throw createError(400, "Invalid status value");
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
      throw createError(404, "Admission point not found");
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

export const getAllAdmissionPoints = async (req, res, next) => {
  try {
    const { status, isActive, search } = req.query;
    const filter = { deleted: false };

    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { centerName: { $regex: search, $options: "i" } },
        { licenseeName: { $regex: search, $options: "i" } },
        { licenseeEmail: { $regex: search, $options: "i" } },
      ];
    }

    const admissionPoints = await AdmissionPoint.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: admissionPoints,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmissionPointById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admissionPoint = await AdmissionPoint.findById(id).populate({
      path: "history.actionBy",
      select: "fullName email",
    });

    if (!admissionPoint) {
      throw createError(404, "Admission point not found");
    }

    // Get activity logs for this partner
    const activityLogs = await ActivityLog.find({
      targetId: id,
      targetType: "AdmissionPoint",
    })
      .populate("performedBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...admissionPoint.toObject(),
        activityLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleAdmissionPointActiveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const admissionPoint = await AdmissionPoint.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );

    if (!admissionPoint) {
      throw createError(404, "Admission point not found");
    }

    await logActivity(
      "TOGGLE_PARTNER_ACTIVE",
      `Partner ${admissionPoint.centerName} is now ${isActive ? "Active" : "Inactive"}`,
      req.user.userId,
      "AdmissionPoint",
      admissionPoint._id,
    );

    res.status(200).json({
      success: true,
      message: `Partner status updated to ${isActive ? "Active" : "Inactive"}`,
      data: admissionPoint,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PERMISSION MANAGEMENT
// ─────────────────────────────────────────────

export const getPartnerPermissions = async (req, res, next) => {
  try {
    const { partnerId } = req.params;
    const permissions = await PartnerPermission.find({ partnerId })
      .populate("universityId", "name")
      .populate("programId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

export const addPartnerPermission = async (req, res, next) => {
  try {
    const { partnerId, type, universityId, programId } = req.body;

    // Check if permission already exists
    const query = { partnerId, type };
    if (type === "university") query.universityId = universityId;
    if (type === "program") query.programId = programId;

    const existing = await PartnerPermission.findOne(query);
    if (existing) {
      throw createError(400, "This permission already exists for the partner");
    }

    const permission = new PartnerPermission({
      partnerId,
      type,
      universityId,
      programId,
    });

    await permission.save();

    await logActivity(
      "ADD_PARTNER_PERMISSION",
      `Added ${type} permission to partner ID: ${partnerId}`,
      req.user.userId,
      "PartnerPermission",
      permission._id,
    );

    res.status(201).json({
      success: true,
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

export const removePartnerPermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const permission = await PartnerPermission.findByIdAndDelete(id);

    if (!permission) {
      throw createError(404, "Permission not found");
    }

    await logActivity(
      "REMOVE_PARTNER_PERMISSION",
      `Removed ${permission.type} permission from partner ID: ${permission.partnerId}`,
      req.user.userId,
      "PartnerPermission",
      permission._id,
    );

    res.status(200).json({
      success: true,
      message: "Permission removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
