import User from "../models/user.js";
import AdmissionPoint from "../models/admissionPoint.js";
import generateToken from "../utils/jwt.js";
import bcrypt from "bcryptjs";

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
    return res
      .status(400)
      .json({
        success: false,
        message: "Please provide an email and password",
      });
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

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
    return res
      .status(400)
      .json({ success: false, message: "Please provide email and password" });
  }

  try {
    const partner = await AdmissionPoint.findOne({
      licenseeEmail: email,
    }).select("+password");

    if (!partner) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (partner.password) {
      const isMatch = await bcrypt.compare(password, partner.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
    } else {
      // Mock logic if no password is set yet during dev
      if (password !== "admin") {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials." });
      }
    }

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
