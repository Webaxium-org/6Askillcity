import Student from "../models/student.js";
import Payment from "../models/payment.js";
import PaymentSchedule from "../models/paymentSchedule.js";
import createError from "http-errors";
import { v4 as uuidv4 } from "uuid";

// ─────────────────────────────────────────────
// Get all eligible students (Management List)
// ─────────────────────────────────────────────
export const getManagementStudents = async (req, res, next) => {
  try {
    const filter = { applicationStatus: "Eligible", deleted: { $ne: true } };
    if (req.user.userType === "partner") filter.registeredBy = req.user.userId;

    const students = await Student.find(filter)
      .populate("university", "name")
      .populate("program", "name")
      .populate("programFee")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Record a payment
// ─────────────────────────────────────────────
export const recordPayment = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { amount, method, remarks } = req.body;
    const partnerId = req.user.userId;

    if (!amount || amount <= 0) throw createError(400, "Invalid payment amount.");

    const student = await Student.findById(studentId).populate("programFee");
    if (!student) throw createError(404, "Student not found.");

    // Prevent overpayment
    const totalFee = student.programFee?.totalFee || 0;
    const remainingFee = totalFee - student.totalFeePaid;

    if (Number(amount) > remainingFee) {
      throw createError(400, `Payment amount exceeds remaining fee. Maximum allowed: ₹${remainingFee.toLocaleString()}`);
    }

    // Create Payment record
    const payment = new Payment({
      student: studentId,
      partner: partnerId,
      amount: Number(amount),
      method: method || "Offline",
      remarks: remarks || "Direct Payment",
      transactionId: `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
    });
    await payment.save();

    // Update student summary
    student.totalFeePaid += Number(amount);
    if (student.totalFeePaid >= totalFee) {
      student.paymentStatus = "Paid";
    } else if (student.totalFeePaid > 0) {
      student.paymentStatus = "Partially Paid";
    }
    await student.save();

    // Auto-delete schedules for "today"
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    await PaymentSchedule.deleteMany({
      student: studentId,
      status: "Pending",
      dueDate: { $gte: startOfDay, $lte: endOfDay }
    });

    res.status(200).json({ success: true, message: "Payment recorded successfully.", data: payment });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Get payment history for a student
// ─────────────────────────────────────────────
export const getStudentPayments = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const payments = await Payment.find({ student: studentId }).sort({ date: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Manage Schedules
// ─────────────────────────────────────────────
export const setSchedule = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { schedule } = req.body; // Array of { dueDate, amount, description }
    const partnerId = req.user.userId;

    if (!Array.isArray(schedule)) throw createError(400, "Invalid schedule data.");

    // Remove old pending schedules for this student? Or just add new ones?
    // User wants to "delete" too. Let's just replace for now or handle specific adds.
    // For simplicity, we'll replace the pending ones.
    await PaymentSchedule.deleteMany({ student: studentId, status: "Pending" });

    const newSchedules = schedule.map(item => ({
      ...item,
      student: studentId,
      partner: partnerId,
      status: "Pending"
    }));

    const savedSchedules = await PaymentSchedule.insertMany(newSchedules);

    res.status(200).json({ success: true, message: "Payment schedule updated.", data: savedSchedules });
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await PaymentSchedule.findById(id);
    if (!schedule) throw createError(404, "Schedule not found.");
    
    // Only allow deletion if pending
    if (schedule.status !== "Pending") throw createError(400, "Cannot delete a paid or cancelled schedule.");

    await PaymentSchedule.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Schedule deleted." });
  } catch (error) {
    next(error);
  }
};

export const getStudentSchedules = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const schedules = await PaymentSchedule.find({ student: studentId }).sort({ dueDate: 1 });
    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Global Payment Management
// ─────────────────────────────────────────────
export const getGlobalPaymentStats = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.userType === "partner") filter.partner = req.user.userId;

    const [recentPayments, upcomingSchedules] = await Promise.all([
      Payment.find(filter).populate("student", "name email").sort({ date: -1 }).limit(50),
      PaymentSchedule.find({ ...filter, status: "Pending" }).populate("student", "name email").sort({ dueDate: 1 }).limit(50)
    ]);

    res.status(200).json({
      success: true,
      data: {
        recentPayments,
        upcomingSchedules
      }
    });
  } catch (error) {
    next(error);
  }
};
