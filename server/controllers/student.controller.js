import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";
import Student from "../models/student.js";
import ProgramFee from "../models/programFee.js";
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
    const extractPath = (field) => (files[field] && files[field].length > 0 ? files[field][0].path : null);
    const extractPaths = (field) => (files[field] ? files[field].map(f => f.path) : []);

    const student = new Student({
      name: data.name,
      dob: data.dob,
      gender: data.gender,
      religion: data.religion,
      caste: data.caste,
      address: data.address,
      email: data.email,
      phone: data.phone,
      alternativePhone: data.alternativePhone,
      otherPhone: data.otherPhone,
      
      fatherName: data.fatherName,
      motherName: data.motherName,
      fatherPhone: data.fatherPhone,
      motherPhone: data.motherPhone,

      university: data.university,
      program: data.program,
      branch: data.branch,
      completionYear: data.completionYear,
      
      tenth: {
        certificate: extractPath("tenthCertificate"),
        completionYear: data.tenthCompletionYear,
        board: data.tenthBoard,
        percentage: data.tenthPercentage,
        totalMarks: data.tenthTotalMarks,
        obtainedMarks: data.tenthObtainedMarks,
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
        papersPassed: data.bachelorsPapersPassed,
        papersEqualised: data.bachelorsPapersEqualised,
      },
      masters: {
        certificates: extractPaths("mastersCertificates"),
        university: data.mastersUniversity,
        course: data.mastersCourse,
        branch: data.mastersBranch,
        papersPassed: data.mastersPapersPassed,
        papersEqualised: data.mastersPapersEqualised,
      },

      affidavit: extractPath("affidavit"),
      videoKycStatus: data.videoKycStatus || "Pending",
      migrationCertificate: extractPath("migrationCertificate"),
      projectSubmission: extractPath("projectSubmission"),
      employmentStatus: data.employmentStatus || "Unemployed",

      idProof: extractPath("idProof"),
      applicationStatus: "Draft",
      registeredBy: req.user?.userId,
    });

    if (data.program) {
      const currentFee = await ProgramFee.findOne({ program: data.program, isCurrent: true });
      if (!currentFee) {
        throw createError(400, "Program fee is empty, please contact the admin");
      }
      student.programFee = currentFee._id;
      student.programFeeRefId = currentFee.refId;
    }

    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate("university", "name")
      .populate("program", "name category duration")
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

    const allowedFields = [
      "name", "dob", "gender", "religion", "caste", "address",
      "email", "phone", "alternativePhone", "otherPhone",
      "fatherName", "motherName", "fatherPhone", "motherPhone",
      "university", "program", "branch", "completionYear",
      "videoKycStatus", "employmentStatus"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    // Academic nested fields
    if (req.body.tenthCompletionYear) student.tenth.completionYear = req.body.tenthCompletionYear;
    if (req.body.tenthBoard) student.tenth.board = req.body.tenthBoard;
    if (req.body.tenthPercentage) student.tenth.percentage = req.body.tenthPercentage;
    if (req.body.tenthTotalMarks) student.tenth.totalMarks = req.body.tenthTotalMarks;
    if (req.body.tenthObtainedMarks) student.tenth.obtainedMarks = req.body.tenthObtainedMarks;

    if (req.body.plusTwoCompletionYear) student.plusTwo.completionYear = req.body.plusTwoCompletionYear;
    if (req.body.plusTwoBoard) student.plusTwo.board = req.body.plusTwoBoard;
    if (req.body.plusTwoPercentage) student.plusTwo.percentage = req.body.plusTwoPercentage;

    if (req.body.bachelorsUniversity) student.bachelors.university = req.body.bachelorsUniversity;
    if (req.body.bachelorsCourse) student.bachelors.course = req.body.bachelorsCourse;
    if (req.body.bachelorsBranch) student.bachelors.branch = req.body.bachelorsBranch;
    if (req.body.bachelorsPapersPassed) student.bachelors.papersPassed = req.body.bachelorsPapersPassed;
    if (req.body.bachelorsPapersEqualised) student.bachelors.papersEqualised = req.body.bachelorsPapersEqualised;

    if (req.body.mastersUniversity) student.masters.university = req.body.mastersUniversity;
    if (req.body.mastersCourse) student.masters.course = req.body.mastersCourse;
    if (req.body.mastersBranch) student.masters.branch = req.body.mastersBranch;
    if (req.body.mastersPapersPassed) student.masters.papersPassed = req.body.mastersPapersPassed;
    if (req.body.mastersPapersEqualised) student.masters.papersEqualised = req.body.mastersPapersEqualised;

    if (req.body.program) {
      const currentFee = await ProgramFee.findOne({ program: req.body.program, isCurrent: true });
      if (!currentFee) {
        throw createError(400, "Program fee is empty, please contact the admin");
      }
      student.programFee = currentFee._id;
      student.programFeeRefId = currentFee.refId;
    }

    // Handle file re-uploads
    const files = req.files || {};
    const updatePath = (field, target) => {
      if (files[field] && files[field].length > 0) student[target] = files[field][0].path;
    };
    const updateNestedPath = (field, obj, subField) => {
      if (files[field] && files[field].length > 0) student[obj][subField] = files[field][0].path;
    };

    updatePath("idProof", "idProof");
    updateNestedPath("tenthCertificate", "tenth", "certificate");
    updateNestedPath("plusTwoCertificate", "plusTwo", "certificate");
    updatePath("affidavit", "affidavit");
    updatePath("migrationCertificate", "migrationCertificate");
    updatePath("projectSubmission", "projectSubmission");

    if (files.bachelorsCertificates) {
      student.bachelors.certificates = files.bachelorsCertificates.map(f => f.path);
    }
    if (files.mastersCertificates) {
      student.masters.certificates = files.mastersCertificates.map(f => f.path);
    }

    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate("university", "name")
      .populate("program", "name category duration")
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
      throw createError(400, "Only Draft or Rejected applications can be submitted for eligibility.");
    }

    if (!student.university || !student.program) {
      throw createError(400, "Please assign a University and Program before submitting for eligibility review.");
    }

    student.applicationStatus = "Pending Eligibility";
    // Clear previous remarks on re-submission
    if (student.admin_remarks) student.admin_remarks = "";
    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate("university", "name")
      .populate("program", "name category duration")
      .populate("programFee");

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

    const populatedStudent = await Student.findById(student._id)
      .populate("registeredBy", "centerName licenseeEmail")
      .populate("university", "name")
      .populate("program", "name category duration")
      .populate("programFee");

    res.status(200).json({
      success: true,
      message: action === "approve"
        ? "Application approved. Student is now Eligible."
        : "Application rejected with remarks.",
      data: populatedStudent,
    });
  } catch (error) {
    next(error);
  }
};
