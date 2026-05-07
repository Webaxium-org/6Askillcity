import express from "express";

import { isAuthorized, requireAuth } from "../middleware/auth.js";

import {
  enrollStudent,
  uploadStudentDocs,
  prepareStudentId,
  getMyStudents,
  getStudentById,
  updateStudentDetails,
  submitForEligibility,
  getPendingEligibility,
  updateApplicationStatus,
} from "../controllers/student.controller.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// ── Partner Routes ─────────────────────────────
// Partner: Create a draft application
router.post(
  "/register",
  isAuthorized({ types: ["partner"] }),
  prepareStudentId,
  uploadStudentDocs,
  enrollStudent
);

// Partner: List own applications
router.get(
  "/my-applications",
  isAuthorized({ types: ["partner"] }),
  getMyStudents
);

// ── Admin Routes ───────────────────────────────
// Admin: Review queue — all Pending Eligibility applications
// NOTE: Must be declared BEFORE /:id to avoid route shadowing
router.get(
  "/pending-eligibility",
  isAuthorized({ roles: ["admin", "manager"] }),
  getPendingEligibility
);

// ── Shared Route ───────────────────────────────
// Get a single application by ID (partner = own only; admin = any)
router.get(
  "/:id",
  isAuthorized({ types: ["partner", "admin"] }),
  getStudentById
);

// Partner: Edit a draft or rejected application
router.put(
  "/:id",
  isAuthorized({ types: ["partner"] }),
  prepareStudentId,
  uploadStudentDocs,
  updateStudentDetails
);

// Partner: Submit (or re-submit) for eligibility
router.post(
  "/:id/submit",
  isAuthorized({ types: ["partner"] }),
  submitForEligibility
);

// Admin: Approve or Reject an application
router.patch(
  "/:id/review",
  isAuthorized({ roles: ["admin", "manager"] }),
  updateApplicationStatus
);

export default router;
