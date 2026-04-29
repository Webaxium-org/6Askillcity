import express from "express";
import { 
  getManagementStudents, 
  recordPayment, 
  getStudentPayments,
  setSchedule,
  deleteSchedule,
  getStudentSchedules,
  getGlobalPaymentStats
} from "../controllers/payment.controller.js";
import { requireAuth, isAuthorized } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/students", isAuthorized({ roles: ["admin", "partner", "manager"] }), getManagementStudents);
router.get("/global-stats", isAuthorized({ roles: ["admin", "partner"] }), getGlobalPaymentStats);

router.route("/student/:studentId/payments")
  .get(isAuthorized({ roles: ["admin", "partner", "manager"] }), getStudentPayments)
  .post(isAuthorized({ roles: ["admin", "partner"] }), recordPayment);

router.route("/student/:studentId/schedules")
  .get(isAuthorized({ roles: ["admin", "partner", "manager"] }), getStudentSchedules)
  .post(isAuthorized({ roles: ["admin", "partner"] }), setSchedule);

router.delete("/schedules/:id", isAuthorized({ roles: ["admin", "partner"] }), deleteSchedule);

export default router;
