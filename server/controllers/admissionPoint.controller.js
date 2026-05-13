import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { s3, bucketName } from "../utils/s3Config.js";
import { generateStrongPassword } from "../helper/index.js";

// S3 Storage Configuration
const storage = multerS3({
  s3: s3,
  bucket: bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const partnerId = req.partnerId || "unknown";
    cb(null, `partners/${partnerId}/${file.fieldname}-${uuidv4()}${ext}`);
  },
});

const uploadParams = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file limit
}).any(); // Allow any field names for flexibility

import AdmissionPoint from "../models/admissionPoint.js";
import ActivityLog from "../models/activityLog.js";
import PartnerPermission from "../models/partnerPermission.js";
import ProgramFee from "../models/programFee.js";
import createError from "http-errors";
import Branch from "../models/branch.js";
import Program from "../models/program.js";

// Helper to log activity
const logActivity = async (
  action,
  details,
  performedBy,
  targetType,
  targetId,
) => {
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

// Middleware to prepare partner ID before upload
export const preparePartnerId = (req, res, next) => {
  // If editing an existing partner, use their ID from params
  if (req.params.id) {
    req.partnerId = req.params.id;
  } else if (req.params.partnerId) {
    req.partnerId = req.params.partnerId;
  } else {
    // For new registrations, generate a new ID
    req.partnerId = new mongoose.Types.ObjectId();
  }
  next();
};

export const createAdmissionPoint = async (req, res, next) => {
  try {
    const data = req.body;

    // Check if email already exists
    const existing = await AdmissionPoint.findOne({
      licenseeEmail: data.licenseeEmail,
    });
    if (existing) {
      throw createError(
        400,
        "An admission point with this email is already registered.",
      );
    }

    // Process uploaded documents
    const documents = {
      licenseePhoto: [],
      licenseeAadharCard: [],
      businessLicense: [],
      ownershipRentalAgreement: [],
      officePhotos: [],
    };

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (documents.hasOwnProperty(file.fieldname)) {
          documents[file.fieldname].push(file.location); // S3 URL
        }
      });
    }

    // Format structure dynamically according to model
    const admissionPoint = new AdmissionPoint({
      _id: req.partnerId, // Use the pre-generated ID
      centerName: data.centerName,
      licenseeName: data.licenseeName,
      licenseeEmail: data.licenseeEmail,
      licenseeContactNumber: data.licenseeContactNumber || "N/A", // Keep fallback if not in form

      contactPerson: {
        name: data.contactPersonName,
        phone: data.contactPersonPhone,
        email: data.contactPersonEmail || data.licenseeEmail, // Fallback
      },

      references: [
        {
          name: data.localRefName1,
          mobileNumber1: data.localRefMobile1,
        },
        {
          name: data.localRefName2,
          mobileNumber1: data.localRefMobile2, // Note: mobileNumber1 used for both in schema/request sometimes
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

    const admissionPoints = await AdmissionPoint.find(filter)
      .sort({
        createdAt: -1,
      })
      .lean();

    // Enhance with permission summaries
    const data = await Promise.all(
      admissionPoints.map(async (point) => {
        const permissions = await PartnerPermission.find({
          partnerId: point._id,
          status: "active",
        }).populate("universityId", "name shortName");

        const unis = [
          ...new Set(
            permissions
              .filter((p) => p.type === "university" && p.universityId)
              .map((p) => p.universityId.shortName || p.universityId.name),
          ),
        ];

        const progCount = permissions.filter(
          (p) => p.type === "program",
        ).length;
        const branchCount = permissions.filter(
          (p) => p.type === "branch",
        ).length;

        return {
          ...point,
          assignedUnis: unis,
          programCount: progCount,
          branchCount: branchCount,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: data,
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
      .populate("branchId", "name")
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
    const { partnerId, type, universityId, programId, branchId } = req.body;

    // Check if permission already exists
    const query = { partnerId, type };
    if (type === "university") query.universityId = universityId;
    if (type === "program") query.programId = programId;
    if (type === "branch") query.branchId = branchId;

    const existing = await PartnerPermission.findOne(query);
    if (existing) {
      throw createError(400, "This permission already exists for the partner");
    }

    // Hierarchy Check: Ensure parent permission exists before adding child
    if (type === "program") {
      const program = await Program.findById(programId);
      if (!program) throw createError(404, "Program not found");

      const uniPermitted = await PartnerPermission.findOne({
        partnerId,
        type: "university",
        universityId: program.university,
        status: "active",
      });

      if (!uniPermitted) {
        throw createError(
          400,
          "University-level permission must be granted before adding specific programs",
        );
      }
    }

    if (type === "branch") {
      const branch = await Branch.findById(branchId).populate("program");
      if (!branch) throw createError(404, "Branch not found");

      const [uniPermitted, progPermitted] = await Promise.all([
        PartnerPermission.findOne({
          partnerId,
          type: "university",
          universityId: branch.program.university,
          status: "active",
        }),
        PartnerPermission.findOne({
          partnerId,
          type: "program",
          programId: branch.program._id,
          status: "active",
        }),
      ]);

      if (!uniPermitted || !progPermitted) {
        throw createError(
          400,
          "Both University and Program level permissions must be granted before adding specific branches",
        );
      }
    }

    const permission = new PartnerPermission({
      partnerId,
      type,
      universityId,
      programId,
      branchId,
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

export const getMyPartnerProfile = async (req, res, next) => {
  try {
    const partnerId = req.user.userId;
    const partner = await AdmissionPoint.findById(partnerId);

    if (!partner) {
      throw createError(404, "Partner profile not found");
    }

    const rawPermissions = await PartnerPermission.find({
      partnerId,
      status: "active",
    })
      .populate("universityId", "name")
      .populate("programId", "name")
      .populate("branchId", "name duration type");

    // Fetch current fees for branches
    const permissions = await Promise.all(
      rawPermissions.map(async (p) => {
        const obj = p.toObject();
        if (p.type === "branch" && p.branchId) {
          const currentFee = await ProgramFee.findOne({
            branch: p.branchId._id,
            isCurrent: true,
          });
          obj.currentFee = currentFee;
        }
        return obj;
      }),
    );

    res.status(200).json({
      success: true,
      data: {
        partner,
        permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateAdminAccessToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const token = crypto.randomBytes(16).toString("hex"); // 32 chars hex
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    const partner = await AdmissionPoint.findByIdAndUpdate(
      id,
      {
        adminAccessToken: token,
        adminAccessTokenExpires: expires,
      },
      { new: true },
    );

    if (!partner) {
      throw createError(404, "Partner not found");
    }

    await logActivity(
      "GENERATE_ADMIN_TOKEN",
      `Generated temporary access token for partner ${partner.centerName}`,
      req.user.userId,
      "AdmissionPoint",
      partner._id,
    );

    res.status(200).json({
      success: true,
      message: "Access token generated successfully. Valid for 15 minutes.",
      token,
    });
  } catch (error) {
    next(error);
  }
};
