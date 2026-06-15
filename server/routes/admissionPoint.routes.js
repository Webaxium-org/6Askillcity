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
  submitPartnerInquiry,
  createInspectionFeeOrder,
  verifyInspectionFeePayment,
  completePartnerInspection,
  recordOfflineOnboardingFee,
  uploadOfficeVideo,
  rejectPartnerInspection,
  renewPartnerAuthorisation,
} from "../controllers/admissionPoint.controller.js";
import { getPartnerDashboardStats, getPermittedCourses } from "../controllers/partner.controller.js";
import { isAuthorized, requireAuth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/register", preparePartnerId, uploadAdmissionFiles, createAdmissionPoint);
router.post("/partner-inquiry", submitPartnerInquiry);

router.get("/profile/me", requireAuth, isAuthorized({ types: ["partner"] }), getMyPartnerProfile);
router.get("/stats", requireAuth, isAuthorized({ types: ["partner"] }), getPartnerDashboardStats);
router.get("/permitted-courses", requireAuth, isAuthorized({ types: ["partner"] }), getPermittedCourses);

// Partner Onboarding Fee Routes
router.post("/onboarding/fee-order", requireAuth, isAuthorized({ types: ["partner"] }), createInspectionFeeOrder);
router.post("/onboarding/verify-fee", requireAuth, isAuthorized({ types: ["partner"] }), verifyInspectionFeePayment);
router.post("/onboarding/offline-fee", requireAuth, isAuthorized({ types: ["admin", "partner"] }), upload.single("receipt"), recordOfflineOnboardingFee);
router.post("/onboarding/office-video", requireAuth, isAuthorized({ types: ["partner"] }), uploadAdmissionFiles, uploadOfficeVideo);
router.put("/:id/reject-inspection", requireAuth, isAuthorized({ types: ["admin"] }), rejectPartnerInspection);

router.use(requireAuth, isAuthorized({ types: ["admin"] }));

router.get("/", getAllAdmissionPoints);
router.get("/pending", getPendingAdmissionPoints);
router.get("/approved", getApprovedAdmissionPoints);
router.get("/:id", getAdmissionPointById);
router.patch("/:id/status", updateAdmissionPointStatus);
router.patch("/:id/toggle-active", toggleAdmissionPointActiveStatus);
router.post("/:id/generate-token", generateAdminAccessToken);
router.patch("/:id/complete-inspection", completePartnerInspection);
router.post("/:id/renew-authorisation", renewPartnerAuthorisation);

// Permission routes
router.get("/:partnerId/permissions", getPartnerPermissions);
router.post("/permissions", addPartnerPermission);
router.delete("/permissions/:id", removePartnerPermission);

export default router;
