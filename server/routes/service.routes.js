import express from "express";
import {
  createServiceDefinition,
  getServiceDefinitions,
  updateServiceFee,
  updateServiceDefinition,
  applyForService,
  getServiceApplications,
  updateApplicationStatus,
  getServiceDashboardStats,
  recordServicePayment
} from "../controllers/service.controller.js";
import { requireAuth, isAuthorized } from "../middleware/auth.js";

const router = express.Router();

const adminOnly = isAuthorized({ roles: ["admin"] });
const staffOnly = isAuthorized({ roles: ["admin", "manager"] });
const partnerOnly = isAuthorized({ roles: ["partner", "admin"] });

// Stats & Overview
router.get("/dashboard-stats", requireAuth, staffOnly, getServiceDashboardStats);

// Definitions (The templates)
router.post("/definitions", requireAuth, adminOnly, createServiceDefinition);
router.get("/definitions", requireAuth, staffOnly, getServiceDefinitions);
router.put("/definitions/:id", requireAuth, adminOnly, updateServiceDefinition);
router.put("/definitions/:id/fee", requireAuth, adminOnly, updateServiceFee);

// Applications (Student specific records)
router.post("/apply", requireAuth, staffOnly, applyForService);
router.get("/applications", requireAuth, staffOnly, getServiceApplications);
router.put("/applications/:id/status", requireAuth, staffOnly, updateApplicationStatus);
router.put("/applications/:id/pay", requireAuth, partnerOnly, recordServicePayment);

export default router;
