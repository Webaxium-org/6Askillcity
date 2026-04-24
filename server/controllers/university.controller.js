import University from "../models/university.js";
import Program from "../models/program.js";
import ProgramFee from "../models/programFee.js";
import ActivityLog from "../models/activityLog.js";
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

// ─────────────────────────────────────────────
// UNIVERSITY CRUD
// ─────────────────────────────────────────────

export const getUniversities = async (req, res, next) => {
  try {
    const universities = await University.find().sort({ name: 1 });
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
      university._id
    );

    res.status(201).json({ success: true, data: university });
  } catch (error) {
    next(error);
  }
};

export const updateUniversity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const university = await University.findByIdAndUpdate(id, req.body, { new: true });
    if (!university) throw createError(404, "University not found");

    await logActivity(
      "UPDATE_UNIVERSITY",
      `Updated university: ${university.name}`,
      req.user.userId,
      "University",
      university._id
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
    const { universityId } = req.query;
    const filter = universityId ? { university: universityId } : {};
    const programs = await Program.find(filter).populate("university", "name").sort({ name: 1 });
    res.status(200).json({ success: true, data: programs });
  } catch (error) {
    next(error);
  }
};

export const createProgram = async (req, res, next) => {
  try {
    console.log("Creating Program with body:", req.body);
    const program = new Program(req.body);
    await program.save();

    await logActivity(
      "CREATE_PROGRAM",
      `Created program: ${program.name}`,
      req.user.userId,
      "Program",
      program._id
    );

    res.status(201).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

export const updateProgram = async (req, res, next) => {
  try {
    const { id } = req.params;
    const program = await Program.findByIdAndUpdate(id, req.body, { new: true });
    if (!program) throw createError(404, "Program not found");

    await logActivity(
      "UPDATE_PROGRAM",
      `Updated program: ${program.name}`,
      req.user.userId,
      "Program",
      program._id
    );

    res.status(200).json({ success: true, data: program });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// FEE MANAGEMENT
// ─────────────────────────────────────────────

export const getProgramFees = async (req, res, next) => {
  try {
    const { programId } = req.params;
    const fees = await ProgramFee.find({ program: programId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    next(error);
  }
};

export const updateProgramFee = async (req, res, next) => {
  try {
    const { programId } = req.params;
    const { totalFee, applicationFee, tuitionFee, otherFees } = req.body;

    // Mark current fee as not current
    await ProgramFee.updateMany({ program: programId, isCurrent: true }, { isCurrent: false });

    // Create new fee version
    const newFee = new ProgramFee({
      program: programId,
      totalFee,
      applicationFee,
      tuitionFee,
      otherFees,
      isCurrent: true,
    });
    await newFee.save();

    await logActivity(
      "UPDATE_FEE",
      `Updated fee for program ID: ${programId}. New total: ${totalFee}`,
      req.user.userId,
      "ProgramFee",
      newFee._id
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
