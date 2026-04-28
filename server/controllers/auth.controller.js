import User from "../models/user.js";
import AdmissionPoint from "../models/admissionPoint.js";
import generateToken from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import createError from "http-errors";
import ActivityLog from "../models/activityLog.js";

const sendTokenResponse = (user, statusCode, rememberMe, res, role) => {
  const token = generateToken(user._id, rememberMe);
  const days = rememberMe ? 3 : 1;

  const options = {
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    httpOnly: true,
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
