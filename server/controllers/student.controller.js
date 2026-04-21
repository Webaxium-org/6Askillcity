import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";
import Student from "../models/student.js";

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

export const enrollStudent = async (req, res, next) => {
  try {
    const data = req.body;

    // Safety Protocol: Prevent double registrations based on strictly unique fields
    const duplicateEmail = await Student.findOne({ email: data.email });
    if (duplicateEmail) {
      return res.status(400).json({
        message: "A student is already actively enrolled utilizing this Email address.",
      });
    }

    const duplicatePhone = await Student.findOne({ phone: data.phone });
    if (duplicatePhone) {
      return res.status(400).json({
        message: "A student is already actively enrolled utilizing this Phone number.",
      });
    }

    // Extract path logic if document uploaded
    const files = req.files || {};
    let idProofPath = null;
    if (files.idProof && files.idProof.length > 0) {
       idProofPath = files.idProof[0].path;
    }

    // Construct entity correctly
    const student = new Student({
      name: data.name,
      dob: data.dob,
      email: data.email,
      phone: data.phone,
      qualification: data.qualification,
      course: data.course,
      idProof: idProofPath,
      // registeredBy: req.user?._id // Future hook for partner access
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: "Student enrollment correctly staged and written to Database.",
      data: student,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    next(error);
  }
};
