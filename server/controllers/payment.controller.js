import Student from "../models/student.js";
import Payment from "../models/payment.js";
import PaymentSchedule from "../models/paymentSchedule.js";
import ServiceApplication from "../models/serviceApplication.js";
import createError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { sendToAdmins } from "../services/notification.service.js";

// ─────────────────────────────────────────────
// Get all eligible students (Management List)
// ─────────────────────────────────────────────
export const getManagementStudents = async (req, res, next) => {
  try {
    const match = { applicationStatus: "Eligible", deleted: { $ne: true } };
    if (req.user.userType === "partner") match.registeredBy = new mongoose.Types.ObjectId(req.user.userId);

    const students = await Student.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "student",
          as: "paymentDetails"
        }
      },
      {
        $addFields: {
          lastPaymentDate: { $max: "$paymentDetails.date" }
        }
      },
      {
        $lookup: {
          from: "universities",
          localField: "university",
          foreignField: "_id",
          as: "university"
        }
      },
      { $unwind: "$university" },
      {
        $lookup: {
          from: "programs",
          localField: "program",
          foreignField: "_id",
          as: "program"
        }
      },
      { $unwind: "$program" },
      {
        $lookup: {
          from: "programfees",
          localField: "programFee",
          foreignField: "_id",
          as: "programFee"
        }
      },
      { $unwind: { path: "$programFee", preserveNullAndEmptyArrays: true } },
      { $sort: { updatedAt: -1 } }
    ]);

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Record a payment
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// Record a payment
// ─────────────────────────────────────────────
export const recordPayment = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { amount, method, remarks } = req.body;
    const partnerId = req.user.userId;

    if (req.user.userType === "admin") {
      throw createError(403, "Admins are not allowed to record payments.");
    }

    if (!amount || amount <= 0) throw createError(400, "Invalid payment amount.");

    const student = await Student.findById(studentId).populate("programFee");
    if (!student) throw createError(404, "Student not found.");

    // Prevent overpayment (check against approved + pending payments)
    const totalFee = student.programFee?.totalFee || 0;
    const allPayments = await Payment.find({ student: studentId, approvalStatus: { $ne: "rejected" } });
    const totalRecorded = allPayments.reduce((acc, p) => acc + p.amount, 0);
    const remainingFee = totalFee - totalRecorded;

    if (Number(amount) > remainingFee) {
      throw createError(400, `Payment amount exceeds remaining fee. Maximum allowed: ₹${remainingFee.toLocaleString()}`);
    }

    // Handle receipt upload
    const receiptUrl = req.file ? req.file.location : undefined;

    // Create Payment record
    const payment = new Payment({
      student: studentId,
      partner: partnerId,
      amount: Number(amount),
      method: method || "Offline",
      remarks: remarks || "Direct Payment",
      transactionId: `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      receipt: receiptUrl,
      approvalStatus: "pending",
    });
    await payment.save();

    // NOTE: We do NOT update student.totalFeePaid here anymore.
    // It will be updated upon admin approval.

    await sendToAdmins({
      title: "New Payment for Verification",
      message: `A new payment of ₹${amount.toLocaleString()} for student ${student.name} requires verification.`,
      type: "payment_completed",
      relatedId: payment._id,
      link: "/dashboard/payment-management",
    });

    res.status(200).json({ success: true, message: "Payment submitted for verification.", data: payment });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Approve a payment (Admin Only)
// ─────────────────────────────────────────────
export const approvePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id).populate("student");
    if (!payment) throw createError(404, "Payment record not found.");

    if (payment.approvalStatus !== "pending") {
      throw createError(400, `Payment is already ${payment.approvalStatus}.`);
    }

    const student = await Student.findById(payment.student._id).populate("programFee");
    if (!student) throw createError(404, "Student not found.");

    // Update payment record
    payment.approvalStatus = "approved";
    payment.approvedBy = req.user.userId;
    payment.approvalDate = new Date();
    await payment.save();

    if (payment.type === "Course Fee") {
      // Update student totals
      student.totalFeePaid += payment.amount;
      const totalFee = student.programFee?.totalFee || 0;

      if (student.totalFeePaid >= totalFee) {
        student.paymentStatus = "Paid";
      } else if (student.totalFeePaid > 0) {
        student.paymentStatus = "Partially Paid";
      }
      await student.save();

      // Auto-delete schedules for "today" or previous pending ones that are now covered
      const startOfDay = new Date(payment.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(payment.date);
      endOfDay.setHours(23, 59, 59, 999);

      await PaymentSchedule.deleteMany({
        student: student._id,
        status: "Pending",
        dueDate: { $gte: startOfDay, $lte: endOfDay },
      });
    } else if (payment.type === "Documents & Services" && payment.serviceApplication) {
      // Update Service Application
      const application = await ServiceApplication.findById(payment.serviceApplication);
      if (application) {
        application.paidAmount += payment.amount;

        if (application.paidAmount >= application.feeAmount) {
          application.paymentStatus = "Paid";
          // Only advance status if full payment is done
          if (application.status === "Waiting for Payment") {
            application.status = "Pending Applications";
            application.pendingDate = new Date();
            application.history.push({
              status: "Pending Applications",
              updatedBy: req.user.userId,
              remarks: "Full payment confirmed via admin approval.",
            });
          }
        } else {
          application.paymentStatus = "Partially Paid";
          application.history.push({
            status: application.status,
            updatedBy: req.user.userId,
            remarks: `Partial payment of ₹${payment.amount} approved by admin.`,
          });
        }
        await application.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment approved successfully.",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Reject a payment (Admin Only)
// ─────────────────────────────────────────────
export const rejectPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) throw createError(400, "Rejection reason is required.");

    const payment = await Payment.findById(id);
    if (!payment) throw createError(404, "Payment record not found.");

    if (payment.approvalStatus !== "pending") {
      throw createError(400, `Payment is already ${payment.approvalStatus}.`);
    }

    payment.approvalStatus = "rejected";
    payment.rejectedBy = req.user.userId;
    payment.rejectionDate = new Date();
    payment.rejectionReason = reason;
    await payment.save();

    res.status(200).json({ success: true, message: "Payment rejected.", data: payment });
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

    if (req.user.userType === "admin") {
      throw createError(403, "Admins are not allowed to set payment schedules.");
    }

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

    if (req.user.userType === "admin") {
      throw createError(403, "Admins are not allowed to delete schedules.");
    }

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

    const [recentPayments, upcomingSchedules, pendingPayments] = await Promise.all([
      Payment.find({ ...filter, approvalStatus: "approved" })
        .populate({
          path: "student",
          select: "name email university admissionPoint",
          populate: { path: "university", select: "name" }
        })
        .populate("partner", "name")
        .sort({ date: -1 })
        .limit(100),
      PaymentSchedule.find({ ...filter, status: "Pending" })
        .populate({
          path: "student",
          select: "name email university admissionPoint",
          populate: { path: "university", select: "name" }
        })
        .populate("partner", "name")
        .sort({ dueDate: 1 })
        .limit(100),
      req.user.userType === "admin" 
        ? Payment.find({ approvalStatus: "pending" })
            .populate({
              path: "student",
              select: "name email university admissionPoint",
              populate: { path: "university", select: "name" }
            })
            .populate("partner", "name centerName centerId")
            .sort({ createdAt: -1 })
        : []
    ]);

    res.status(200).json({
      success: true,
      data: {
        recentPayments,
        upcomingSchedules,
        pendingPayments
      }
    });
  } catch (error) {
    next(error);
  }
};
