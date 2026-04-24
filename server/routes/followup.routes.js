import express from "express";
import { requireAuth, isAuthorized } from "../middleware/auth.js";
import {
  addFollowup,
  getFollowups,
  deleteFollowup,
} from "../controllers/followup.controller.js";

const router = express.Router();

router.use(requireAuth);

// Both partners and admins can log and view followups
router.post(
  "/:studentId",
  isAuthorized({ types: ["partner", "admin"] }),
  addFollowup
);

router.get(
  "/:studentId",
  isAuthorized({ types: ["partner", "admin"] }),
  getFollowups
);

// Delete: author or admin
router.delete(
  "/entry/:followupId",
  isAuthorized({ types: ["partner", "admin"] }),
  deleteFollowup
);

export default router;
