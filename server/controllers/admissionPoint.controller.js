import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { s3, bucketName } from "../utils/s3Config.js";
import { generateStrongPassword } from "../helper/index.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateCertificatePDF } from "../utils/generateCertificatePDF.js";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Smart detection of Cashfree environment based on key prefix
const cleanAppId = process.env.CASHFREE_APP_ID?.trim().replace(/"/g, "") || "";
const cleanSecretKey = process.env.CASHFREE_SECRET_KEY?.trim().replace(/"/g, "") || "";
const isProdKey = cleanAppId.startsWith("PROD") || cleanSecretKey.startsWith("cfsk_ma_prod");
const cashfreeEnvironment = isProdKey ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

const cashfree = new Cashfree(cashfreeEnvironment, cleanAppId, cleanSecretKey);
cashfree.XApiVersion = "2023-08-01";

// S3 Storage Configuration
const storage = multerS3({
  s3: s3,
  bucket: bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const partnerId = req.partnerId || req.user?.userId || "unknown";
    cb(null, `partners/${partnerId}/${file.fieldname}-${uuidv4()}${ext}`);
  },
});

const uploadParams = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB per file limit to support large videos
}).any(); // Allow any field names for flexibility

import AdmissionPoint from "../models/admissionPoint.js";
import AuthorisationLetter from "../models/authorisationLetter.js";
import ActivityLog from "../models/activityLog.js";
import PartnerPermission from "../models/partnerPermission.js";
import ProgramFee from "../models/programFee.js";
import createError from "http-errors";
import Branch from "../models/branch.js";
import Program from "../models/program.js";
import { sendToAdmins } from "../services/notification.service.js";

// Helper to log activity
const logActivity = async (
  action,
  details,
  performedBy,
  targetType,
  targetId,
) => {
  try {
    await ActivityLog.create({
      action,
      details,
      performedBy,
      targetType,
      targetId,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const uploadAdmissionFiles = uploadParams;

// Middleware to prepare partner ID before upload
export const preparePartnerId = (req, res, next) => {
  // If editing an existing partner, use their ID from params
  if (req.params.id) {
    req.partnerId = req.params.id;
  } else if (req.params.partnerId) {
    req.partnerId = req.params.partnerId;
  } else {
    // For new registrations, generate a new ID
    req.partnerId = new mongoose.Types.ObjectId();
  }
  next();
};

export const createAdmissionPoint = async (req, res, next) => {
  try {
    const data = req.body;

    // Check if email already exists
    const existing = await AdmissionPoint.findOne({
      licenseeEmail: data.licenseeEmail,
    });
    if (existing) {
      throw createError(
        400,
        "An application point with this email is already registered.",
      );
    }

    // Process uploaded documents
    const documents = {
      licenseePhoto: [],
      licenseeAadharCard: [],
      businessLicense: [],
      ownershipRentalAgreement: [],
      officePhotos: [],
    };

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (documents.hasOwnProperty(file.fieldname)) {
          documents[file.fieldname].push(file.location); // S3 URL
        }
      });
    }

    // Format structure dynamically according to model
    const admissionPoint = new AdmissionPoint({
      _id: req.partnerId, // Use the pre-generated ID
      centerName: data.centerName,
      licenseeName: data.licenseeName,
      licenseeEmail: data.licenseeEmail,
      licenseeContactNumber: data.contactPersonPhone || "N/A", // Keep fallback if not in form

      contactPerson: {
        name: data.contactPersonName,
        phone: data.contactPersonPhone,
        email: data.contactPersonEmail || data.licenseeEmail, // Fallback
      },

      references: [
        {
          name: data.localRefName1,
          mobileNumber1: data.localRefMobile1,
        },
        {
          name: data.localRefName2,
          mobileNumber1: data.localRefMobile2, // Note: mobileNumber1 used for both in schema/request sometimes
        },
      ],

      location: {
        address: data.centerAddress,
        city: data.city,
        state: data.state,
        country: data.country,
        pincode: data.pincode,
      },

      documents,
    });

    await admissionPoint.save();

    await sendToAdmins({
      title: "New Admission Point Registration",
      message: `${admissionPoint.centerName} has applied to become a partner.`,
      type: "new_partner_application",
      relatedId: admissionPoint._id,
      link: `/dashboard/partner-management`
    });

    // Send email to the licensee email
    try {
      const subject = "6A Skillcity - Admission Point Registration Received";
      const message = `Dear ${admissionPoint.licenseeName},\n\nThank you for submitting your Admission Point Registration application for ${admissionPoint.centerName}.\n\nYour application has been received and is currently under review by our administration team. We will notify you as soon as the review process is complete.\n\nBest regards,\n6A Skillcity Administration`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e3a8a; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">6A Skillcity</h2>
            <p style="color: #6b7280; font-size: 13px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Partner Portal</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; border-radius: 12px; color: #ffffff; margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">Application Received</h3>
            <p style="margin: 0; font-size: 15px; opacity: 0.9; line-height: 1.5;">Dear ${admissionPoint.licenseeName || 'Partner'}, thank you for submitting your Admission Point Registration application.</p>
          </div>

          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
            Your application for <strong>${admissionPoint.centerName}</strong> has been successfully received and is currently under review by our administration team.
          </p>

          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
            We will notify you via email as soon as the review process is complete.
          </p>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} 6A Skillcity. All rights reserved.</p>
          </div>
        </div>
      `;

      await sendEmail({
        email: admissionPoint.licenseeEmail,
        subject,
        message,
        html,
      });
    } catch (err) {
      console.error("Failed to send registration receipt email:", err);
    }

    res.status(201).json({
      success: true,
      message:
        "Admission point registered successfully. Our team will review your application soon.",
      data: admissionPoint,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingAdmissionPoints = async (req, res, next) => {
  try {
    const admissionPoints = await AdmissionPoint.find({
      status: "pending",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: admissionPoints,
    });
  } catch (error) {
    next(error);
  }
};

export const getApprovedAdmissionPoints = async (req, res, next) => {
  try {
    const admissionPoints = await AdmissionPoint.find({
      status: "approved",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: admissionPoints,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdmissionPointStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      throw createError(400, "Invalid status value");
    }

    let updateData = { status };
    let plainPassword = null;

    if (status === "approved") {
      plainPassword = generateStrongPassword();

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      updateData.password = hashedPassword;
      updateData.onboardingState = "fee_pending";
    }

    const admissionPoint = await AdmissionPoint.findByIdAndUpdate(
      id,
      {
        ...updateData,
        $push: {
          history: {
            status,
            date: new Date(),
            // actionBy: req.user.id,
          },
        },
      },

      { new: true, runValidators: true },
    );

    if (!admissionPoint) {
      throw createError(404, "Admission point not found");
    }

    // Send email with credentials if approved
    if (status === "approved" && plainPassword) {
      const subject = "6A Skillcity - Partnership Application Approved (Authorisation Is on Review)";
      const message = `Dear ${admissionPoint.licenseeName},\n\nCongratulations! Your application to become an Admission Partner with 6A Skillcity has been approved.\n\nYour account status is now 'Authorisation Is on Review'.\n\nLogin credentials:\nUsername (Email): ${admissionPoint.licenseeEmail}\nPassword: ${plainPassword}\n\nPlease proceed to complete your onboarding steps on the partner dashboard:\n1. Pay the Inspection Fee.\n2. Complete the Online / Physical Inspection.\n\nPortal: ${process.env.CLIENT_URL || "http://localhost:5173"}\n\nBest regards,\n6A Skillcity Administration`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e3a8a; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">6A Skillcity</h2>
            <p style="color: #6b7280; font-size: 13px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Partner Portal</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; border-radius: 12px; color: #ffffff; margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700;">Application Approved!</h3>
            <p style="margin: 0; font-size: 15px; opacity: 0.9; line-height: 1.5;">Dear ${admissionPoint.licenseeName || 'Partner'}, your application has been successfully reviewed. Your onboarding protocol is now initialized under: <strong>Authorisation Is on Review</strong>.</p>
          </div>

          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
            To access your partner dashboard, add students, and register applications, please log in to the Partner Portal using the official credentials generated for you below:
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase;">Username (Email)</td>
              </tr>
              <tr>
                <td style="padding: 0 0 15px 0; font-size: 16px; color: #0f172a; font-weight: 700;">${admissionPoint.licenseeEmail}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase;">Generated Password</td>
              </tr>
              <tr>
                <td style="padding: 0 0 5px 0; font-size: 18px; color: #1e3a8a; font-weight: 800; letter-spacing: 0.5px;">${plainPassword}</td>
              </tr>
            </table>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-bottom: 30px;">
            <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Onboarding Protocol Requirements:</h4>
            <p style="color: #374151; font-size: 14px; line-height: 1.5; margin: 0 0 10px 0;">Upon your first login, you will be guided to complete these two mandatory steps:</p>
            <ol style="color: #374151; font-size: 14px; line-height: 1.6; padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 8px;"><strong>Pay Inspection Fee:</strong> A secure fee payment of ₹5,000 via our portal.</li>
              <li><strong>Online / Physical Inspection:</strong> Once paid, our audit team will complete your inspection and grant full dashboard access and your formal <strong>Authorisation Letter</strong>.</li>
            </ol>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; padding: 14px 30px; background-color: #1e3a8a; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; transition: background-color 0.2s;">Login to Portal</a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} 6A Skillcity. All rights reserved.</p>
          </div>
        </div>
      `;

      try {
        await sendEmail({
          email: admissionPoint.licenseeEmail,
          subject,
          message,
          html,
        });
      } catch (err) {
        console.error("Failed to send approval email:", err);
      }
    }

    res.status(200).json({
      success: true,
      message: `Admission point status updated to ${status} successfully`,
      data: admissionPoint,
    });
  } catch (error) {
    next(error);
  }
};

export const createInspectionFeeOrder = async (req, res, next) => {
  try {
    const partnerId = req.user.userId;
    const partner = await AdmissionPoint.findById(partnerId);
    
    if (!partner) {
      throw createError(404, "Partner profile not found.");
    }

    if (partner.onboardingState !== "fee_pending") {
      throw createError(400, "Inspection fee has already been paid or onboarding completed.");
    }

    const amount = Number(process.env.INSPECTION_FEE) || 5000;
    const orderId = `INS_FEE_${partnerId}_${Date.now().toString().slice(-6)}`;

    // Format phone number to be valid for Cashfree
    let rawPhone = partner.licenseeContactNumber || partner.contactPerson?.phone || "";
    let cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      cleanPhone = "9999999999";
    }

    // Create Cashfree Order
    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: partnerId.toString(),
        customer_phone: cleanPhone,
        customer_email: partner.licenseeEmail,
        customer_name: partner.licenseeName,
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/dashboard?onboarding_status=fee_paid&order_id={order_id}&payment_status={payment_status}`,
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
        console.error("[Cashfree Error] Partner order creation failed:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
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

export const verifyInspectionFeePayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const partnerId = req.user.userId;

    if (!orderId) {
      throw createError(400, "Order ID is required.");
    }

    cashfree
      .PGOrderFetchPayments(orderId)
      .then(async (response) => {
        const successfulPayment = response.data.find(
          (p) => p.payment_status === "SUCCESS",
        );

        const partner = await AdmissionPoint.findById(partnerId);
        if (!partner) {
          throw createError(404, "Partner not found.");
        }

        if (partner.onboardingState !== "fee_pending") {
          return res.status(200).json({
            success: true,
            message: "Payment already processed",
            data: partner,
          });
        }

        if (successfulPayment) {
          partner.onboardingState = "inspection_pending";
          partner.inspectionFeePaid = true;
          partner.inspectionFeePaymentDetails = successfulPayment;
          await partner.save();

          await logActivity(
            "PARTNER_FEE_PAID",
            `Partner ${partner.centerName} successfully paid the inspection fee of ₹${successfulPayment.payment_amount}`,
            partner._id,
            "AdmissionPoint",
            partner._id
          );

          await sendToAdmins({
            title: "Onboarding Fee Paid",
            message: `${partner.centerName} has paid their onboarding fee (Online).`,
            type: "partner_fee_paid",
            relatedId: partner._id,
            link: `/dashboard/partner-management/${partner._id}`
          });

          res.status(200).json({
            success: true,
            message: "Payment successfully verified!",
            data: partner,
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Payment failed or is pending at gateway",
          });
        }
      })
      .catch((error) => {
        console.error("[Cashfree Error] Onboarding payment verification failed:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        next(
          createError(
            500,
            error.response?.data?.message || "Failed to verify Cashfree payment",
          ),
        );
      });
  } catch (error) {
    next(error);
  }
};

export const recordOfflineOnboardingFee = async (req, res, next) => {
  try {
    const { partnerId, amount, method, transactionId, remarks } = req.body;
    // For partner calling this, we can optionally use req.user.userId,
    // but allowing partnerId via body lets admin do it too.
    const targetPartnerId = partnerId || req.user.userId;

    const partner = await AdmissionPoint.findById(targetPartnerId);
    if (!partner) {
      throw createError(404, "Partner not found.");
    }

    if (partner.onboardingState !== "fee_pending") {
      throw createError(400, "Partner fee has already been paid or state is invalid.");
    }

    if (!req.file) {
      throw createError(400, "Please upload the payment receipt.");
    }

    const receiptUrl = req.file.location || req.file.path;

    partner.onboardingState = "inspection_pending";
    partner.inspectionFeePaid = true;
    partner.inspectionFeePaymentDetails = {
      amount: Number(amount),
      method,
      transactionId,
      remarks,
      receipt: receiptUrl,
      paymentDate: new Date(),
      status: "SUCCESS"
    };

    await partner.save();

    await logActivity(
      "PARTNER_OFFLINE_FEE_PAID",
      `Offline inspection fee recorded for ${partner.centerName} (Amount: ₹${amount}, Method: ${method}, TXN: ${transactionId})`,
      req.user.userId,
      "AdmissionPoint",
      partner._id
    );

    await sendToAdmins({
      title: "Onboarding Fee Paid",
      message: `${partner.centerName} has paid their onboarding fee (Offline).`,
      type: "partner_fee_paid",
      relatedId: partner._id,
      link: `/dashboard/partner-management/${partner._id}`
    });

    res.status(200).json({
      success: true,
      message: "Offline payment receipt uploaded and verified successfully!",
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadOfficeVideo = async (req, res, next) => {
  try {
    const partnerId = req.user.userId;
    const partner = await AdmissionPoint.findById(partnerId);

    if (!partner) {
      throw createError(404, "Partner not found.");
    }

    if (!req.files || req.files.length === 0) {
      throw createError(400, "Please upload at least one media file.");
    }

    if (!partner.documents) {
      partner.documents = {};
    }
    if (!partner.documents.officeVideo) partner.documents.officeVideo = [];
    if (!partner.documents.officePhotos) partner.documents.officePhotos = [];

    // Save all uploaded media
    req.files.forEach((file) => {
      const url = file.location || file.path;
      if (file.fieldname === "video") {
        partner.documents.officeVideo.push(url);
      } else if (file.fieldname === "photos") {
        partner.documents.officePhotos.push(url);
      }
    });

    // Reset inspection status in case it was previously rejected
    partner.inspectionStatus = "pending";
    partner.inspectionRejectionReason = "";
    
    await partner.save();

    await logActivity(
      "PARTNER_INSPECTION_MEDIA_UPLOADED",
      `Inspection media uploaded for ${partner.centerName}.`,
      partnerId,
      "AdmissionPoint",
      partner._id
    );

    await sendToAdmins({
      title: "Onboarding Media Uploaded",
      message: `${partner.centerName} has uploaded their online/physical inspection media.`,
      type: "partner_media_uploaded",
      relatedId: partner._id,
      link: `/dashboard/partner-management`
    });

    res.status(200).json({
      success: true,
      message: "Inspection media uploaded successfully!",
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectPartnerInspection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw createError(400, "Rejection reason is required.");
    }

    const partner = await AdmissionPoint.findById(id);
    if (!partner) {
      throw createError(404, "Partner not found.");
    }

    // Set status to rejected and clear the media so they must re-upload
    partner.inspectionStatus = "rejected";
    partner.inspectionRejectionReason = reason;
    
    if (partner.documents) {
      partner.documents.officeVideo = [];
      partner.documents.officePhotos = [];
    }

    await partner.save();

    await logActivity(
      "PARTNER_INSPECTION_REJECTED",
      `Inspection rejected for ${partner.centerName}. Reason: ${reason}`,
      req.user.userId,
      "AdmissionPoint",
      partner._id
    );

    res.status(200).json({
      success: true,
      message: "Partner inspection rejected successfully.",
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

export const completePartnerInspection = async (req, res, next) => {
  try {
    const { id } = req.params;

    const partner = await AdmissionPoint.findById(id);
    if (!partner) {
      throw createError(404, "Partner not found.");
    }

    if (partner.onboardingState === "completed") {
      throw createError(400, "Inspection and onboarding has already been completed.");
    }

    partner.onboardingState = "completed";
    partner.inspectionStatus = "approved";
    partner.inspectionCompleted = true;
    partner.inspectionCompletedAt = new Date();
    const issuedAt = new Date();
    partner.authorisationLetterIssuedAt = issuedAt;
    await partner.save();

    // Deactivate previous authorisation letters for safety
    await AuthorisationLetter.updateMany({ partnerId: id }, { isActive: false });

    // Create the first AuthorisationLetter document
    const validUntil = new Date(issuedAt);
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    validUntil.setDate(validUntil.getDate() - 1);
    const count = await AuthorisationLetter.countDocuments({ partnerId: id });
    const certificateNumber = `6ASC/AP/${partner._id.toString().slice(-4).toUpperCase()}/${issuedAt.getFullYear()}${count > 0 ? `/R${count}` : ""}`;

    const letter = await AuthorisationLetter.create({
      partnerId: id,
      certificateNumber,
      issuedAt,
      validUntil,
      isActive: true,
      renewedBy: req.user.userId,
    });

    await logActivity(
      "PARTNER_INSPECTION_COMPLETED",
      `Online/Physical inspection completed for ${partner.centerName}. Account fully activated.`,
      req.user.userId,
      "AdmissionPoint",
      partner._id
    );

    const subject = "6A Skillcity - Partnership Authorisation Letter & Account Activation";
    
    // Formatting Dates for Backend Certificate
    const formatDateBackend = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const issuedDateObj = partner.authorisationLetterIssuedAt || partner.inspectionCompletedAt || new Date();
    const issuedDate = formatDateBackend(issuedDateObj);
    
    const validUntilDateObj = new Date(issuedDateObj);
    validUntilDateObj.setFullYear(validUntilDateObj.getFullYear() + 1);
    validUntilDateObj.setDate(validUntilDateObj.getDate() - 1);
    const validUntilDate = formatDateBackend(validUntilDateObj);

    const message = `Dear ${partner.licenseeName},\n\nCongratulations! We are pleased to inform you that your Online / Physical Inspection has been successfully completed, and your 6A Skillcity Admission Point is now fully authorized.\n\nYour account is now active, and you have full access to your partner dashboard, courses, and student registration.\n\nAttached to your account is your official Authorisation Letter.\n\nBest regards,\n6A Skillcity Director`;

    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 20px 10px;">
        <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; padding: 15px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); font-family: Arial, sans-serif; color: #374151; font-size: 14px; line-height: 1.5; margin-bottom: 25px;">
          <p>Dear <strong>${partner.licenseeName}</strong>,</p>
          <p>Congratulations! We are pleased to inform you that your Online / Physical Inspection has been successfully completed, and your <strong>6A Skillcity Admission Point</strong> is now fully authorized.</p>
          <p>Your account is now active, and you have full access to your partner dashboard, courses, and student registration.</p>
          <p>Below is your official Certificate of Authorisation. Please retain this for your records.</p>
          <p>Best regards,<br/><strong>6A Skillcity Administration</strong></p>
        </div>

        <table cellpadding="0" cellspacing="0" border="0" width="650" style="margin: 0 auto; background-color: #FCFBF7; border: 3.5px solid #0B2545; border-collapse: separate; text-align: left;">
          <tr>
            <td style="padding: 4px; border: 1px solid #C5A880;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 9px solid #0B2545;">
                <tr>
                  <td style="padding: 2px; border: 1px solid #C5A880;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FCFBF7; padding: 25px; font-family: Georgia, serif; color: #1f2937;">
                      
                      <!-- Header Navy Block -->
                      <tr>
                        <td align="center" style="background-color: #0B2545; padding: 15px 20px; color: #ffffff; text-align: center;">
                          <h3 style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #faf8f5;">
                            THE GLOBAL UNIVERSITY, ARUNACHAL PRADESH
                          </h3>
                          <p style="margin: 3px 0 0 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 8px; font-weight: bold; letter-spacing: 1px; color: #faf8f5; opacity: 0.85;">
                            (UGC Approved | NAAC Accredited)
                          </p>
                          <div style="width: 150px; height: 1px; background-color: #C5A880; margin: 8px auto;"></div>
                          <h4 style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; font-weight: 900; letter-spacing: 2.5px; color: #C5A880; text-transform: uppercase;">
                            NATIONAL ADMISSION PARTNER
                          </h4>
                          <h2 style="margin: 4px 0 0 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13.5px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
                            6A SKILL CITY (OPC) PRIVATE LIMITED
                          </h2>
                          <p style="margin: 4px 0 0 0; font-family: Georgia, serif; font-size: 8.5px; font-style: italic; color: #cbd5e1; font-weight: 500;">
                            Grace Tower, First Floor, Ernakulam, Kerala — 682018
                          </p>
                          <p style="margin: 2px 0 0 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 8.5px; color: #cbd5e1; letter-spacing: 0.5px;">
                            operations@6askillcity.com | +91 983 33 31 014
                          </p>
                        </td>
                      </tr>

                      <!-- Logo, Title & Certified Intro -->
                      <tr>
                        <td align="center" style="padding-top: 20px; text-align: center;">
                          <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto; background-color: #ffffff; border: 2px solid #C5A880; border-radius: 50%; width: 60px; height: 60px;">
                            <tr>
                              <td align="center" style="vertical-align: middle; padding: 2px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%" height="100%" style="border: 1px solid #0B2545; border-radius: 50%;">
                                  <tr>
                                    <td align="center" style="vertical-align: middle; text-align: center;">
                                      <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 900; color: #0B2545; line-height: 1;">6A</span><br/>
                                      <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 5.5px; font-weight: 900; color: #C5A880; letter-spacing: 0.5px; line-height: 1; text-transform: uppercase;">SKILL CITY</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="margin: 10px 0 0 0; font-family: Georgia, serif; font-size: 11px; font-style: italic; color: #4b5563;">This is to certify that</p>
                          
                          <h1 style="margin: 5px 0 0 0; font-family: Georgia, serif; font-size: 20px; font-weight: 900; color: #0B2545; letter-spacing: 1px; text-transform: uppercase;">
                            CERTIFICATE OF AUTHORISATION
                          </h1>
                          
                          <p style="margin: 2px 0 0 0; font-family: Georgia, serif; font-size: 9.5px; font-style: italic; font-weight: bold; color: #C5A880; letter-spacing: 0.5px;">
                            Application Point — Counselling & Admission Facilitation
                          </p>
                        </td>
                      </tr>

                      <!-- Partner Name Box -->
                      <tr>
                        <td align="center" style="padding: 12px 0;">
                          <table cellpadding="0" cellspacing="0" border="0" width="90%" style="background-color: #EBF2FA; border: 1px solid #0B2545; border-radius: 6px; text-align: center; margin: 0 auto;">
                            <tr>
                              <td style="padding: 10px 15px;">
                                <h2 style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13.5px; font-weight: 900; color: #0B2545; letter-spacing: 1px; text-transform: uppercase;">
                                  ${partner.centerName}
                                </h2>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Authorisation Statement -->
                      <tr>
                        <td align="center" style="text-align: center; padding-top: 5px;">
                          <p style="margin: 0; font-family: Georgia, serif; font-size: 11px; font-style: italic; color: #4b5563;">
                            is hereby authorised as an official
                          </p>
                          <h3 style="margin: 3px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 900; color: #0B2545; letter-spacing: 2px; text-transform: uppercase;">
                            APPLICATION POINT
                          </h3>
                          <p style="margin: 3px 0 0 0; font-family: Georgia, serif; font-size: 9.5px; color: #374151; line-height: 1.6;">
                            of 6A Skill City (OPC) Private Limited, the National Admission Partner of<br/>
                            The Global University, Arunachal Pradesh (UGC Approved).
                          </p>
                        </td>
                      </tr>

                      <!-- Scope of Authorisation -->
                      <tr>
                        <td style="padding: 12px 0; border-top: 1px solid rgba(197, 168, 128, 0.3); margin-top: 10px;">
                          <h4 style="margin: 0 0 8px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9.5px; font-weight: 900; color: #0B2545; letter-spacing: 1.5px; text-transform: uppercase; text-align: center;">
                            SCOPE OF AUTHORISATION
                          </h4>
                          <table cellpadding="0" cellspacing="0" border="0" width="85%" align="center" style="margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9.5px; color: #374151;">
                            <tr>
                              <td style="padding-bottom: 4px; line-height: 1.4;">
                                <span style="color: #C5A880; font-weight: bold; margin-right: 6px;">✓</span> Provide counselling to prospective students for all programs
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 4px; line-height: 1.4;">
                                <span style="color: #C5A880; font-weight: bold; margin-right: 6px;">✓</span> Assist in application submission and documentation
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 4px; line-height: 1.4;">
                                <span style="color: #C5A880; font-weight: bold; margin-right: 6px;">✓</span> Facilitate admissions to UG, PG, Diploma & Skill programs
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 4px; line-height: 1.4;">
                                <span style="color: #C5A880; font-weight: bold; margin-right: 6px;">✓</span> Conduct student awareness and orientation sessions
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 4px; line-height: 1.4;">
                                <span style="color: #C5A880; font-weight: bold; margin-right: 6px;">✓</span> Collect and forward applications to the National Admission Partner
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Metadata Table Grid -->
                      <tr>
                        <td style="padding: 10px 0;">
                          <table cellpadding="0" cellspacing="0" border="0" width="85%" align="center" style="margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; color: #4b5563;">
                            <tr>
                              <!-- Column 1 -->
                              <td width="47%" style="vertical-align: top;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td style="padding: 5px 0; border-bottom: 1px solid rgba(197, 168, 128, 0.4);">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                          <td align="left" style="font-size: 9px;"><strong style="color: #0B2545;">Certificate No.:</strong></td>
                                          <td align="right" style="font-size: 9px; color: #1f2937; font-weight: bold;">6ASC/AP/${partner._id.toString().slice(-4).toUpperCase()}/2026</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 5px 0; border-bottom: 1px solid rgba(197, 168, 128, 0.4);">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                          <td align="left" style="font-size: 9px;"><strong style="color: #0B2545;">Partner ID:</strong></td>
                                          <td align="right" style="font-size: 9px; color: #1f2937; font-weight: bold;">6A-AP-${partner._id.toString().slice(-4).toUpperCase()}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 5px 0; border-bottom: 1px solid rgba(197, 168, 128, 0.4);">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                          <td align="left" style="font-size: 9px;"><strong style="color: #0B2545;">State / District:</strong></td>
                                          <td align="right" style="font-size: 9px; color: #1f2937; font-weight: bold;">${partner.location.state} / ${partner.location.city}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              
                              <!-- Spacer -->
                              <td width="6%">&nbsp;</td>
                              
                              <!-- Column 2 -->
                              <td width="47%" style="vertical-align: top;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td style="padding: 5px 0; border-bottom: 1px solid rgba(197, 168, 128, 0.4);">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                          <td align="left" style="font-size: 9px;"><strong style="color: #0B2545;">Valid From:</strong></td>
                                          <td align="right" style="font-size: 9px; color: #1f2937; font-weight: bold;">${issuedDate}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 5px 0; border-bottom: 1px solid rgba(197, 168, 128, 0.4);">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                          <td align="left" style="font-size: 9px;"><strong style="color: #0B2545;">Valid Until:</strong></td>
                                          <td align="right" style="font-size: 9px; color: #1f2937; font-weight: bold;">${validUntilDate}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 5px 0; border-bottom: 1px solid rgba(197, 168, 128, 0.4);">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                          <td align="left" style="font-size: 9px;"><strong style="color: #0B2545;">Issued On:</strong></td>
                                          <td align="right" style="font-size: 9px; color: #1f2937; font-weight: bold;">${issuedDate}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Signatures & Seal Section -->
                      <tr>
                        <td style="padding-top: 15px; border-top: 1px solid rgba(197, 168, 128, 0.3); margin-top: 10px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="85%" align="center" style="margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 8.5px; color: #4b5563;">
                            <tr>
                              <!-- Left Signature -->
                              <td width="35%" align="center" style="vertical-align: bottom;">
                                <div style="width: 100px; border-bottom: 1px solid #9ca3af; margin: 0 auto 5px auto; height: 1px;"></div>
                                <strong style="color: #0B2545; font-size: 8px;">Authorised Signatory</strong><br/>
                                <span style="color: #6b7280; font-size: 7.5px;">6A Skill City (OPC) Pvt. Ltd.</span>
                              </td>
                              <!-- Center Seal -->
                              <td width="30%" align="center" style="vertical-align: middle;">
                                <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto; background-color: #ffffff; border: 2px dashed #C5A880; border-radius: 50%; width: 55px; height: 55px;">
                                  <tr>
                                    <td align="center" style="vertical-align: middle; padding: 2px;">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%" height="100%" style="border: 1px solid #C5A880; border-radius: 50%; background-color: #FCFBF7;">
                                        <tr>
                                          <td align="center" style="vertical-align: middle; text-align: center;">
                                            <span style="font-size: 5px; font-weight: 900; color: #C5A880; text-transform: uppercase; line-height: 1;">OFFICIAL SEAL</span><br/>
                                            <span style="font-size: 6px; font-weight: 900; color: #0B2545; line-height: 1.2;">6A SKILL CITY</span><br/>
                                            <span style="font-size: 3.5px; font-weight: bold; color: #6b7280; text-transform: uppercase; line-height: 1;">APPLICATION POINT</span>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <!-- Right Signature -->
                              <td width="35%" align="center" style="vertical-align: bottom;">
                                <div style="width: 100px; border-bottom: 1px solid #9ca3af; margin: 0 auto 5px auto; height: 1px;"></div>
                                <strong style="color: #0B2545; font-size: 8px;">Director / Manager</strong><br/>
                                <span style="color: #6b7280; font-size: 7.5px;">Authorised Application Point</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Footer Navy Block -->
                      <tr>
                        <td style="padding-top: 15px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0B2545; text-align: center; color: #ffffff;">
                            <tr>
                              <td style="padding: 10px 15px; text-align: center;">
                                <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 7.5px; color: #d1d5db; border-bottom: 1px solid rgba(197, 168, 128, 0.3); padding-bottom: 4px; text-transform: uppercase; font-weight: bold;">
                                  This certificate is valid only with the official seal of 6A Skill City (OPC) Private Limited.
                                </p>
                                <p style="margin: 4px 0 0 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 7.5px; color: #e5e7eb; font-weight: 500;">
                                  6askillcity.com | partner@6askillcity.com | +91 983 33 31 014
                                </p>
                                <p style="margin: 2px 0 0 0; font-family: Georgia, serif; font-size: 7.5px; color: #cbd5e1;">
                                  Grace Tower, 1st Floor, Ernakulam North, Kerala — 682018
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    try {
      const pdfBuffer = await generateCertificatePDF(partner, letter);
      const filename = `Authorisation_Certificate_${partner.centerName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

      await sendEmail({
        email: partner.licenseeEmail,
        subject,
        message,
        html,
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: "application/pdf"
          }
        ]
      });
    } catch (err) {
      console.error("Failed to send authorisation email:", err);
    }

    res.status(200).json({
      success: true,
      message: "Inspection marked completed and Authorisation Letter successfully issued!",
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAdmissionPoints = async (req, res, next) => {
  try {
    const { status, isActive, search } = req.query;
    const filter = { deleted: false };

    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { centerName: { $regex: search, $options: "i" } },
        { licenseeName: { $regex: search, $options: "i" } },
        { licenseeEmail: { $regex: search, $options: "i" } },
      ];
    }

    const admissionPoints = await AdmissionPoint.find(filter)
      .sort({
        createdAt: -1,
      })
      .lean();

    // Enhance with permission summaries
    const data = await Promise.all(
      admissionPoints.map(async (point) => {
        const permissions = await PartnerPermission.find({
          partnerId: point._id,
          status: "active",
        }).populate("universityId", "name shortName");

        const unis = [
          ...new Set(
            permissions
              .filter((p) => p.type === "university" && p.universityId)
              .map((p) => p.universityId.shortName || p.universityId.name),
          ),
        ];

        const progCount = permissions.filter(
          (p) => p.type === "program",
        ).length;
        const branchCount = permissions.filter(
          (p) => p.type === "branch",
        ).length;

        return {
          ...point,
          assignedUnis: unis,
          programCount: progCount,
          branchCount: branchCount,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmissionPointById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admissionPoint = await AdmissionPoint.findById(id).populate({
      path: "history.actionBy",
      select: "fullName email",
    });

    if (!admissionPoint) {
      throw createError(404, "Admission point not found");
    }

    // Get activity logs for this partner
    const activityLogs = await ActivityLog.find({
      targetId: id,
      targetType: "AdmissionPoint",
    })
      .populate("performedBy", "fullName email")
      .sort({ createdAt: -1 });

    const authorisationLetter = await AuthorisationLetter.findOne({
      partnerId: id,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        ...admissionPoint.toObject(),
        activityLogs,
        authorisationLetter,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleAdmissionPointActiveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const admissionPoint = await AdmissionPoint.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );

    if (!admissionPoint) {
      throw createError(404, "Admission point not found");
    }

    await logActivity(
      "TOGGLE_PARTNER_ACTIVE",
      `Partner ${admissionPoint.centerName} is now ${isActive ? "Active" : "Inactive"}`,
      req.user.userId,
      "AdmissionPoint",
      admissionPoint._id,
    );

    res.status(200).json({
      success: true,
      message: `Partner status updated to ${isActive ? "Active" : "Inactive"}`,
      data: admissionPoint,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PERMISSION MANAGEMENT
// ─────────────────────────────────────────────

export const getPartnerPermissions = async (req, res, next) => {
  try {
    const { partnerId } = req.params;
    const permissions = await PartnerPermission.find({ partnerId })
      .populate("universityId", "name")
      .populate("programId", "name")
      .populate("branchId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
};

export const addPartnerPermission = async (req, res, next) => {
  try {
    const { partnerId, type, universityId, programId, branchId } = req.body;

    // Check if permission already exists
    const query = { partnerId, type };
    if (type === "university") query.universityId = universityId;
    if (type === "program") query.programId = programId;
    if (type === "branch") query.branchId = branchId;

    const existing = await PartnerPermission.findOne(query);
    if (existing) {
      throw createError(400, "This permission already exists for the partner");
    }

    // Hierarchy Check: Ensure parent permission exists before adding child
    if (type === "program") {
      const program = await Program.findById(programId);
      if (!program) throw createError(404, "Program not found");

      const uniPermitted = await PartnerPermission.findOne({
        partnerId,
        type: "university",
        universityId: program.university,
        status: "active",
      });

      if (!uniPermitted) {
        throw createError(
          400,
          "University-level permission must be granted before adding specific programs",
        );
      }
    }

    if (type === "branch") {
      const branch = await Branch.findById(branchId).populate("program");
      if (!branch) throw createError(404, "Branch not found");

      const [uniPermitted, progPermitted] = await Promise.all([
        PartnerPermission.findOne({
          partnerId,
          type: "university",
          universityId: branch.program.university,
          status: "active",
        }),
        PartnerPermission.findOne({
          partnerId,
          type: "program",
          programId: branch.program._id,
          status: "active",
        }),
      ]);

      if (!uniPermitted || !progPermitted) {
        throw createError(
          400,
          "Both University and Program level permissions must be granted before adding specific branches",
        );
      }
    }

    const permission = new PartnerPermission({
      partnerId,
      type,
      universityId,
      programId,
      branchId,
    });

    await permission.save();

    await logActivity(
      "ADD_PARTNER_PERMISSION",
      `Added ${type} permission to partner ID: ${partnerId}`,
      req.user.userId,
      "PartnerPermission",
      permission._id,
    );

    res.status(201).json({
      success: true,
      data: permission,
    });
  } catch (error) {
    next(error);
  }
};

export const removePartnerPermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const permission = await PartnerPermission.findByIdAndDelete(id);

    if (!permission) {
      throw createError(404, "Permission not found");
    }

    await logActivity(
      "REMOVE_PARTNER_PERMISSION",
      `Removed ${permission.type} permission from partner ID: ${permission.partnerId}`,
      req.user.userId,
      "PartnerPermission",
      permission._id,
    );

    res.status(200).json({
      success: true,
      message: "Permission removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPartnerProfile = async (req, res, next) => {
  try {
    const partnerId = req.user.userId;
    const partner = await AdmissionPoint.findById(partnerId);

    if (!partner) {
      throw createError(404, "Partner profile not found");
    }

    const rawPermissions = await PartnerPermission.find({
      partnerId,
      status: "active",
    })
      .populate("universityId", "name")
      .populate("programId", "name")
      .populate("branchId", "name duration type");

    // Fetch current fees for branches
    const permissions = await Promise.all(
      rawPermissions.map(async (p) => {
        const obj = p.toObject();
        if (p.type === "branch" && p.branchId) {
          const currentFee = await ProgramFee.findOne({
            branch: p.branchId._id,
            isCurrent: true,
          });
          obj.currentFee = currentFee;
        }
        return obj;
      }),
    );

    res.status(200).json({
      success: true,
      data: {
        partner,
        permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateAdminAccessToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const token = crypto.randomBytes(16).toString("hex"); // 32 chars hex
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    const partner = await AdmissionPoint.findByIdAndUpdate(
      id,
      {
        adminAccessToken: token,
        adminAccessTokenExpires: expires,
      },
      { new: true },
    );

    if (!partner) {
      throw createError(404, "Partner not found");
    }

    await logActivity(
      "GENERATE_ADMIN_TOKEN",
      `Generated temporary access token for partner ${partner.centerName}`,
      req.user.userId,
      "AdmissionPoint",
      partner._id,
    );

    res.status(200).json({
      success: true,
      message: "Access token generated successfully. Valid for 15 minutes.",
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const submitPartnerInquiry = async (req, res, next) => {
  try {
    const { centerName, contactName, phone, email, address, fullName, coursesLooking, comments } = req.body;

    const nameVal = fullName || contactName || centerName;
    const emailVal = email;
    const phoneVal = phone || req.body.mobile || req.body.phoneNumber || req.body.mobileNumber;
    const coursesVal = coursesLooking || "N/A";
    const commentsVal = comments || address || "N/A";

    if (!nameVal || !emailVal || !phoneVal) {
      throw createError(400, "Full name, email, and mobile/phone number are required");
    }

    const adminEmailsStr = process.env.ADMIN_EMAILS || "partner@6askillcity.com";

    const fieldsToDisplay = {
      "Full Name": nameVal,
      "Email Address": emailVal,
      "Mobile Number": phoneVal,
      "Courses Looking For": coursesVal,
      "Comments / Message": commentsVal,
    };

    if (centerName && centerName !== nameVal) {
      fieldsToDisplay["Center Name"] = centerName;
    }
    if (address && address !== commentsVal) {
      fieldsToDisplay["Office Address"] = address;
    }

    let rowsHtml = "";
    let idx = 0;
    for (const [key, value] of Object.entries(fieldsToDisplay)) {
      const bgColor = idx % 2 === 0 ? "#f8f9fa" : "#ffffff";
      rowsHtml += `
        <tr style="background-color: ${bgColor};">
          <td style="padding: 10px; border: 1px solid #e9ecef; font-weight: bold; width: 35%; color: #333;">${key}</td>
          <td style="padding: 10px; border: 1px solid #e9ecef; color: #555; line-height: 1.4;">${value}</td>
        </tr>
      `;
      idx++;
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
         <h2 style="color: #17468C; margin-top: 0; border-bottom: 2px solid #17468C; padding-bottom: 8px;">New Partner/Admission Inquiry</h2>
         <p style="font-size: 15px; color: #555; line-height: 1.5;">A new partner has submitted an inquiry on 6A Skillcity. Below are the details:</p>
         
         <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
           ${rowsHtml}
         </table>
         
         <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #e9ecef; padding-top: 16px;">
           This inquiry was sent automatically from the 6A Skillcity portal.
         </div>
      </div>
    `;

    await sendEmail({
      email: adminEmailsStr,
      subject: `New Partner Inquiry - ${nameVal}`,
      message: `New Partner Inquiry: Name: ${nameVal}, Phone: ${phoneVal}, Email: ${emailVal}, Courses: ${coursesVal}`,
      html: emailHtml,
    });

    res.status(200).json({
      success: true,
      message: "Inquiry submitted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const renewPartnerAuthorisation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const partner = await AdmissionPoint.findById(id);
    if (!partner) {
      throw createError(404, "Partner not found.");
    }

    const issuedAt = new Date();
    partner.authorisationLetterIssuedAt = issuedAt;
    await partner.save();

    // Mark previous letters as inactive
    await AuthorisationLetter.updateMany(
      { partnerId: id },
      { isActive: false }
    );

    // Create the new AuthorisationLetter record
    const validUntil = new Date(issuedAt);
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    validUntil.setDate(validUntil.getDate() - 1);
    const count = await AuthorisationLetter.countDocuments({ partnerId: id });
    const certificateNumber = `6ASC/AP/${partner._id.toString().slice(-4).toUpperCase()}/${issuedAt.getFullYear()}${count > 0 ? `/R${count}` : ""}`;

    const letter = await AuthorisationLetter.create({
      partnerId: id,
      certificateNumber,
      issuedAt,
      validUntil,
      isActive: true,
      renewedBy: req.user.userId,
    });

    await logActivity(
      "PARTNER_AUTHORISATION_RENEWED",
      `Authorisation Letter renewed for ${partner.centerName}. Valid until: ${validUntil.toLocaleDateString()}`,
      req.user.userId,
      "AdmissionPoint",
      partner._id
    );

    // Email new certificate
    const subject = "6A Skillcity - Partnership Authorisation Letter Renewed";
    
    const formatDateBackend = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const issuedDate = formatDateBackend(issuedAt);
    const validUntilStr = formatDateBackend(validUntil);

    const message = `Dear ${partner.licenseeName},\n\nWe are pleased to inform you that your 6A Skillcity Admission Point Partnership Authorisation has been successfully renewed.\n\nAttached to your account is your official renewed Authorisation Letter.\n\nBest regards,\n6A Skillcity Director`;

    // Same beautiful HTML template
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 20px 10px;">
        <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; padding: 15px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); font-family: Arial, sans-serif; color: #374151; font-size: 14px; line-height: 1.5; margin-bottom: 25px;">
          <p>Dear <strong>${partner.licenseeName}</strong>,</p>
          <p>We are pleased to inform you that your <strong>6A Skillcity Admission Point</strong> partnership has been successfully renewed.</p>
          <p>Your renewed Certificate of Authorisation is attached to this email and is now visible on your dashboard.</p>
          <p>Best regards,<br/><strong>6A Skillcity Administration</strong></p>
        </div>

        <table cellpadding="0" cellspacing="0" border="0" width="650" style="margin: 0 auto; background-color: #FCFBF7; border: 3.5px solid #0B2545; border-collapse: separate; text-align: left;">
          <tr>
            <td style="padding: 4px; border: 1px solid #C5A880;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 9px solid #0B2545;">
                <tr>
                  <td style="padding: 2px; border: 1px solid #C5A880;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #FCFBF7; padding: 25px; font-family: Georgia, serif; color: #1f2937;">
                      
                      <!-- Header Navy Block -->
                      <tr>
                        <td align="center" style="background-color: #0B2545; padding: 15px 20px; color: #ffffff; text-align: center;">
                          <h3 style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #faf8f5;">
                            THE GLOBAL UNIVERSITY, ARUNACHAL PRADESH
                          </h3>
                          <p style="margin: 3px 0 0 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 8px; font-weight: bold; letter-spacing: 1px; color: #faf8f5; opacity: 0.85;">
                            (UGC Approved | NAAC Accredited)
                          </p>
                          <div style="width: 150px; height: 1px; background-color: #C5A880; margin: 8px auto;"></div>
                          <h4 style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; font-weight: 900; letter-spacing: 2.5px; color: #C5A880; text-transform: uppercase;">
                            NATIONAL ADMISSION PARTNER
                          </h4>
                          <h2 style="margin: 4px 0 0 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13.5px; font-weight: 800; color: #ffffff; letter-spacing: 1px; text-transform: uppercase;">
                            6A SKILL CITY (OPC) PRIVATE LIMITED
                          </h2>
                          <p style="margin: 4px 0 0 0; font-family: Georgia, serif; font-size: 8.5px; font-style: italic; color: #cbd5e1; font-weight: 500;">
                            Grace Tower, First Floor, Ernakulam, Kerala — 682018
                          </p>
                          <p style="margin: 2px 0 0 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 8.5px; color: #cbd5e1; letter-spacing: 0.5px;">
                            operations@6askillcity.com | +91 983 33 31 014
                          </p>
                        </td>
                      </tr>

                      <!-- Logo, Title & Certified Intro -->
                      <tr>
                        <td align="center" style="padding-top: 20px; text-align: center;">
                          <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto; background-color: #ffffff; border: 2px solid #C5A880; border-radius: 50%; width: 60px; height: 60px;">
                            <tr>
                              <td align="center" style="vertical-align: middle; padding: 2px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%" height="100%" style="border: 1px solid #0B2545; border-radius: 50%;">
                                  <tr>
                                    <td align="center" style="vertical-align: middle; text-align: center;">
                                      <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 900; color: #0B2545; line-height: 1;">6A</span><br/>
                                      <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 5.5px; font-weight: 900; color: #C5A880; letter-spacing: 0.5px; line-height: 1; text-transform: uppercase;">SKILL CITY</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="margin: 10px 0 0 0; font-family: Georgia, serif; font-size: 11px; font-style: italic; color: #4b5563;">This is to certify that</p>
                          
                          <h1 style="margin: 5px 0 0 0; font-family: Georgia, serif; font-size: 20px; font-weight: 900; color: #0B2545; letter-spacing: 1px; text-transform: uppercase;">
                            CERTIFICATE OF AUTHORISATION
                          </h1>
                          
                          <p style="margin: 2px 0 0 0; font-family: Georgia, serif; font-size: 9.5px; font-style: italic; font-weight: bold; color: #C5A880; letter-spacing: 0.5px;">
                            Application Point — Counselling & Admission Facilitation
                          </p>
                        </td>
                      </tr>

                      <!-- Partner Name Box -->
                      <tr>
                        <td align="center" style="padding: 12px 0;">
                          <table cellpadding="0" cellspacing="0" border="0" width="90%" style="background-color: #EBF2FA; border: 1px solid #0B2545; border-radius: 6px; text-align: center; margin: 0 auto;">
                            <tr>
                              <td style="padding: 10px 15px;">
                                <h2 style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13.5px; font-weight: 900; color: #0B2545; letter-spacing: 1px; text-transform: uppercase;">
                                  ${partner.centerName}
                                </h2>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Authorisation Statement -->
                      <tr>
                        <td align="center" style="text-align: center; padding-top: 5px;">
                          <p style="margin: 0; font-family: Georgia, serif; font-size: 11px; font-style: italic; color: #4b5563;">
                            is hereby authorised as an official
                          </p>
                          <h3 style="margin: 3px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 900; color: #0B2545; letter-spacing: 2px; text-transform: uppercase;">
                            APPLICATION POINT
                          </h3>
                          <p style="margin: 3px 0 0 0; font-family: Georgia, serif; font-size: 9.5px; color: #374151; line-height: 1.6;">
                            of 6A Skill City (OPC) Private Limited, the National Admission Partner of<br/>
                            The Global University, Arunachal Pradesh (UGC Approved).
                          </p>
                        </td>
                      </tr>

                      <!-- Scope of Authorisation -->
                      <tr>
                        <td style="padding: 12px 0; border-top: 1px solid rgba(197, 168, 128, 0.3); margin-top: 10px;">
                          <h4 style="margin: 0 0 8px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9.5px; font-weight: 900; color: #0B2545; letter-spacing: 1.5px; text-transform: uppercase; text-align: center;">
                            SCOPE OF AUTHORISATION
                          </h4>
                          <table cellpadding="0" cellspacing="0" border="0" width="85%" align="center" style="margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9.5px; color: #374151;">
                            <tr>
                              <td style="padding-bottom: 4px; line-height: 1.4;">
                                <span style="color: #C5A880; font-weight: bold; margin-right: 6px;">✓</span> Provide counselling to prospective students for all programs
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 4px; line-height: 1.4;">
                                <span style="color: #C5A880; font-weight: bold; margin-right: 6px;">✓</span> Assist in application submission and documentation
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 4px; line-height: 1.4;">
                                <span style="color: #C5A880; font-weight: bold; margin-right: 6px;">✓</span> Facilitate admissions to UG, PG, Diploma & Skill programs
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 4px; line-height: 1.4;">
                                <span style="color: #C5A880; font-weight: bold; margin-right: 6px;">✓</span> Conduct student awareness and orientation sessions
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 4px; line-height: 1.4;">
                                <span style="color: #C5A880; font-weight: bold; margin-right: 6px;">✓</span> Collect and forward applications to the National Admission Partner
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Metadata Table Grid -->
                      <tr>
                        <td style="padding: 10px 0;">
                          <table cellpadding="0" cellspacing="0" border="0" width="85%" align="center" style="margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; color: #4b5563;">
                            <tr>
                              <!-- Column 1 -->
                              <td width="47%" style="vertical-align: top;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td style="padding: 5px 0; border-bottom: 1px solid rgba(197, 168, 128, 0.4);">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                          <td align="left" style="font-size: 9px;"><strong style="color: #0B2545;">Certificate No.:</strong></td>
                                          <td align="right" style="font-size: 9px; color: #1f2937; font-weight: bold;">${certificateNumber}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 5px 0; border-bottom: 1px solid rgba(197, 168, 128, 0.4);">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                          <td align="left" style="font-size: 9px;"><strong style="color: #0B2545;">Partner ID:</strong></td>
                                          <td align="right" style="font-size: 9px; color: #1f2937; font-weight: bold;">6A-AP-${partner._id.toString().slice(-4).toUpperCase()}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 5px 0; border-bottom: 1px solid rgba(197, 168, 128, 0.4);">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                          <td align="left" style="font-size: 9px;"><strong style="color: #0B2545;">State / District:</strong></td>
                                          <td align="right" style="font-size: 9px; color: #1f2937; font-weight: bold;">${partner.location.state} / ${partner.location.city}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              
                              <!-- Spacer -->
                              <td width="6%">&nbsp;</td>
                              
                              <!-- Column 2 -->
                              <td width="47%" style="vertical-align: top;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td style="padding: 5px 0; border-bottom: 1px solid rgba(197, 168, 128, 0.4);">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                          <td align="left" style="font-size: 9px;"><strong style="color: #0B2545;">Valid From:</strong></td>
                                          <td align="right" style="font-size: 9px; color: #1f2937; font-weight: bold;">${issuedDate}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 5px 0; border-bottom: 1px solid rgba(197, 168, 128, 0.4);">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                          <td align="left" style="font-size: 9px;"><strong style="color: #0B2545;">Valid Until:</strong></td>
                                          <td align="right" style="font-size: 9px; color: #1f2937; font-weight: bold;">${validUntilStr}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 5px 0; border-bottom: 1px solid rgba(197, 168, 128, 0.4);">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                          <td align="left" style="font-size: 9px;"><strong style="color: #0B2545;">Issued On:</strong></td>
                                          <td align="right" style="font-size: 9px; color: #1f2937; font-weight: bold;">${issuedDate}</td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Signatures & Seal Section -->
                      <tr>
                        <td style="padding-top: 15px; border-top: 1px solid rgba(197, 168, 128, 0.3); margin-top: 10px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="85%" align="center" style="margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 8.5px; color: #4b5563;">
                            <tr>
                              <!-- Left Signature -->
                              <td width="35%" align="center" style="vertical-align: bottom;">
                                <div style="width: 100px; border-bottom: 1px solid #9ca3af; margin: 0 auto 5px auto; height: 1px;"></div>
                                <strong style="color: #0B2545; font-size: 8px;">Authorised Signatory</strong><br/>
                                <span style="color: #6b7280; font-size: 7.5px;">6A Skill City (OPC) Pvt. Ltd.</span>
                              </td>
                              <!-- Center Seal -->
                              <td width="30%" align="center" style="vertical-align: middle;">
                                <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto; background-color: #ffffff; border: 2px dashed #C5A880; border-radius: 50%; width: 55px; height: 55px;">
                                  <tr>
                                    <td align="center" style="vertical-align: middle; padding: 2px;">
                                      <table cellpadding="0" cellspacing="0" border="0" width="100%" height="100%" style="border: 1px solid #C5A880; border-radius: 50%; background-color: #FCFBF7;">
                                        <tr>
                                          <td align="center" style="vertical-align: middle; text-align: center;">
                                            <span style="font-size: 5px; font-weight: 900; color: #C5A880; text-transform: uppercase; line-height: 1;">OFFICIAL SEAL</span><br/>
                                            <span style="font-size: 6px; font-weight: 900; color: #0B2545; line-height: 1.2;">6A SKILL CITY</span><br/>
                                            <span style="font-size: 3.5px; font-weight: bold; color: #6b7280; text-transform: uppercase; line-height: 1;">APPLICATION POINT</span>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <!-- Right Signature -->
                              <td width="35%" align="center" style="vertical-align: bottom;">
                                <div style="width: 100px; border-bottom: 1px solid #9ca3af; margin: 0 auto 5px auto; height: 1px;"></div>
                                <strong style="color: #0B2545; font-size: 8px;">Director / Manager</strong><br/>
                                <span style="color: #6b7280; font-size: 7.5px;">Authorised Application Point</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Footer Navy Block -->
                      <tr>
                        <td style="padding-top: 15px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0B2545; text-align: center; color: #ffffff;">
                            <tr>
                              <td style="padding: 10px 15px; text-align: center;">
                                <p style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 7.5px; color: #d1d5db; border-bottom: 1px solid rgba(197, 168, 128, 0.3); padding-bottom: 4px; text-transform: uppercase; font-weight: bold;">
                                  This certificate is valid only with the official seal of 6A Skill City (OPC) Private Limited.
                                </p>
                                <p style="margin: 4px 0 0 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 7.5px; color: #e5e7eb; font-weight: 500;">
                                  6askillcity.com | partner@6askillcity.com | +91 983 33 31 014
                                </p>
                                <p style="margin: 2px 0 0 0; font-family: Georgia, serif; font-size: 7.5px; color: #cbd5e1;">
                                  Grace Tower, 1st Floor, Ernakulam North, Kerala — 682018
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    try {
      const pdfBuffer = await generateCertificatePDF(partner, letter);
      const filename = `Authorisation_Certificate_${partner.centerName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

      await sendEmail({
        email: partner.licenseeEmail,
        subject,
        message,
        html,
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: "application/pdf"
          }
        ]
      });
    } catch (err) {
      console.error("Failed to send renewed authorisation email:", err);
    }

    res.status(200).json({
      success: true,
      message: "Partner authorisation letter successfully renewed!",
      data: {
        ...partner.toObject(),
        authorisationLetter: letter,
      },
    });
  } catch (error) {
    next(error);
  }
};
