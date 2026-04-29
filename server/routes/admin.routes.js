import express from "express";
import { getAdminStats, getAdminProfile } from "../controllers/admin.controller.js";
import { requireAuth, isAuthorized } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", requireAuth, isAuthorized({ roles: ["admin", "manager"] }), getAdminStats);
router.get("/profile", requireAuth, isAuthorized({ roles: ["admin", "manager"] }), getAdminProfile);

export default router;
