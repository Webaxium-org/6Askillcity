import express from "express";
import {
  getUniversities,
  createUniversity,
  updateUniversity,
  getPrograms,
  createProgram,
  updateProgram,
  getProgramFees,
  updateProgramFee,
  getActivityLogs,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  importUniversityData,
} from "../controllers/university.controller.js";
import { requireAuth, isAuthorized } from "../middleware/auth.js";
import multer from "multer";

const localUpload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Public routes (No authentication required)
router.get("/public/programs", getPrograms);
router.get("/public/branches", getBranches);

// All routes below require authentication
router.use(requireAuth);

// GET routes are accessible by both admins and partners
// POST/PUT routes are restricted to admins
router.route("/universities")
  .get(getUniversities)
  .post(isAuthorized({ roles: ["admin", "manager"] }), createUniversity);

router.post("/universities/import", isAuthorized({ roles: ["admin", "manager"] }), localUpload.single("file"), importUniversityData);

router.route("/universities/:id")
  .put(isAuthorized({ roles: ["admin", "manager"] }), updateUniversity);

router.route("/programs")
  .get(getPrograms)
  .post(isAuthorized({ roles: ["admin", "manager"] }), createProgram);

router.route("/programs/:id")
  .put(isAuthorized({ roles: ["admin", "manager"] }), updateProgram);

router.route("/branches")
  .get(getBranches)
  .post(isAuthorized({ roles: ["admin", "manager"] }), createBranch);

router.route("/branches/:id")
  .put(isAuthorized({ roles: ["admin", "manager"] }), updateBranch)
  .delete(isAuthorized({ roles: ["admin", "manager"] }), deleteBranch);

router.route("/branches/:branchId/fees")
  .get(getProgramFees)
  .post(isAuthorized({ roles: ["admin", "manager"] }), updateProgramFee);

router.get("/activity-logs", isAuthorized({ roles: ["admin", "manager"] }), getActivityLogs);

export default router;
