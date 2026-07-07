import ServiceDefinition from "../models/serviceDefinition.js";
import ServiceFee from "../models/serviceFee.js";
import ServiceApplication from "../models/serviceApplication.js";
import Student from "../models/student.js";
import AdmissionPoint from "../models/admissionPoint.js";
import Payment from "../models/payment.js";
import PaymentIntent from "../models/paymentIntent.js";
import createError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Smart detection of Cashfree environment based on key prefix
const cleanAppId = process.env.CASHFREE_APP_ID?.trim().replace(
  /^["']|["']$/g,
  "",
);
const cleanSecretKey = process.env.CASHFREE_SECRET_KEY?.trim().replace(
  /^["']|["']$/g,
  "",
);

const isProdKey = cleanSecretKey?.startsWith("cfsk_ma_prod_");
const cashfreeEnvironment = isProdKey
  ? CFEnvironment.PRODUCTION
  : CFEnvironment.SANDBOX;

const cashfree = new Cashfree(cashfreeEnvironment, cleanAppId, cleanSecretKey);

cashfree.XApiVersion = "2023-08-01";

// ─────────────────────────────────────────────
// Service Definitions
// ─────────────────────────────────────────────

export const createServiceDefinition = async (req, res, next) => {
  try {
    const { title, description, currentFee, icon, documentType, categories } = req.body;

    const resolvedFee = Number(currentFee || 0);

    const service = new ServiceDefinition({
      title,
      description,
      currentFee: resolvedFee,
      icon,
      documentType,
      categories,
      createdBy: req.user.id
    });

    const feeRecord = new ServiceFee({
      service: service._id,
      amount: resolvedFee,
      updatedBy: req.user.id,
      remarks: "Initial fee setup"
    });

    await feeRecord.save();
    service.currentFeeRef = feeRecord._id;

    await service.save();
    // Reload to populate currentFeeRef if applicable
    const populatedService = await ServiceDefinition.findById(service._id).populate("currentFeeRef");

    res.status(201).json({
      success: true,
      data: populatedService || service
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
    const { title, description, icon, documentType, categories, currentFee } = req.body;

    const service = await ServiceDefinition.findById(id);
    if (!service) return next(createError(404, "Service not found"));

    service.title = title;
    service.description = description;
    service.icon = icon;
    service.documentType = documentType;
    service.categories = categories;

    const resolvedFee = Number(currentFee || 0);
    service.currentFee = resolvedFee;

    const lastFee = await ServiceFee.findOne({ service: id }).sort({ createdAt: -1 });
    if (!lastFee || Number(lastFee.amount) !== Number(resolvedFee)) {
      const feeRecord = new ServiceFee({
        service: id,
        amount: resolvedFee,
        updatedBy: req.user.id,
        remarks: "Fee updated during definition edit"
      });
      await feeRecord.save();
      service.currentFeeRef = feeRecord._id;
    }

    await service.save();
    const populatedService = await ServiceDefinition.findById(id).populate("currentFeeRef");

    res.status(200).json({
      success: true,
      data: populatedService || service
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
    const { studentId, serviceId, adminRemarks } = req.body;

    const [student, service] = await Promise.all([
      Student.findById(studentId),
      ServiceDefinition.findById(serviceId).populate("currentFeeRef")
    ]);

    if (!student) return next(createError(404, "Student not found"));
    if (!service) return next(createError(404, "Service not found"));

    if (req.user?.userType !== "partner" && req.user?.role !== "partner") {
      return next(createError(403, "Only partners are authorized to apply for student services."));
    }

    if (req.user?.userType === "partner" && student.registeredBy.toString() !== req.user.userId.toString()) {
      return next(createError(403, "You are not authorized to apply for this student"));
    }

    const resolvedFee = service.currentFee;
    const resolvedFeeRef = service.currentFeeRef?._id;

    const application = new ServiceApplication({
      student: studentId,
      service: serviceId,
      feeAmount: resolvedFee,
      feeRef: resolvedFeeRef,
      adminRemarks,
      createdBy: req.user.userId,
      createdByType: req.user.userType === "partner" ? "AdmissionPoint" : "User",
      history: [{
        status: "Pending Applications",
        updatedBy: req.user.userId,
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

    if (req.user?.userType === "partner") {
      const partnerStudentIds = await Student.find({ registeredBy: req.user.userId }).distinct("_id");
      if (studentId) {
        if (partnerStudentIds.map(id => id.toString()).includes(studentId.toString())) {
          query.student = studentId;
        } else {
          query.student = null;
        }
      } else {
        query.student = { $in: partnerStudentIds };
      }
    } else {
      if (studentId) query.student = studentId;
    }

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

    if (req.user?.userType === "partner" || req.user?.role === "partner") {
      return next(createError(403, "Partners are not authorized to update application status. Only platform administrators can advance fulfillment."));
    }

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

    if (req.user?.userType !== "partner" && req.user?.role !== "partner") {
      return next(createError(403, "Only partners can pay or record payments for student services."));
    }

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

    if (!receiptUrl) {
      return next(createError(400, "Receipt file is required for offline payments."));
    }

    if (!method) {
      return next(createError(400, "Payment method is required."));
    }

    if (!transactionId) {
      return next(createError(400, "Transaction ID is required."));
    }

    // Create Payment record
    const payment = new Payment({
      student: application.student._id,
      partner: partnerId,
      amount: payAmount,
      method: method,
      transactionId: transactionId,
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

export const recordBulkServicePayment = async (req, res, next) => {
  try {
    let { applicationIds, amount, method, transactionId, remarks } = req.body;
    
    if (applicationIds && !Array.isArray(applicationIds)) {
      applicationIds = [applicationIds];
    }

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return next(createError(400, "Application IDs array is required."));
    }

    if (req.user?.userType !== "partner" && req.user?.role !== "partner") {
      return next(createError(403, "Only partners can pay or record payments for student services."));
    }

    const applications = await ServiceApplication.find({ _id: { $in: applicationIds } }).populate("student");
    if (applications.length !== applicationIds.length) {
      return next(createError(404, "One or more applications not found."));
    }

    let totalRemaining = 0;
    for (const app of applications) {
      if (app.paymentStatus === "Paid") {
        return next(createError(400, `Application for ${app.student.name} is already fully paid.`));
      }
      totalRemaining += (app.feeAmount - (app.paidAmount || 0));
    }

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) return next(createError(400, "Invalid payment amount"));

    if (payAmount > totalRemaining) {
      return next(createError(400, `Payment exceeds total balance. Max allowed: ₹${totalRemaining}`));
    }

    const partnerId = req.user.userType === "partner" ? req.user.userId : applications[0].student.registeredBy;
    const receiptUrl = req.file ? req.file.location : undefined;

    if (!receiptUrl) {
      return next(createError(400, "Receipt file is required for offline payments."));
    }
    if (!method) {
      return next(createError(400, "Payment method is required."));
    }
    if (!transactionId) {
      return next(createError(400, "Transaction ID is required."));
    }

    const payment = new Payment({
      student: applications[0].student._id,
      partner: partnerId,
      amount: payAmount,
      method: method,
      transactionId: transactionId,
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      remarks: remarks || "Bulk payment of mandatory documents",
      type: "Documents & Services",
      serviceApplications: applicationIds,
      receipt: receiptUrl,
      approvalStatus: "pending"
    });

    await payment.save();

    const { sendToAdmins } = await import("../services/notification.service.js");
    await sendToAdmins({
      title: "New Bulk Service Payment Verification",
      message: `A bulk payment of ₹${payAmount.toLocaleString()} for ${applications.length} documents (Student: ${applications[0].student.name}) requires verification.`,
      type: "payment_completed",
      relatedId: payment._id,
      link: "/dashboard/payment-management",
    });

    res.status(200).json({
      success: true,
      message: "Bulk payment submitted for verification.",
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceDashboardStats = async (req, res, next) => {
  try {
    const isPartner = req.user?.userType === "partner";
    const partnerId = req.user?.userId;

    let query = {};
    let paymentMatch = { approvalStatus: "approved", type: "Documents & Services" };

    if (isPartner) {
      const partnerStudentIds = await Student.find({ registeredBy: partnerId }).distinct("_id");
      query.student = { $in: partnerStudentIds };
      paymentMatch.partner = partnerId;
    }

    const [totalApps, pendingApps, inProgressApps, totalRevenue] = await Promise.all([
      ServiceApplication.countDocuments(query),
      ServiceApplication.countDocuments({ ...query, status: "Pending Applications" }),
      ServiceApplication.countDocuments({ ...query, status: "Application On Progress" }),
      Payment.aggregate([
        { $match: paymentMatch },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    const recentApplications = await ServiceApplication.find(query)
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

// ─────────────────────────────────────────────
// Cashfree Order Creation for Services
// ─────────────────────────────────────────────
export const createServiceCashfreeOrder = async (req, res, next) => {
  try {
    const { id } = req.params; // Application ID
    const { amount, remarks } = req.body;
    if (req.user?.userType !== "partner" && req.user?.role !== "partner") {
      throw createError(403, "Only partners can pay or record payments for student services.");
    }

    const partnerId = req.user.userId;

    if (!amount || amount <= 0)
      throw createError(400, "Invalid payment amount.");

    const application = await ServiceApplication.findById(id).populate("student");
    if (!application) throw createError(404, "Application not found.");

    const remaining = application.feeAmount - application.paidAmount;
    if (Number(amount) > remaining) {
      throw createError(
        400,
        `Payment amount exceeds remaining balance. Maximum allowed: ₹${remaining.toLocaleString()}`,
      );
    }

    const orderId = `cfsvc_${uuidv4()}`;
    const intent = new PaymentIntent({
      provider: "cashfree",
      orderId,
      student: application.student._id,
      partner: partnerId,
      amount: Number(amount),
      remarks: remarks || `Payment for ${application.subCategory || "Service"}`,
      scope: "Service Fee",
      serviceApplication: application._id,
    });
    await intent.save();

    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: application.student._id.toString(),
        customer_phone: application.student.phone || "9999999999",
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/dashboard/documents-services?order_id={order_id}&payment_status={payment_status}`,
      },
    };

    cashfree
      .PGCreateOrder(request)
      .then((response) => {
        res.status(200).json({
          success: true,
          payment_session_id: response.data.payment_session_id,
          order_id: response.data.order_id,
        });
      })
      .catch((error) => {
        console.error("[Cashfree Error] Service order creation failed:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        PaymentIntent.updateOne(
          { provider: "cashfree", orderId },
          { $set: { status: "failed", gatewayData: error.response?.data || error.message } },
        ).catch(() => {});
        next(
          createError(
            500,
            error.response?.data?.message || "Failed to create Cashfree order",
          ),
        );
      });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Cashfree Payment Verification for Services
// ─────────────────────────────────────────────
export const verifyServiceCashfreePayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    cashfree
      .PGOrderFetchPayments(orderId)
      .then(async (response) => {
        const successfulPayment = response.data.find(
          (p) => p.payment_status === "SUCCESS",
        );

        const intent = await PaymentIntent.findOne({
          provider: "cashfree",
          orderId,
        }).populate("student");
        if (!intent) throw createError(404, "Payment session not found.");

        if (intent.status === "completed") {
          return res
            .status(200)
            .json({ success: true, message: "Already approved" });
        }

        if (successfulPayment) {
          const gatewayTransactionId = successfulPayment.cf_payment_id?.toString();
          if (gatewayTransactionId) {
            const existingPayment = await Payment.findOne({ transactionId: gatewayTransactionId });
            if (existingPayment) {
              intent.status = "completed";
              intent.payment = existingPayment._id;
              intent.gatewayData = successfulPayment;
              await intent.save();
              return res.status(200).json({ success: true, message: "Already approved" });
            }
          }

          const paymentRecord = new Payment({
            student: intent.student._id,
            partner: intent.partner,
            amount: Number(successfulPayment.payment_amount || intent.amount),
            method: successfulPayment.payment_group
              ? `Online - ${successfulPayment.payment_group.toUpperCase()}`
              : "Online",
            remarks: intent.remarks || "Cashfree Service Payment",
            type: "Documents & Services",
            serviceApplication: intent.serviceApplication,
            transactionId: gatewayTransactionId || `CF-${orderId}`,
            invoiceId: `INV-${Date.now().toString().slice(-6)}`,
            approvalStatus: "approved",
            approvedBy: req.user.userId,
            approvalDate: new Date(),
            gatewayData: successfulPayment,
          });
          await paymentRecord.save();

          intent.status = "completed";
          intent.payment = paymentRecord._id;
          intent.gatewayData = successfulPayment;
          await intent.save();

          // Update Service Application
          const application = await ServiceApplication.findById(
            paymentRecord.serviceApplication,
          );
          if (application) {
            application.paidAmount += paymentRecord.amount;

            if (application.paidAmount >= application.feeAmount) {
              application.paymentStatus = "Paid";
              // Only advance status if full payment is done
              if (application.status === "Waiting for Payment") {
                application.status = "Pending Applications";
                application.pendingDate = new Date();
                application.history.push({
                  status: "Pending Applications",
                  updatedBy: req.user.userId,
                  remarks: "Full payment confirmed via online gateway.",
                });
              }
            } else {
              application.paymentStatus = "Partially Paid";
              application.history.push({
                status: application.status,
                updatedBy: req.user.userId,
                remarks: `Partial payment of ₹${paymentRecord.amount} completed via online gateway.`,
              });
            }
            await application.save();
          }

          const { sendToAdmins } = await import("../services/notification.service.js");
          await sendToAdmins({
            title: "Online Service Payment Successful",
            message: `A payment of ₹${paymentRecord.amount.toLocaleString()} for ${application?.subCategory || "Service"} (Student: ${intent.student.name}) was completed via Cashfree.`,
            type: "payment_completed",
            relatedId: paymentRecord._id,
            link: "/dashboard/payment-management",
          });

          res
            .status(200)
            .json({ success: true, message: "Payment successful" });
        } else {
          intent.status = "failed";
          intent.gatewayData = response.data;
          await intent.save();
          res
            .status(400)
            .json({ success: false, message: "Payment not successful" });
        }
      })
      .catch((error) => {
        console.error("[Cashfree Error] Service payment verification failed:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        next(
          createError(
            500,
            error.response?.data?.message ||
              "Failed to verify Cashfree payment",
          ),
        );
      });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Bulk Cashfree Order Creation for Services
// ─────────────────────────────────────────────
export const createBulkServiceCashfreeOrder = async (req, res, next) => {
  try {
    const { applicationIds, remarks } = req.body;
    if (req.user?.userType !== "partner" && req.user?.role !== "partner") {
      throw createError(403, "Only partners can pay or record payments for student services.");
    }

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      throw createError(400, "Invalid application IDs.");
    }

    const partnerId = req.user.userId;
    let totalAmount = 0;
    let studentId = null;

    const applications = await ServiceApplication.find({ _id: { $in: applicationIds } }).populate("student");
    if (applications.length !== applicationIds.length) {
      throw createError(404, "One or more applications not found.");
    }

    for (const app of applications) {
      if (!studentId) studentId = app.student._id;
      else if (studentId.toString() !== app.student._id.toString()) {
        throw createError(400, "All applications must belong to the same student.");
      }
      
      const remaining = app.feeAmount - (app.paidAmount || 0);
      if (remaining <= 0) {
        throw createError(400, `Application for ${app.subCategory || "Service"} is already fully paid.`);
      }
      totalAmount += remaining;
    }

    const orderId = `cfsvcb_${uuidv4()}`;
    const intent = new PaymentIntent({
      provider: "cashfree",
      orderId,
      student: studentId,
      partner: partnerId,
      amount: totalAmount,
      remarks: remarks || `Bulk payment for ${applications.length} services`,
      scope: "Bulk Service Fee",
      serviceApplications: applicationIds,
    });
    await intent.save();

    const request = {
      order_amount: totalAmount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: studentId.toString(),
        customer_phone: applications[0].student.phone || "9999999999",
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/dashboard/documents-services?order_id={order_id}&payment_status={payment_status}&type=bulk`,
      },
    };

    cashfree
      .PGCreateOrder(request)
      .then((response) => {
        res.status(200).json({
          success: true,
          payment_session_id: response.data.payment_session_id,
          order_id: response.data.order_id,
        });
      })
      .catch((error) => {
        console.error("[Cashfree Error] Bulk service order creation failed:", {
          status: error.response?.status,
          data: error.response?.data,
        });
        PaymentIntent.updateOne(
          { provider: "cashfree", orderId },
          { $set: { status: "failed", gatewayData: error.response?.data || error.message } },
        ).catch(() => {});
        next(createError(500, error.response?.data?.message || "Failed to create Cashfree order"));
      });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Bulk Cashfree Verification
// ─────────────────────────────────────────────
export const verifyBulkServiceCashfreePayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    cashfree
      .PGOrderFetchPayments(orderId)
      .then(async (response) => {
        const successfulPayment = response.data.find(
          (p) => p.payment_status === "SUCCESS",
        );

        const intent = await PaymentIntent.findOne({
          provider: "cashfree",
          orderId,
        }).populate("student");
        if (!intent) throw createError(404, "Payment session not found.");

        if (intent.status === "completed") {
          return res.status(200).json({ success: true, message: "Already approved" });
        }

        if (successfulPayment) {
          const gatewayTransactionId = successfulPayment.cf_payment_id?.toString();
          if (gatewayTransactionId) {
            const existingPayment = await Payment.findOne({ transactionId: gatewayTransactionId });
            if (existingPayment) {
              intent.status = "completed";
              intent.payment = existingPayment._id;
              intent.gatewayData = successfulPayment;
              await intent.save();
              return res.status(200).json({ success: true, message: "Already approved" });
            }
          }

          const paymentRecord = new Payment({
            student: intent.student._id,
            partner: intent.partner,
            amount: Number(successfulPayment.payment_amount || intent.amount),
            method: successfulPayment.payment_group
              ? `Online - ${successfulPayment.payment_group.toUpperCase()}`
              : "Online",
            remarks: intent.remarks || "Bulk Cashfree Service Payment",
            type: "Documents & Services",
            serviceApplications: intent.serviceApplications,
            transactionId: gatewayTransactionId || `CF-${orderId}`,
            invoiceId: `INV-${Date.now().toString().slice(-6)}`,
            approvalStatus: "approved",
            approvedBy: req.user.userId,
            approvalDate: new Date(),
            gatewayData: successfulPayment,
          });
          await paymentRecord.save();

          intent.status = "completed";
          intent.payment = paymentRecord._id;
          intent.gatewayData = successfulPayment;
          await intent.save();

          // Update Service Applications
          if (paymentRecord.serviceApplications && paymentRecord.serviceApplications.length > 0) {
            const applications = await ServiceApplication.find({ _id: { $in: paymentRecord.serviceApplications } });
            for (const application of applications) {
              const remaining = application.feeAmount - (application.paidAmount || 0);
              application.paidAmount += remaining; // Assumes full payment is made

              application.paymentStatus = "Paid";
              if (application.status === "Waiting for Payment") {
                application.status = "Pending Applications";
                application.pendingDate = new Date();
                application.history.push({
                  status: "Pending Applications",
                  updatedBy: req.user.userId,
                  remarks: "Full payment confirmed via bulk online gateway.",
                });
              } else {
                application.history.push({
                  status: application.status,
                  updatedBy: req.user.userId,
                  remarks: `Remaining payment completed via bulk online gateway.`,
                });
              }
              await application.save();
            }
          }

          const { sendToAdmins } = await import("../services/notification.service.js");
          await sendToAdmins({
            title: "Bulk Online Service Payment Successful",
            message: `A bulk payment of ₹${paymentRecord.amount.toLocaleString()} for ${paymentRecord.serviceApplications.length} services (Student: ${intent.student.name}) was completed via Cashfree.`,
            type: "payment_completed",
            relatedId: paymentRecord._id,
            link: "/dashboard/payment-management",
          });

          res.status(200).json({ success: true, message: "Payment successful" });
        } else {
          intent.status = "failed";
          intent.gatewayData = response.data;
          await intent.save();
          res.status(400).json({ success: false, message: "Payment not successful" });
        }
      })
      .catch((error) => {
        console.error("[Cashfree Error] Bulk service payment verification failed:", {
          status: error.response?.status,
          message: error.message,
        });
        next(createError(500, error.response?.data?.message || "Failed to verify Cashfree payment"));
      });
  } catch (error) {
    next(error);
  }
};
