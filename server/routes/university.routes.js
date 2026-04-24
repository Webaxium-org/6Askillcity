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

// All routes here require authentication and admin role
router.use(requireAuth);
router.use(isAuthorized({ roles: ["admin"] }));

router.route("/universities")
  .get(getUniversities)
  .post(createUniversity);

router.route("/universities/:id")
  .put(updateUniversity);

router.route("/programs")
  .get(getPrograms)
  .post(createProgram);

router.route("/programs/:id")
  .put(updateProgram);

router.route("/programs/:programId/fees")
  .get(getProgramFees)
  .post(updateProgramFee);

router.get("/activity-logs", getActivityLogs);

export default router;
