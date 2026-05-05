import User from "../models/user.js";
import AdmissionPoint from "../models/admissionPoint.js";
import generateToken from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import createError from "http-errors";
import ActivityLog from "../models/activityLog.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

const sendTokenResponse = (user, statusCode, rememberMe, res, role) => {
  const token = generateToken(user._id, rememberMe);
  const days = rememberMe ? 3 : 1;

  const options = {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message: "Login successful",
    token,
    role,
    data: user,
  });
};

export const loginUser = async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    throw createError(400, "Please provide an email and password");
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw createError(401, "Invalid credentials");
    }

    user.password = undefined;

    sendTokenResponse(
      user,
      200,
      rememberMe === true || rememberMe === "true",
      res,
      "user",
    );
  } catch (error) {
    next(error);
  }
};

export const loginAdmissionPoint = async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    throw createError(400, "Please provide email and password");
  }

  try {
    const partner = await AdmissionPoint.findOne({
      licenseeEmail: email,
      deleted: false,
    }).select("+password +adminAccessToken +adminAccessTokenExpires");

    if (!partner) {
      throw createError(401, "Invalid credentials");
    }

    if (partner.status !== "approved") {
      throw createError(401, "Your account is not approved");
    }

    let loginViaToken = false;
    const isMatch = await bcrypt.compare(password, partner?.password);
    
    if (!isMatch) {
      // Check for admin access token
      if (partner.adminAccessToken && 
          partner.adminAccessToken === password && 
          partner.adminAccessTokenExpires > new Date()) {
        loginViaToken = true;
      } else {
        throw createError(401, "Invalid credentials");
      }
    }

    // Log token usage if applicable
    if (loginViaToken) {
      await ActivityLog.create({
        action: "ADMIN_TOKEN_LOGIN",
        details: `Admin logged in to partner ${partner.centerName} using access token`,
        performedBy: partner._id, // Ideally we'd know which admin, but we are login as partner now. 
        // Actually, the token was created by an admin.
        targetType: "AdmissionPoint",
        targetId: partner._id
      });
      
      // Clear token after use (one-time use for security)
      partner.adminAccessToken = undefined;
      partner.adminAccessTokenExpires = undefined;
      await partner.save();
    }

    partner.password = undefined;
    partner.adminAccessToken = undefined;
    partner.adminAccessTokenExpires = undefined;

    sendTokenResponse(
      partner,
      200,
      rememberMe === true || rememberMe === "true",
      res,
      "admissionPoint",
    );
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password Flow
export const forgotPassword = async (req, res, next) => {
  try {
    const { email, userType } = req.body;
    if (!email || !userType) {
      throw createError(400, "Please provide email and user type");
    }

    const Model = userType === "partner" ? AdmissionPoint : User;
    const emailField = userType === "partner" ? "licenseeEmail" : "email";

    const user = await Model.findOne({ [emailField]: email });

    if (!user) {
      throw createError(404, "There is no user with that email address.");
    }

    // Generate a 6-digit OTP
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP and set expiration to 10 minutes from now
    user.resetPasswordOTP = await bcrypt.hash(resetOTP, 10);
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    
    // AdmissionPoint schema requires these on save if they trigger validations, so we just save modified fields
    await user.save({ validateBeforeSave: false });

    // Send it to user's email
    const message = `Your password reset OTP is: ${resetOTP}\nThis OTP is valid for 10 minutes.`;
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
        <h2 style="color: #6d28d9; text-align: center; font-size: 24px; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          We received a request to reset your password. Use the OTP below to proceed with resetting your password:
        </p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${resetOTP}</span>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 30px;">
          This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.
        </p>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} 6A Skillcity. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user[emailField],
        subject: "6A Skillcity - Password Reset OTP",
        message,
        html: htmlMessage,
      });

      res.status(200).json({
        success: true,
        message: "OTP sent to email successfully",
      });
    } catch (err) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      console.error(err);
      throw createError(500, "There was an error sending the email. Try again later!");
    }
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, userType } = req.body;

    if (!email || !otp || !userType) {
      throw createError(400, "Please provide email, OTP, and user type");
    }

    const Model = userType === "partner" ? AdmissionPoint : User;
    const emailField = userType === "partner" ? "licenseeEmail" : "email";

    const user = await Model.findOne({
      [emailField]: email,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordOTP");

    if (!user) {
      throw createError(400, "OTP is invalid or has expired");
    }

    const isMatch = await bcrypt.compare(otp.toString(), user.resetPasswordOTP);

    if (!isMatch) {
      throw createError(400, "Invalid OTP");
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, userType } = req.body;

    if (!email || !otp || !newPassword || !userType) {
      throw createError(400, "Please provide all required fields");
    }

    const Model = userType === "partner" ? AdmissionPoint : User;
    const emailField = userType === "partner" ? "licenseeEmail" : "email";

    const user = await Model.findOne({
      [emailField]: email,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordOTP +password");

    if (!user) {
      throw createError(400, "OTP is invalid or has expired");
    }

    const isMatch = await bcrypt.compare(otp.toString(), user.resetPasswordOTP);

    if (!isMatch) {
      throw createError(400, "Invalid OTP");
    }

    // Update password
    if (userType === "partner") {
      user.password = await bcrypt.hash(newPassword, 12);
    } else {
      user.password = newPassword; // User model has pre-save hook
    }
    
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Send confirmation email
    const successHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
        <h2 style="color: #059669; text-align: center; font-size: 24px; margin-bottom: 20px;">Password Reset Successful</h2>
        <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          Hello,
        </p>
        <p style="color: #334155; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          This is a confirmation that the password for your 6A Skillcity account has been successfully changed.
        </p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 20px;">
          <p style="color: #166534; font-weight: bold; margin: 0;">If you did not make this change, please contact our support team immediately.</p>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 30px;">
          You can now log in with your new password.
        </p>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} 6A Skillcity. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user[emailField],
        subject: "6A Skillcity - Password Reset Successful",
        message: "Your password has been successfully reset.",
        html: successHtml,
      });
    } catch (err) {
      console.error("Error sending reset confirmation email:", err);
      // We don't throw here because the password IS reset successfully
    }

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    next(error);
  }
};
