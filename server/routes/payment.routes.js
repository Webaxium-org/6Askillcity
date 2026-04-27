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
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/students", getManagementStudents);
router.get("/global-stats", getGlobalPaymentStats);

router.route("/student/:studentId/payments")
  .get(getStudentPayments)
  .post(recordPayment);

router.route("/student/:studentId/schedules")
  .get(getStudentSchedules)
  .post(setSchedule);

router.delete("/schedules/:id", deleteSchedule);

export default router;
