import Followup from "../models/followup.js";
import Student from "../models/student.js";
import createError from "http-errors";

// ─────────────────────────────────────────────
// POST /followups/:studentId
// Create a followup note for a given student/application
// Accessible by both partners (who own the application) and admins
// ─────────────────────────────────────────────
export const addFollowup = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { note, category, nextFollowupDate } = req.body;

    if (!note || !note.trim()) {
      throw createError(400, "Follow-up note cannot be empty.");
    }

    // Verify the student exists
    const student = await Student.findOne({ _id: studentId, deleted: { $ne: true } });
    if (!student) throw createError(404, "Application not found.");

    // Partners can only add followups to their own applications
    if (req.user.userType === "partner") {
      if (String(student.registeredBy) !== String(req.user.userId)) {
        throw createError(403, "You can only add follow-ups to your own applications.");
      }
    }

    const followup = await Followup.create({
      student: studentId,
      authorId: req.user.userId,
      authorType: req.user.userType === "partner" ? "partner" : "admin",
      authorName: req.user.name,
      note: note.trim(),
      category: category || "general",
      status: req.body.status || student.status, // Capture status
      nextFollowupDate: nextFollowupDate || null,
    });

    // Update the student record with the latest scheduled followup date
    if (nextFollowupDate) {
      student.nextFollowupDate = nextFollowupDate;
      await student.save();
    }

    res.status(201).json({
      success: true,
      message: "Follow-up logged successfully.",
      data: followup,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /followups/:studentId
// Fetch all followups for a given application (paginated, newest first)
// ─────────────────────────────────────────────
export const getFollowups = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Verify student exists and access rights
    const student = await Student.findOne({ _id: studentId, deleted: { $ne: true } });
    if (!student) throw createError(404, "Application not found.");

    if (req.user.userType === "partner") {
      if (String(student.registeredBy) !== String(req.user.userId)) {
        throw createError(403, "Access denied.");
      }
    }

    const [followups, total] = await Promise.all([
      Followup.find({ student: studentId, deleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Followup.countDocuments({ student: studentId, deleted: { $ne: true } }),
    ]);

    res.status(200).json({
      success: true,
      data: followups,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// DELETE /followups/:followupId
// Soft-delete a followup (admin only or author who created it)
// ─────────────────────────────────────────────
export const deleteFollowup = async (req, res, next) => {
  try {
    const { followupId } = req.params;

    const followup = await Followup.findById(followupId);
    if (!followup) throw createError(404, "Follow-up not found.");

    // Author or admin can delete
    const isAdmin = req.user.userType === "admin";
    const isAuthor = String(followup.authorId) === String(req.user.userId);

    if (!isAdmin && !isAuthor) {
      throw createError(403, "You can only delete your own follow-ups.");
    }

    followup.deleted = true;
    await followup.save();

    res.status(200).json({ success: true, message: "Follow-up deleted." });
  } catch (error) {
    next(error);
  }
};
