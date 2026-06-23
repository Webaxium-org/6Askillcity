import University from "../models/university.js";
import Program from "../models/program.js";
import Branch from "../models/branch.js";
import ProgramFee from "../models/programFee.js";
import ActivityLog from "../models/activityLog.js";
import Student from "../models/student.js";
import PartnerPermission from "../models/partnerPermission.js";
import createError from "http-errors";
import xlsx from "xlsx";
import mongoose from "mongoose";

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

// ─────────────────────────────────────────────
// UNIVERSITY CRUD
// ─────────────────────────────────────────────

export const getUniversities = async (req, res, next) => {
  try {
    const universities = await University.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, data: universities });
  } catch (error) {
    next(error);
  }
};

export const createUniversity = async (req, res, next) => {
  try {
    console.log("Creating University with body:", req.body);
    const university = new University(req.body);
    await university.save();

    await logActivity(
      "CREATE_UNIVERSITY",
      `Created university: ${university.name}`,
      req.user.userId,
      "University",
      university._id,
    );

    res.status(201).json({ success: true, data: university });
  } catch (error) {
    next(error);
  }
};

export const updateUniversity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const university = await University.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!university) throw createError(404, "University not found");

    await logActivity(
      "UPDATE_UNIVERSITY",
      `Updated university: ${university.name}`,
      req.user.userId,
      "University",
      university._id,
    );

    res.status(200).json({ success: true, data: university });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PROGRAM CRUD
// ─────────────────────────────────────────────

export const getPrograms = async (req, res, next) => {
  try {
    const { universityId, programType, isActive } = req.query;
    const filter = {};
    if (universityId) filter.university = universityId;
    if (programType) filter.programType = programType;
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }
    const programs = await Program.find(filter)
      .populate("university", "name")
      .sort({ name: 1 });
    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    next(error);
  }
};

export const createProgram = async (req, res, next) => {
  try {
    console.log("Creating Program with body:", req.body);
    const {
      name,
      university,
      isActive,
      programType,
      eligibilityChecklist,
      mode,
    } = req.body;
    const program = new Program({
      name,
      university,
      isActive,
      programType,
      eligibilityChecklist,
      mode,
    });
    await program.save();

    // Removed fee creation from program, it will now be handled at branch level

    await logActivity(
      "CREATE_PROGRAM",
      `Created program: ${program.name}`,
      req.user.userId,
      "Program",
      program._id,
    );

    res.status(201).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

export const updateProgram = async (req, res, next) => {
  try {
    const { id } = req.params;
    const program = await Program.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!program) throw createError(404, "Program not found");

    await logActivity(
      "UPDATE_PROGRAM",
      `Updated program: ${program.name}`,
      req.user.userId,
      "Program",
      program._id,
    );

    res.status(200).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

export const deleteProgram = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the program is referenced by any Student
    const studentCount = await Student.countDocuments({ program: id });
    if (studentCount > 0) {
      throw createError(
        400,
        `Cannot delete program because it is linked to ${studentCount} student application(s).`,
      );
    }

    const program = await Program.findById(id);
    if (!program) throw createError(404, "Program not found");

    // Get all branches under this program
    const branches = await Branch.find({ program: id });
    const branchIds = branches.map((b) => b._id);

    // Double check if any branch is linked to any Student
    if (branchIds.length > 0) {
      const studentBranchCount = await Student.countDocuments({
        branch: { $in: branchIds },
      });
      if (studentBranchCount > 0) {
        throw createError(
          400,
          `Cannot delete program because one of its branches is linked to ${studentBranchCount} student application(s).`,
        );
      }
    }

    // Perform hard delete on the program
    await Program.findByIdAndDelete(id);

    // Delete associated branches
    await Branch.deleteMany({ program: id });

    // Delete associated fees
    if (branchIds.length > 0) {
      await ProgramFee.deleteMany({ branch: { $in: branchIds } });
    }

    // Delete associated partner permissions (both program and branch level)
    await PartnerPermission.deleteMany({
      $or: [{ programId: id }, { branchId: { $in: branchIds } }],
    });

    await logActivity(
      "DELETE_PROGRAM",
      `Deleted program: ${program.name}`,
      req.user.userId,
      "Program",
      program._id,
    );

    res
      .status(200)
      .json({ success: true, message: "Program deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// BRANCH CRUD
// ─────────────────────────────────────────────

export const getBranches = async (req, res, next) => {
  try {
    const { programId } = req.query;
    const filter = {};
    if (programId && mongoose.Types.ObjectId.isValid(programId)) {
      filter.program = new mongoose.Types.ObjectId(programId);
    } else if (programId) {
      filter.program = null;
    }

    // Use aggregation to get branches with their current fees
    const branches = await Branch.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "programs",
          localField: "program",
          foreignField: "_id",
          as: "program",
        },
      },
      { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "universities",
          localField: "program.university",
          foreignField: "_id",
          as: "program.university",
        },
      },
      {
        $unwind: {
          path: "$program.university",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "programfees",
          let: { branchId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$branch", "$$branchId"] },
                    { $eq: ["$isCurrent", true] },
                  ],
                },
              },
            },
          ],
          as: "currentFee",
        },
      },
      { $unwind: { path: "$currentFee", preserveNullAndEmptyArrays: true } },
      { $sort: { name: 1 } },
    ]);

    res.status(200).json({ success: true, data: branches });
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req, res, next) => {
  try {
    const {
      name,
      program,
      duration,
      type,
      isActive,
      applicationFee,
      tuitionFee,
      totalFee,
    } = req.body;

    const branch = new Branch({ name, program, duration, type, isActive });
    await branch.save();

    // If fee details are provided and at least one is greater than zero, create an initial fee record
    if (
      (applicationFee && Number(applicationFee) > 0) ||
      (tuitionFee && Number(tuitionFee) > 0) ||
      (totalFee && Number(totalFee) > 0)
    ) {
      const newFee = new ProgramFee({
        branch: branch._id,
        applicationFee: applicationFee || 0,
        tuitionFee: tuitionFee || 0,
        totalFee:
          totalFee || Number(applicationFee || 0) + Number(tuitionFee || 0),
        isCurrent: true,
      });
      await newFee.save();
    }

    await logActivity(
      "CREATE_BRANCH",
      `Created branch: ${branch.name}`,
      req.user.userId,
      "Branch",
      branch._id,
    );

    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByIdAndUpdate(id, req.body, { new: true });
    if (!branch) throw createError(404, "Branch not found");

    await logActivity(
      "UPDATE_BRANCH",
      `Updated branch: ${branch.name}`,
      req.user.userId,
      "Branch",
      branch._id,
    );

    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// FEE MANAGEMENT
// ─────────────────────────────────────────────

export const getProgramFees = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const fees = await ProgramFee.find({ branch: branchId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    next(error);
  }
};

export const updateProgramFee = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { totalFee, applicationFee, tuitionFee, otherFees } = req.body;

    // Mark current fee as not current
    await ProgramFee.updateMany(
      { branch: branchId, isCurrent: true },
      { isCurrent: false },
    );

    // Create new fee version
    const newFee = new ProgramFee({
      branch: branchId,
      totalFee,
      applicationFee,
      tuitionFee,
      otherFees,
      isCurrent: true,
    });
    await newFee.save();

    await logActivity(
      "UPDATE_FEE",
      `Updated fee for branch ID: ${branchId}. New total: ${totalFee}`,
      req.user.userId,
      "ProgramFee",
      newFee._id,
    );

    res.status(201).json({ success: true, data: newFee });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ACTIVITY LOGS
// ─────────────────────────────────────────────

export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate("performedBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export const downloadImportTemplate = async (req, res, next) => {
  try {
    const { type } = req.query; // 'entire' or 'specific'

    let headers, data;
    if (type === "specific") {
      headers = ["Branch", "Eligibility", "Duration"];
      data = [
        {
          Branch: "Accountancy",
          Eligibility:
            "1. Secondary Education Certificate\n2. Senior Secondary Education Certificate\n3. Under Graduate Degree Grade Card from the previous University for proving Credit Equivalency\n4. Aadhaar Card\n5. Passport size photo",
          Duration:
            "Depends upon Course Credits Equivalency with previous University",
        },
      ];
    } else {
      headers = [
        "Course",
        "Branch",
        "Eligibility",
        "Mode",
        "Program Type",
        "Duration",
      ];
      data = [
        {
          Course: "Bachelor of Commerce (B.Com.)",
          Branch: "Accountancy",
          Eligibility:
            "1. Secondary Education Certificate\n2. Senior Secondary Education Certificate\n3. Under Graduate Degree Grade Card from the previous University for proving Credit Equivalency\n4. Aadhaar Card\n5. Passport size photo",
          Mode: "On-Campus",
          "Program Type": "Bachelors Degree",
          Duration:
            "Depends upon Course Credits Equivalency with previous University",
        },
      ];
    }

    const worksheet = xlsx.utils.json_to_sheet(data, { header: headers });
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Template");

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=template_${type}.xlsx`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const importUniversityData = async (req, res, next) => {
  try {
    const { universityId, importType, programId } = req.body;
    if (!universityId) {
      throw createError(400, "University ID is required");
    }
    if (!req.file) {
      throw createError(400, "Excel file is required");
    }

    const university = await University.findById(universityId);
    if (!university) {
      throw createError(404, "University not found");
    }

    let targetProgram = null;
    if (importType === "specific") {
      if (!programId) {
        throw createError(
          400,
          "Program ID (Course) is required for specific course import",
        );
      }
      targetProgram = await Program.findById(programId);
      if (!targetProgram) {
        throw createError(404, "Target Course (Program) not found");
      }
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      throw createError(400, "Excel file is empty");
    }

    const parseEligibility = (raw) => {
      if (!raw) return [];
      return raw
        .toString()
        .split(/\r?\n/)
        .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter((line) => line.length > 0);
    };

    const normalizeProgramType = (type) => {
      if (!type) return "Bachelors Degree";
      const t = type.toString().toLowerCase().trim();
      if (t.includes("master")) return "Masters Degree";
      if (t.includes("bachelor")) return "Bachelors Degree";
      if (
        t.includes("pg deploma") ||
        t.includes("pg diploma") ||
        t.includes("post graduate diploma")
      )
        return "PG Diploma";
      if (t.includes("skill program")) return "Skill Programs";
      if (t.includes("skill test")) return "Skill Test";
      return "Bachelors Degree";
    };

    const normalizeMode = (mode) => {
      if (!mode) return "External";
      const m = mode.toString().toLowerCase().trim();
      if (
        m.includes("campus") ||
        m.includes("oncampus") ||
        m.includes("on-campus")
      )
        return "On-Campus";
      if (m.includes("skill")) return "Skill Based";
      if (m.includes("external")) return "External";
      return "External";
    };

    const normalizedRows = rows.map((row) => {
      const newRow = {};
      for (const key of Object.keys(row)) {
        newRow[key.trim().toLowerCase()] = row[key];
      }
      return newRow;
    });

    let importCount = 0;

    if (importType === "specific") {
      for (const row of normalizedRows) {
        const branchVal = row["branch"]?.toString().trim();
        const eligibilityVal = row["eligibility"]?.toString().trim();
        const durationVal = row["duration"]?.toString().trim() || "N/A";

        if (!branchVal) continue;

        const checklist = parseEligibility(eligibilityVal);

        // Update target Program's checklist if present
        if (checklist.length > 0) {
          const existingSet = new Set(targetProgram.eligibilityChecklist || []);
          checklist.forEach((item) => existingSet.add(item));
          targetProgram.eligibilityChecklist = Array.from(existingSet);
          await targetProgram.save();
        }

        // Find or create Branch under targetProgram
        let branch = await Branch.findOne({
          program: targetProgram._id,
          name: branchVal,
        });

        if (!branch) {
          branch = new Branch({
            name: branchVal,
            program: targetProgram._id,
            duration: durationVal,
            isActive: true,
          });
          await branch.save();
        } else {
          branch.duration = durationVal || branch.duration;
          await branch.save();
        }

        importCount++;
      }
    } else {
      // Entire Courses Lists mode
      let currentCourse = "";
      let currentMode = "";
      let currentProgramType = "";
      let currentEligibility = "";
      let currentDuration = "";

      for (const row of normalizedRows) {
        const course = row["course"]?.toString().trim();
        const branch = row["branch"]?.toString().trim();
        const eligibility = row["eligibility"]?.toString().trim();
        const mode = row["mode"]?.toString().trim();
        const programType = (row["program type"] || row["programtype"])
          ?.toString()
          .trim();
        const duration = row["duration"]?.toString().trim();

        if (course) currentCourse = course;
        if (eligibility) currentEligibility = eligibility;
        if (mode) currentMode = mode;
        if (programType) currentProgramType = programType;
        if (duration) currentDuration = duration;

        if (!branch) continue;
        if (!currentCourse) continue;

        const finalMode = normalizeMode(currentMode);
        const finalProgramType = normalizeProgramType(currentProgramType);
        const finalDuration = currentDuration || "N/A";
        const checklist = parseEligibility(currentEligibility);

        // Find or create Program under the university
        let program = await Program.findOne({
          university: universityId,
          name: currentCourse,
        });

        if (!program) {
          program = new Program({
            name: currentCourse,
            university: universityId,
            programType: finalProgramType,
            mode: finalMode,
            eligibilityChecklist: checklist,
            isActive: true,
          });
          await program.save();
        } else {
          program.programType = finalProgramType;
          program.mode = finalMode;
          // Merge checklist
          const existingSet = new Set(program.eligibilityChecklist || []);
          checklist.forEach((item) => existingSet.add(item));
          program.eligibilityChecklist = Array.from(existingSet);
          await program.save();
        }

        // Find or create Branch
        let branchDoc = await Branch.findOne({
          program: program._id,
          name: branch,
        });

        if (!branchDoc) {
          branchDoc = new Branch({
            name: branch,
            program: program._id,
            duration: finalDuration,
            isActive: true,
          });
          await branchDoc.save();
        } else {
          branchDoc.duration = finalDuration || branchDoc.duration;
          await branchDoc.save();
        }

        importCount++;
      }
    }

    await logActivity(
      "IMPORT_UNIVERSITY_DATA",
      `Imported ${importCount} branches/courses for university: ${university.name} (type: ${importType || "entire"})`,
      req.user.userId,
      "University",
      university._id,
    );

    res.status(200).json({
      success: true,
      message: `Successfully imported ${importCount} courses/branches.`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the branch is referenced by any Student
    const studentCount = await Student.countDocuments({ branch: id });
    if (studentCount > 0) {
      throw createError(
        400,
        `Cannot delete branch because it is linked to ${studentCount} student application(s).`,
      );
    }

    const branch = await Branch.findById(id);
    if (!branch) throw createError(404, "Branch not found");

    // Perform hard delete
    await Branch.findByIdAndDelete(id);

    // Delete associated fees
    await ProgramFee.deleteMany({ branch: id });

    // Delete associated partner permissions
    await PartnerPermission.deleteMany({ branchId: id });

    await logActivity(
      "DELETE_BRANCH",
      `Deleted branch: ${branch.name}`,
      req.user.userId,
      "Branch",
      branch._id,
    );

    res
      .status(200)
      .json({ success: true, message: "Branch deleted successfully" });
  } catch (error) {
    next(error);
  }
};
