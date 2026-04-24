import User from "../models/user.js";
import AdmissionPoint from "../models/admissionPoint.js";
import generateToken from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import createError from "http-errors";

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
    }).select("+password");

    if (partner.status !== "approved") {
      throw createError(401, "Your account is not approved");
    }

    if (!partner) {
      throw createError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, partner?.password);
    if (!isMatch) {
      throw createError(401, "Invalid credentials");
    }

    partner.password = undefined;

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
