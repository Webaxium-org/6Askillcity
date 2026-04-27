import Student from "../models/student.js";
import AdmissionPoint from "../models/admissionPoint.js";
import University from "../models/university.js";
import Payment from "../models/payment.js";
import Ticket from "../models/ticket.js";
import moment from "moment";

export const getAdminStats = async (req, res, next) => {
  try {
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

    // Chart Data: Monthly Revenue (Last 6 Months)
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = moment().subtract(i, "months").startOf("month").toDate();
      const endOfMonth = moment().subtract(i, "months").endOf("month").toDate();

      const monthlyRevenue = allPayments
        .filter(p => p.date >= startOfMonth && p.date <= endOfMonth)
        .reduce((acc, p) => acc + p.amount, 0);

      revenueData.push({
        name: moment().subtract(i, "months").format("MMM"),
        revenue: monthlyRevenue,
      });
    }

    // Chart Data: Monthly Enrollments (Last 6 Months)
    const enrollmentData = [];
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = moment().subtract(i, "months").startOf("month").toDate();
      const endOfMonth = moment().subtract(i, "months").endOf("month").toDate();

      const count = await Student.countDocuments({
        applicationStatus: "Eligible",
        updatedAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      enrollmentData.push({
        name: moment().subtract(i, "months").format("MMM"),
        students: count,
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
        enrollmentData
      }
    });
  } catch (error) {
    next(error);
  }
};
