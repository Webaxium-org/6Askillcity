import Student from "../models/student.js";
import AdmissionPoint from "../models/admissionPoint.js";
import University from "../models/university.js";
import Payment from "../models/payment.js";
import Ticket from "../models/ticket.js";
import User from "../models/user.js";
import moment from "moment";
import createError from "http-errors";

export const getAdminStats = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || moment().year();
    const half = req.query.half || (moment().month() < 6 ? "H1" : "H2");

    const [
      totalStudents,
      totalPartners,
      totalUniversities,
      allPayments,
      pendingEligibilityCount,
      pendingPartnersCount,
      activeTicketsCount
    ] = await Promise.all([
      Student.countDocuments({ applicationStatus: "Eligible" }),
      AdmissionPoint.countDocuments({ status: "approved" }),
      University.countDocuments({ isActive: true }),
      Payment.find({}),
      Student.countDocuments({ applicationStatus: "Pending Eligibility" }),
      AdmissionPoint.countDocuments({ status: "pending" }),
      Ticket.countDocuments({ status: { $in: ["Open", "In Progress", "Postponed"] } })
    ]);

    const totalRevenue = allPayments.reduce((acc, p) => acc + p.amount, 0);

    const startMonth = half === "H1" ? 0 : 6;
    const endMonth = half === "H1" ? 5 : 11;

    // Chart Data: Monthly Revenue
    const revenueData = [];
    const enrollmentData = [];
    const applicationData = [];

    for (let m = startMonth; m <= endMonth; m++) {
      const monthDate = moment().year(year).month(m);
      const startOfMonth = monthDate.clone().startOf("month").toDate();
      const endOfMonth = monthDate.clone().endOf("month").toDate();

      // Revenue for this specific month
      const monthlyRevenue = allPayments
        .filter(p => p.date >= startOfMonth && p.date <= endOfMonth)
        .reduce((acc, p) => acc + p.amount, 0);

      revenueData.push({
        name: monthDate.format("MMM YY"),
        revenue: monthlyRevenue,
      });

      // Enrollment for this specific month
      const count = await Student.countDocuments({
        applicationStatus: "Eligible",
        updatedAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      enrollmentData.push({
        name: monthDate.format("MMM YY"),
        students: count,
      });

      // Application Submissions (createdAt)
      const appCount = await Student.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      applicationData.push({
        name: monthDate.format("MMM YY"),
        apps: appCount,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalPartners,
          totalUniversities,
          totalRevenue,
          pendingEligibilityCount,
          pendingPartnersCount,
          activeTicketsCount
        },
        revenueData,
        enrollmentData,
        applicationData
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw createError(404, "Admin profile not found");
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
