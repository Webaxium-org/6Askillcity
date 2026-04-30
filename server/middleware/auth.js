import User from "../models/user.js";
import AdmissionPoint from "../models/admissionPoint.js";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

export const requireAuth = async (req, res, next) => {
  try {
    const token = 
      req.cookies?.token || 
      req.cookies?.access__ || 
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);

    if (process.env.NODE_ENV === "production") {
      console.log(`Auth check - Token present: ${!!token}, Cookies: ${Object.keys(req.cookies || {}).join(", ")}`);
    }

    if (!token) {
      req.user = { isAuthenticated: false };
      return next(); // Continue without blocking
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = decoded?.id;

    // Check User model first
    let user = await User.findById(userId);
    let userType = "admin";

    // If not found, check AdmissionPoint
    if (!user) {
      user = await AdmissionPoint.findById(userId);
      userType = "partner";
    }

    if (!user) {
      req.user = { isAuthenticated: false };
      return next();
    }

    // Determine role, active state, name, email based on matched model
    let isActive = false;
    let name = "";
    let email = "";
    let role = "";

    if (userType === "admin") {
      isActive = user.isActive;
      name = user.fullName;
      email = user.email;
      role = user.role; // "admin", "manager", "editor"
    } else if (userType === "partner") {
      if (user.deleted) {
        throw createHttpError(403, "Partner account removed");
      }
      isActive = user.status === "approved";
      name = user.centerName; // or licenseeName
      email = user.licenseeEmail;
      role = "partner";
    }

    if (!isActive) {
      throw createHttpError(403, "Account suspended or not approved");
    }

    req.user = {
      userId: user._id,
      role: role,
      userType: userType,
      name: name,
      email: email,
      isAuthenticated: true,
    };

    next();
  } catch (error) {
    // Token invalid OR verify error → unauthorized
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(createHttpError(401, "Invalid or expired token"));
    }

    next(error);
  }
};

export const isAuthenticated = (req, res, next) => {
  try {
    if (!req.user || !req.user?.isAuthenticated) {
      throw createHttpError(401, "Authentication required");
    }

    return next();
  } catch (err) {
    next(err);
  }
};

export const isAuthorized = ({ roles = [], types = [] } = {}) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user?.isAuthenticated) {
         throw createHttpError(401, "Authentication required");
      }

      const userRole = req.user?.role;
      const userType = req.user?.userType;

      /* ---------- ROLE CHECK ---------- */
      if (roles.length && !roles.includes(userRole)) {
        throw createHttpError(403, "Forbidden: Insufficient role permissions");
      }

      /* ---------- TYPE CHECK ---------- */
      if (types.length && !types.includes(userType)) {
        throw createHttpError(403, "Forbidden: Insufficient type permissions");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
