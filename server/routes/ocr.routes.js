import express from "express";
import { scanCertificate } from "../controllers/ocr.controller.js";
import { requireAuth, isAuthenticated } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Professional OCR scanning endpoint
// Protected so only registered partners/admins can use it
router.post("/scan-certificate", requireAuth, isAuthenticated, upload.single("certificate"), scanCertificate);

export default router;
