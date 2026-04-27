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
} from "../controllers/university.controller.js";
import { requireAuth, isAuthorized } from "../middleware/auth.js";

const router = express.Router();

// All routes here require authentication
router.use(requireAuth);

// GET routes are accessible by both admins and partners
// POST/PUT routes are restricted to admins
router.route("/universities")
  .get(getUniversities)
  .post(isAuthorized({ roles: ["admin"] }), createUniversity);

router.route("/universities/:id")
  .put(isAuthorized({ roles: ["admin"] }), updateUniversity);

router.route("/programs")
  .get(getPrograms)
  .post(isAuthorized({ roles: ["admin"] }), createProgram);

router.route("/programs/:id")
  .put(isAuthorized({ roles: ["admin"] }), updateProgram);

router.route("/programs/:programId/fees")
  .get(getProgramFees)
  .post(isAuthorized({ roles: ["admin"] }), updateProgramFee);

router.get("/activity-logs", isAuthorized({ roles: ["admin"] }), getActivityLogs);

export default router;
