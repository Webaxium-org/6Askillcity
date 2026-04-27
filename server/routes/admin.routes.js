import express from "express";
import { getAdminStats } from "../controllers/admin.controller.js";
import { requireAuth, isAuthorized } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", requireAuth, isAuthorized({ roles: ["admin"] }), getAdminStats);

export default router;
