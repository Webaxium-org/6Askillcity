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
  .post(isAuthorized({ roles: ["admin", "manager"] }), createUniversity);

router.route("/universities/:id")
  .put(isAuthorized({ roles: ["admin", "manager"] }), updateUniversity);

router.route("/programs")
  .get(getPrograms)
  .post(isAuthorized({ roles: ["admin", "manager"] }), createProgram);

router.route("/programs/:id")
  .put(isAuthorized({ roles: ["admin", "manager"] }), updateProgram);

router.route("/programs/:programId/fees")
  .get(getProgramFees)
  .post(isAuthorized({ roles: ["admin", "manager"] }), updateProgramFee);

router.get("/activity-logs", isAuthorized({ roles: ["admin", "manager"] }), getActivityLogs);

export default router;
