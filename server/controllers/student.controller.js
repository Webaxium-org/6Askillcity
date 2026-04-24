import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";
import Student from "../models/student.js";
import createError from "http-errors";

// Multer Local Storage Configuration mapping to Uploads Dir
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `student-${file.fieldname}-${uuidv4()}${ext}`);
  },
});

const uploadParams = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit max
}).fields([
  { name: "idProof", maxCount: 1 }
]);

export const uploadStudentDocs = uploadParams;

// ─────────────────────────────────────────────
// SHARED: Get a single student/application by ID
// Partners can only see their own; admins see all
// ─────────────────────────────────────────────
export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ _id: id, deleted: { $ne: true } })
      .populate("registeredBy", "centerName licenseeEmail licenseeContactNumber")
      .populate("university", "name")
      .populate("program", "name category duration")
      .populate("programFee");

    if (!student) throw createError(404, "Application not found.");

    if (req.user.userType === "partner") {
      if (String(student.registeredBy?._id || student.registeredBy) !== String(req.user.userId)) {
        throw createError(403, "Access denied.");
      }
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PARTNER: Create a new student application (Draft)
// ─────────────────────────────────────────────
export const enrollStudent = async (req, res, next) => {
  try {
    const data = req.body;

    const duplicateEmail = await Student.findOne({ email: data.email });
    if (duplicateEmail) {
      throw createError(400, "A student is already actively enrolled utilizing this Email address.");
    }

    const duplicatePhone = await Student.findOne({ phone: data.phone });
    if (duplicatePhone) {
      throw createError(400, "A student is already actively enrolled utilizing this Phone number.");
    }

    const files = req.files || {};
    let idProofPath = null;
    if (files.idProof && files.idProof.length > 0) {
      idProofPath = files.idProof[0].path;
    }

    const student = new Student({
      name: data.name,
      dob: data.dob,
      email: data.email,
      phone: data.phone,
      qualification: data.qualification,
      course: data.course,
      university: data.university,
      program: data.program,
      programFee: data.programFee,
      idProof: idProofPath,
      applicationStatus: "Draft",
      registeredBy: req.user?.userId,
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: "Application saved as Draft.",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PARTNER: Get all applications belonging to this partner
// ─────────────────────────────────────────────
export const getMyStudents = async (req, res, next) => {
  try {
    const partnerId = req.user?.userId;
    const students = await Student.find({
      registeredBy: partnerId,
      deleted: { $ne: true },
    })
    .populate("university", "name")
    .populate("program", "name")
    .populate("programFee")
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PARTNER: Update student details (only if Draft or Rejected)
// ─────────────────────────────────────────────
export const updateStudentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const partnerId = req.user?.userId;

    const student = await Student.findOne({
      _id: id,
      registeredBy: partnerId,
      deleted: { $ne: true },
    });

    if (!student) throw createError(404, "Application not found.");

    if (!["Draft", "Rejected"].includes(student.applicationStatus)) {
      throw createError(400, "You can only edit applications that are in Draft or Rejected status.");
    }

    const allowedFields = ["name", "dob", "email", "phone", "qualification", "course"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    // Handle file re-upload
    const files = req.files || {};
    if (files.idProof && files.idProof.length > 0) {
      student.idProof = files.idProof[0].path;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: "Application updated successfully.",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PARTNER: Submit application for eligibility review
// ─────────────────────────────────────────────
export const submitForEligibility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const partnerId = req.user?.userId;

    const student = await Student.findOne({
      _id: id,
      registeredBy: partnerId,
      deleted: { $ne: true },
    });

    if (!student) throw createError(404, "Application not found.");

    if (!["Draft", "Rejected"].includes(student.applicationStatus)) {
      throw createError(400, "Only Draft or Rejected applications can be submitted for eligibility.");
    }

    student.applicationStatus = "Pending Eligibility";
    // Clear previous remarks on re-submission
    if (student.admin_remarks) student.admin_remarks = "";
    await student.save();

    res.status(200).json({
      success: true,
      message: "Application submitted for eligibility review.",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN: Get all applications pending eligibility review
// ─────────────────────────────────────────────
export const getPendingEligibility = async (req, res, next) => {
  try {
    const students = await Student.find({
      applicationStatus: "Pending Eligibility",
      deleted: { $ne: true },
    })
      .populate("registeredBy", "centerName licenseeEmail")
      .sort({ updatedAt: 1 }); // Oldest first (FIFO review queue)

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN: Approve or Reject an application
// ─────────────────────────────────────────────
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, admin_remarks } = req.body;

    if (!["approve", "reject"].includes(action)) {
      throw createError(400, "Invalid action. Use 'approve' or 'reject'.");
    }

    const student = await Student.findOne({ _id: id, deleted: { $ne: true } });
    if (!student) throw createError(404, "Application not found.");

    if (student.applicationStatus !== "Pending Eligibility") {
      throw createError(400, "Only applications with 'Pending Eligibility' status can be reviewed.");
    }

    if (action === "approve") {
      student.applicationStatus = "Eligible";
      student.admin_remarks = "";
    } else {
      if (!admin_remarks || !admin_remarks.trim()) {
        throw createError(400, "A remark is required when rejecting an application.");
      }
      student.applicationStatus = "Rejected";
      student.admin_remarks = admin_remarks.trim();
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: action === "approve"
        ? "Application approved. Student is now Eligible."
        : "Application rejected with remarks.",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};
