import express from "express";
import {
  createAdmissionPoint,
  uploadAdmissionFiles,
  getPendingAdmissionPoints,
  updateAdmissionPointStatus,
  getApprovedAdmissionPoints,
  getAllAdmissionPoints,
  getAdmissionPointById,
  toggleAdmissionPointActiveStatus,
  getPartnerPermissions,
  addPartnerPermission,
  removePartnerPermission,
  getMyPartnerProfile,
  generateAdminAccessToken,
  preparePartnerId,
} from "../controllers/admissionPoint.controller.js";
import { getPartnerDashboardStats, getPermittedCourses } from "../controllers/partner.controller.js";
import { isAuthorized, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", preparePartnerId, uploadAdmissionFiles, createAdmissionPoint);

router.get("/profile/me", requireAuth, isAuthorized({ types: ["partner"] }), getMyPartnerProfile);
router.get("/stats", requireAuth, isAuthorized({ types: ["partner"] }), getPartnerDashboardStats);
router.get("/permitted-courses", requireAuth, isAuthorized({ types: ["partner"] }), getPermittedCourses);

router.use(requireAuth, isAuthorized({ types: ["admin"] }));

router.get("/", getAllAdmissionPoints);
router.get("/pending", getPendingAdmissionPoints);
router.get("/approved", getApprovedAdmissionPoints);
router.get("/:id", getAdmissionPointById);
router.patch("/:id/status", updateAdmissionPointStatus);
router.patch("/:id/toggle-active", toggleAdmissionPointActiveStatus);
router.post("/:id/generate-token", generateAdminAccessToken);

// Permission routes
router.get("/:partnerId/permissions", getPartnerPermissions);
router.post("/permissions", addPartnerPermission);
router.delete("/permissions/:id", removePartnerPermission);

export default router;
