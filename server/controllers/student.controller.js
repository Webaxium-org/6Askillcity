import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";
import Student from "../models/student.js";
import ProgramFee from "../models/programFee.js";
import createError from "http-errors";
import {
  sendToAdmins,
  sendToRecipient,
} from "../services/notification.service.js";

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
  { name: "idProof", maxCount: 1 },
  { name: "tenthCertificate", maxCount: 1 },
  { name: "plusTwoCertificate", maxCount: 1 },
  { name: "bachelorsCertificates", maxCount: 5 },
  { name: "mastersCertificates", maxCount: 5 },
  { name: "affidavit", maxCount: 1 },
  { name: "migrationCertificate", maxCount: 1 },
  { name: "projectSubmission", maxCount: 1 },
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
      .populate(
        "registeredBy",
        "centerName licenseeEmail licenseeContactNumber",
      )
      .populate("university", "name")
      .populate("program", "name")
      .populate("branch", "name duration type")
      .populate("programFee");

    if (!student) throw createError(404, "Application not found.");

    if (req.user.userType === "partner") {
      if (
        String(student.registeredBy?._id || student.registeredBy) !==
        String(req.user.userId)
      ) {
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

    if (data.email) {
      const duplicateEmail = await Student.findOne({
        email: data.email,
        registeredBy: req.user.userId,
        deleted: { $ne: true },
      });
      if (duplicateEmail) {
        throw createError(
          400,
          "You have already registered a student with this Email address.",
        );
      }
    }

    if (data.phone) {
      const duplicatePhone = await Student.findOne({
        phone: data.phone,
        registeredBy: req.user.userId,
        deleted: { $ne: true },
      });
      if (duplicatePhone) {
        throw createError(
          400,
          "You have already registered a student with this Phone number.",
        );
      }
    }

    const files = req.files || {};

    const createDocObject = (filePath) => {
      if (!filePath) return undefined;
      return {
        path: filePath,
        status: "Pending",
        uploadedAt: new Date(),
        uploadedBy: req.user?.userId,
        onModel: req.user?.userType === "partner" ? "AdmissionPoint" : "User",
      };
    };

    const createDocObjects = (filesArray) => {
      if (!filesArray) return [];
      return filesArray.map((f) => createDocObject(f.path));
    };

    const extractPath = (field) => {
      const filePath =
        files[field] && files[field].length > 0 ? files[field][0].path : null;
      return createDocObject(filePath);
    };

    const extractPaths = (field) => {
      return createDocObjects(files[field]);
    };

    const student = new Student({
      name: data.name,
      dob: data.dob || undefined,
      gender: data.gender,
      religion: data.religion,
      caste: data.caste,
      address: data.address,
      email: data.email || undefined,
      phone: data.phone || undefined,
      alternativePhone: data.alternativePhone,
      otherPhone: data.otherPhone,

      fatherName: data.fatherName,
      motherName: data.motherName,
      fatherPhone: data.fatherPhone,
      motherPhone: data.motherPhone,

      university: data.university || undefined,
      program: data.program || undefined,
      branch: data.branch || undefined,
      completionYear: data.completionYear,

      tenth: {
        certificate: extractPath("tenthCertificate"),
        completionYear: data.tenthCompletionYear,
        board: data.tenthBoard,
        percentage: data.tenthPercentage,
        totalMarks: data.tenthTotalMarks || undefined,
        obtainedMarks: data.tenthObtainedMarks || undefined,
      },
      plusTwo: {
        certificate: extractPath("plusTwoCertificate"),
        completionYear: data.plusTwoCompletionYear,
        board: data.plusTwoBoard,
        percentage: data.plusTwoPercentage,
      },
      bachelors: {
        certificates: extractPaths("bachelorsCertificates"),
        university: data.bachelorsUniversity,
        course: data.bachelorsCourse,
        branch: data.bachelorsBranch,
        papersPassed: data.bachelorsPapersPassed || undefined,
        papersEqualised: data.bachelorsPapersEqualised || undefined,
      },
      masters: {
        certificates: extractPaths("mastersCertificates"),
        university: data.mastersUniversity,
        course: data.mastersCourse,
        branch: data.mastersBranch,
        papersPassed: data.mastersPapersPassed || undefined,
        papersEqualised: data.mastersPapersEqualised || undefined,
      },

      affidavit: extractPath("affidavit"),
      videoKycStatus: data.videoKycStatus || "Pending",
      migrationCertificate: extractPath("migrationCertificate"),
      projectSubmission: extractPath("projectSubmission"),
      employmentStatus: data.employmentStatus || "Unemployed",

      idProof: extractPath("idProof"),
      applicationStatus: data.applicationStatus || "Draft",
      enrollmentStatus: data.enrollmentStatus || "Identity",
      highestQualification: data.highestQualification,
      batch: data.batch,
      registeredBy: req.user?.userId,
    });

    if (data.branch) {
      const currentFee = await ProgramFee.findOne({
        branch: data.branch,
        isCurrent: true,
      });
      if (currentFee) {
        student.programFee = currentFee._id;
        student.programFeeRefId = currentFee.refId;
      }
    }

    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate("university", "name")
      .populate("program", "name")
      .populate("branch", "name duration type")
      .populate("programFee");

    res.status(201).json({
      success: true,
      message: "Application saved as Draft.",
      data: populatedStudent,
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
      .populate("branch", "name")
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
      throw createError(
        400,
        "You can only edit applications that are in Draft or Rejected status.",
      );
    }

    const allowedFields = [
      "name",
      "dob",
      "gender",
      "religion",
      "caste",
      "country",
      "address",
      "email",
      "phone",
      "alternativePhone",
      "otherPhone",
      "fatherName",
      "motherName",
      "fatherPhone",
      "motherPhone",
      "university",
      "program",
      "branch",
      "completionYear",
      "videoKycStatus",
      "employmentStatus",
      "highestQualification",
      "applicationStatus",
      "enrollmentStatus",
      "batch",
    ];

    const idFields = ["university", "program", "branch", "programFee"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Handle empty strings for unique or ObjectId fields
        const isEmpty = req.body[field] === "";
        const isIdField = idFields.includes(field);
        const isUniqueField = field === "email" || field === "phone";

        if (isEmpty && (isIdField || isUniqueField)) {
          student[field] = undefined;
        } else {
          student[field] = req.body[field];
        }
      }
    });

    if (req.body.applicationStatus) {
      student.applicationStatus = req.body.applicationStatus;
    }

    // Academic nested fields
    if (req.body.tenthCompletionYear)
      student.tenth.completionYear = req.body.tenthCompletionYear;
    if (req.body.tenthBoard) student.tenth.board = req.body.tenthBoard;
    if (req.body.tenthPercentage)
      student.tenth.percentage = req.body.tenthPercentage;
    if (req.body.tenthTotalMarks)
      student.tenth.totalMarks = req.body.tenthTotalMarks;
    if (req.body.tenthObtainedMarks)
      student.tenth.obtainedMarks = req.body.tenthObtainedMarks;

    if (req.body.plusTwoCompletionYear)
      student.plusTwo.completionYear = req.body.plusTwoCompletionYear;
    if (req.body.plusTwoBoard) student.plusTwo.board = req.body.plusTwoBoard;
    if (req.body.plusTwoPercentage)
      student.plusTwo.percentage = req.body.plusTwoPercentage;

    if (req.body.bachelorsUniversity)
      student.bachelors.university = req.body.bachelorsUniversity;
    if (req.body.bachelorsCourse)
      student.bachelors.course = req.body.bachelorsCourse;
    if (req.body.bachelorsBranch)
      student.bachelors.branch = req.body.bachelorsBranch;
    if (req.body.bachelorsPapersPassed)
      student.bachelors.papersPassed = req.body.bachelorsPapersPassed;
    if (req.body.bachelorsPapersEqualised)
      student.bachelors.papersEqualised = req.body.bachelorsPapersEqualised;

    if (req.body.mastersUniversity)
      student.masters.university = req.body.mastersUniversity;
    if (req.body.mastersCourse) student.masters.course = req.body.mastersCourse;
    if (req.body.mastersBranch) student.masters.branch = req.body.mastersBranch;
    if (req.body.mastersPapersPassed)
      student.masters.papersPassed = req.body.mastersPapersPassed;
    if (req.body.mastersPapersEqualised)
      student.masters.papersEqualised = req.body.mastersPapersEqualised;

    if (req.body.branch) {
      const currentFee = await ProgramFee.findOne({
        branch: req.body.branch,
        isCurrent: true,
      });
      if (!currentFee) {
        throw createError(400, "Branch fee is empty, please contact the admin");
      }
      student.programFee = currentFee._id;
      student.programFeeRefId = currentFee.refId;
    }

    // Handle file re-uploads
    const files = req.files || {};

    const createDocObject = (filePath) => {
      if (!filePath) return undefined;
      return {
        path: filePath,
        status: "Pending",
        uploadedAt: new Date(),
        uploadedBy: req.user?.userId,
        onModel: req.user?.userType === "partner" ? "AdmissionPoint" : "User",
      };
    };

    const updatePath = (field, target) => {
      if (files[field] && files[field].length > 0)
        student[target] = createDocObject(files[field][0].path);
    };
    const updateNestedPath = (field, obj, subField) => {
      if (files[field] && files[field].length > 0)
        student[obj][subField] = createDocObject(files[field][0].path);
    };

    updatePath("idProof", "idProof");
    updateNestedPath("tenthCertificate", "tenth", "certificate");
    updateNestedPath("plusTwoCertificate", "plusTwo", "certificate");
    updatePath("affidavit", "affidavit");
    updatePath("migrationCertificate", "migrationCertificate");
    updatePath("projectSubmission", "projectSubmission");

    if (files.bachelorsCertificates) {
      student.bachelors.certificates = files.bachelorsCertificates.map((f) =>
        createDocObject(f.path),
      );
    }
    if (files.mastersCertificates) {
      student.masters.certificates = files.mastersCertificates.map((f) =>
        createDocObject(f.path),
      );
    }

    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate("university", "name")
      .populate("program", "name")
      .populate("branch", "name duration type")
      .populate("programFee");

    res.status(200).json({
      success: true,
      message: "Application updated successfully.",
      data: populatedStudent,
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
      throw createError(
        400,
        "Only Draft or Rejected applications can be submitted for eligibility.",
      );
    }

    // Comprehensive validation before submission
    const requiredFields = [
      "name",
      "dob",
      "gender",
      "religion",
      "caste",
      "address",
      "email",
      "phone",
      "alternativePhone",
      "fatherName",
      "fatherPhone",
      "university",
      "program",
      "branch",
      "idProof",
      "batch",
      "completionYear",
    ];

    const missing = requiredFields.filter((f) => !student[f]);

    if (missing.length > 0) {
      throw createError(
        400,
        `Please complete all required fields before submitting: ${missing.join(", ")}`,
      );
    }

    // Academic nested validation
    if (!student.tenth?.certificate || !student.tenth?.completionYear) {
      throw createError(
        400,
        "10th Standard details and certificate are required.",
      );
    }
    if (!student.plusTwo?.certificate || !student.plusTwo?.completionYear) {
      throw createError(400, "Plus Two details and certificate are required.");
    }

    student.applicationStatus = "Pending Eligibility";
    student.applicationSubmittedDate = new Date();
    // Clear previous remarks on re-submission
    if (student.admin_remarks) student.admin_remarks = "";

    student.applicationHistory.push({
      status: "Pending Eligibility",
      date: new Date(),
      remarks: "Submitted for eligibility review",
    });

    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate("university", "name")
      .populate("program", "name")
      .populate("branch", "name duration type")
      .populate("programFee");

    await sendToAdmins({
      title: "New Application Submitted",
      message: `Application for ${student.name} is pending review.`,
      type: "application_submitted",
      relatedId: student._id,
      link: "/dashboard/eligibility-queue",
    });

    res.status(200).json({
      success: true,
      message: "Application submitted for eligibility review.",
      data: populatedStudent,
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
      .populate("university", "name")
      .populate("program", "name")
      .populate("branch", "name")
      .sort({ applicationSubmittedDate: -1 }); // Newest submissions first

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
      throw createError(
        400,
        "Only applications with 'Pending Eligibility' status can be reviewed.",
      );
    }

    if (action === "approve") {
      student.applicationStatus = "Eligible";
      student.admin_remarks = "";
      student.eligibilityApprovalDate = new Date();
      student.eligibilityApprovedBy = req.user?.userId;

      student.applicationHistory.push({
        status: "Eligible",
        date: new Date(),
        actionBy: req.user?.userId,
        remarks: "Application approved by admin",
      });
    } else {
      if (!admin_remarks || !admin_remarks.trim()) {
        throw createError(
          400,
          "A remark is required when rejecting an application.",
        );
      }
      student.applicationStatus = "Rejected";
      student.admin_remarks = admin_remarks.trim();

      student.applicationHistory.push({
        status: "Rejected",
        date: new Date(),
        actionBy: req.user?.userId,
        remarks: admin_remarks.trim(),
      });
    }

    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate("registeredBy", "centerName licenseeEmail")
      .populate("university", "name")
      .populate("program", "name")
      .populate("branch", "name duration type")
      .populate("programFee");

    if (student.registeredBy) {
      await sendToRecipient(
        student.registeredBy._id || student.registeredBy,
        "AdmissionPoint",
        {
          title:
            action === "approve"
              ? "Application Approved"
              : "Application Rejected",
          message:
            action === "approve"
              ? `Application for ${student.name} has been approved. The student fee can be paid now.`
              : `Application for ${student.name} has been rejected. Reason: ${admin_remarks}`,
          type:
            action === "approve"
              ? "application_approved"
              : "application_rejected",
          relatedId: student._id,
          link: "/dashboard/applications",
        },
      );
    }

    res.status(200).json({
      success: true,
      message:
        action === "approve"
          ? "Application approved. Student is now Eligible."
          : "Application rejected with remarks.",
      data: populatedStudent,
    });
  } catch (error) {
    next(error);
  }
};
