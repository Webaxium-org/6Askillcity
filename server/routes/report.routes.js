import express from "express";
import {
  getAcademicReport,
  getAdmissionReport,
  getDocumentReport,
  getFinancialReport,
  getFeeWiseReport,
} from "../controllers/report.controller.js";
import { requireAuth, isAuthorized } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.use(isAuthorized({ roles: ["admin"] }));

router.get("/academic", getAcademicReport);
router.get("/admission", getAdmissionReport);
router.get("/documents", getDocumentReport);
router.get("/financial", getFinancialReport);
router.get("/fee-wise", getFeeWiseReport);

export default router;
