import ServiceDefinition from "../models/serviceDefinition.js";
import ServiceFee from "../models/serviceFee.js";
import ServiceApplication from "../models/serviceApplication.js";
import Student from "../models/student.js";
import AdmissionPoint from "../models/admissionPoint.js";
import Payment from "../models/payment.js";
import createError from "http-errors";
import { v4 as uuidv4 } from "uuid";

// ─────────────────────────────────────────────
// Service Definitions
// ─────────────────────────────────────────────

export const createServiceDefinition = async (req, res, next) => {
  try {
    const { title, description, subCategories, currentFee, icon } = req.body;

    const service = new ServiceDefinition({
      title,
      description,
      subCategories,
      currentFee,
      icon,
      createdBy: req.user.id
    });

    const feeRecord = new ServiceFee({
      service: service._id,
      amount: currentFee,
      updatedBy: req.user.id,
      remarks: "Initial fee setup"
    });

    service.currentFeeRef = feeRecord._id;

    await Promise.all([service.save(), feeRecord.save()]);

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceDefinitions = async (req, res, next) => {
  try {
    const services = await ServiceDefinition.find({ status: "Active" }).populate("currentFeeRef");
    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

export const updateServiceFee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, remarks } = req.body;

    const service = await ServiceDefinition.findById(id);
    if (!service) return next(createError(404, "Service not found"));

    const newFee = new ServiceFee({
      service: id,
      amount,
      updatedBy: req.user.id,
      remarks: remarks || "Fee updated"
    });

    service.currentFee = amount;
    service.currentFeeRef = newFee._id;

    await Promise.all([service.save(), newFee.save()]);

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

export const updateServiceDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, subCategories, icon } = req.body;

    const service = await ServiceDefinition.findByIdAndUpdate(
      id,
      { title, description, subCategories, icon },
      { new: true, runValidators: true }
    );

    if (!service) return next(createError(404, "Service not found"));

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Service Applications
// ─────────────────────────────────────────────

export const applyForService = async (req, res, next) => {
  try {
    const { studentId, serviceId, subCategory, adminRemarks } = req.body;

    const [student, service] = await Promise.all([
      Student.findById(studentId),
      ServiceDefinition.findById(serviceId).populate("currentFeeRef")
    ]);

    if (!student) return next(createError(404, "Student not found"));
    if (!service) return next(createError(404, "Service not found"));

    const application = new ServiceApplication({
      student: studentId,
      service: serviceId,
      subCategory,
      feeAmount: service.currentFee,
      feeRef: service.currentFeeRef._id,
      adminRemarks,
      history: [{
        status: "Pending Applications",
        updatedBy: req.user.id,
        remarks: "Application initialized"
      }]
    });

    await application.save();

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceApplications = async (req, res, next) => {
  try {
    const { status, studentId, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (studentId) query.student = studentId;

    const applications = await ServiceApplication.find(query)
      .populate({
        path: "student",
        select: "name email phone registeredBy",
        populate: {
          path: "registeredBy",
          select: "centerName",
          model: "AdmissionPoint"
        }
      })
      .populate("service", "title")
      .sort("-createdAt");

    // Simple search filtering (can be optimized with aggregation)
    let filtered = applications;
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = applications.filter(app => 
        app.student.name.toLowerCase().includes(lowerSearch) ||
        app.service.title.toLowerCase().includes(lowerSearch) ||
        app.subCategory.toLowerCase().includes(lowerSearch)
      );
    }

    res.status(200).json({
      success: true,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const application = await ServiceApplication.findById(id);
    if (!application) return next(createError(404, "Application not found"));

    // Enforce status order
    const statusOrder = [
      "Waiting for Payment",
      "Pending Applications",
      "Application On Progress",
      "Documents Received",
      "Documents Sent Courier"
    ];

    const currentIndex = statusOrder.indexOf(application.status);
    const newIndex = statusOrder.indexOf(status);

    if (newIndex <= currentIndex) {
      return next(createError(400, "Cannot revert to a previous status or set the same status"));
    }

    // Set corresponding date
    if (status === "Pending Applications") application.pendingDate = new Date();
    if (status === "Application On Progress") application.processingDate = new Date();
    if (status === "Documents Received") application.receivedDate = new Date();
    if (status === "Documents Sent Courier") application.sentDate = new Date();

    application.status = status;
    application.history.push({
      status,
      updatedBy: req.user.id,
      remarks: remarks || `Status updated to ${status}`
    });

    await application.save();

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

export const recordServicePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, method, transactionId, remarks } = req.body;

    const application = await ServiceApplication.findById(id).populate("student");
    if (!application) return next(createError(404, "Application not found"));

    if (application.paymentStatus === "Paid") {
      return next(createError(400, "Application is already fully paid"));
    }

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) return next(createError(400, "Invalid payment amount"));

    const remaining = application.feeAmount - application.paidAmount;
    if (payAmount > remaining) {
      return next(createError(400, `Payment exceeds balance. Max allowed: ₹${remaining}`));
    }

    // Determine partner ID
    const partnerId = req.user.userType === "partner" ? req.user.userId : application.student.registeredBy;

    // Handle receipt upload
    const receiptUrl = req.file ? req.file.location : undefined;

    // Create Payment record
    const payment = new Payment({
      student: application.student._id,
      partner: partnerId,
      amount: payAmount,
      method: method || "Offline",
      transactionId: transactionId || `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      remarks: remarks || `Payment for ${application.subCategory || "Service"}`,
      type: "Documents & Services",
      serviceApplication: application._id,
      receipt: receiptUrl,
      approvalStatus: "pending"
    });

    await payment.save();

    // Notify admins
    const { sendToAdmins } = await import("../services/notification.service.js");
    await sendToAdmins({
      title: "New Service Payment Verification",
      message: `A payment of ₹${payAmount.toLocaleString()} for ${application.subCategory || "Service"} (Student: ${application.student.name}) requires verification.`,
      type: "payment_completed",
      relatedId: payment._id,
      link: "/dashboard/payment-management",
    });

    // NOTE: We do NOT update application.paidAmount here anymore.
    // It will be updated upon admin approval in payment.controller.js.

    res.status(200).json({
      success: true,
      message: "Payment submitted for verification.",
      data: application
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceDashboardStats = async (req, res, next) => {
  try {
    const [totalApps, pendingApps, inProgressApps, totalRevenue] = await Promise.all([
      ServiceApplication.countDocuments(),
      ServiceApplication.countDocuments({ status: "Pending Applications" }),
      ServiceApplication.countDocuments({ status: "Application On Progress" }),
      Payment.aggregate([
        { $match: { approvalStatus: "approved", type: "Documents & Services" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    const recentApplications = await ServiceApplication.find()
      .populate("student", "name")
      .populate("service", "title")
      .sort("-createdAt")
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalApps,
          pendingApps,
          inProgressApps,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
};
