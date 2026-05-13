import express from "express";
import {
  getManagementStudents,
  recordPayment,
  getStudentPayments,
  setSchedule,
  deleteSchedule,
  getStudentSchedules,
  getGlobalPaymentStats,
  approvePayment,
  rejectPayment,
} from "../controllers/payment.controller.js";
import { requireAuth, isAuthorized } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(requireAuth);

router.get(
  "/students",
  isAuthorized({ roles: ["admin", "partner", "manager"] }),
  getManagementStudents,
);
router.get(
  "/global-stats",
  isAuthorized({ roles: ["admin", "partner"] }),
  getGlobalPaymentStats,
);

router
  .route("/student/:studentId/payments")
  .get(
    isAuthorized({ roles: ["admin", "partner", "manager"] }),
    getStudentPayments,
  )
  .post(
    isAuthorized({ roles: ["partner"] }),
    upload.single("receipt"),
    recordPayment,
  );

router
  .route("/student/:studentId/schedules")
  .get(
    isAuthorized({ roles: ["admin", "partner", "manager"] }),
    getStudentSchedules,
  )
  .post(isAuthorized({ roles: ["admin", "partner"] }), setSchedule);

router.delete(
  "/schedules/:id",
  isAuthorized({ roles: ["admin", "partner"] }),
  deleteSchedule,
);

// Approval Routes
router.post("/:id/approve", isAuthorized({ roles: ["admin"] }), approvePayment);
router.post("/:id/reject", isAuthorized({ roles: ["admin"] }), rejectPayment);

export default router;
