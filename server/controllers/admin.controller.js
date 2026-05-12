import Student from "../models/student.js";
import AdmissionPoint from "../models/admissionPoint.js";
import University from "../models/university.js";
import Payment from "../models/payment.js";
import Ticket from "../models/ticket.js";
import User from "../models/user.js";
import ServiceApplication from "../models/serviceApplication.js";
import ServiceDefinition from "../models/serviceDefinition.js";
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
      activeTicketsCount,
      rejectedApplicationsCount,
      newApplicationsTodayCount,
      feeStats,
      onProgressCount,
      enrolledCount,
      cancelledCount,
      serviceStatusStats,
      serviceTitleStats,
      allServiceDefinitions,
      newTicketsTodayCount,
      openTicketsCount,
      postponedTicketsCount,
      closedTicketsCount,
    ] = await Promise.all([
      Student.countDocuments({ applicationStatus: "Eligible" }),
      AdmissionPoint.countDocuments({ status: "approved" }),
      University.countDocuments({ isActive: true }),
      Payment.find({}),
      Student.countDocuments({ applicationStatus: "Pending Eligibility" }),
      AdmissionPoint.countDocuments({ status: "pending" }),
      Ticket.countDocuments({
        status: { $in: ["Open", "In Progress", "Postponed"] },
      }),
      Student.countDocuments({ applicationStatus: "Rejected" }),
      Student.countDocuments({
        createdAt: { $gte: moment().startOf("day").toDate() },
        applicationStatus: "Pending Eligibility",
      }),
      Student.aggregate([
        { $match: { deleted: { $ne: true }, applicationStatus: "Eligible" } },
        {
          $lookup: {
            from: "programfees",
            localField: "programFee",
            foreignField: "_id",
            as: "feeInfo",
          },
        },
        { $unwind: { path: "$feeInfo", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            completedCount: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] },
            },
            partialPaidTotal: {
              $sum: {
                $cond: [
                  { $ne: ["$paymentStatus", "Paid"] },
                  "$totalFeePaid",
                  0,
                ],
              },
            },
            pendingFeeTotal: {
              $sum: {
                $cond: [
                  { $ne: ["$paymentStatus", "Paid"] },
                  {
                    $subtract: [
                      { $ifNull: ["$feeInfo.totalFee", 0] },
                      "$totalFeePaid",
                    ],
                  },
                  0,
                ],
              },
            },
          },
        },
      ]),
      Student.countDocuments({
        $or: [
          { status: "On Progress" },
          { status: { $exists: false } },
          { status: null },
        ],
        applicationStatus: "Eligible",
        deleted: { $ne: true },
      }),
      Student.countDocuments({
        status: "Enrolled",
        applicationStatus: "Eligible",
        deleted: { $ne: true },
      }),
      Student.countDocuments({
        status: "Cancelled",
        applicationStatus: "Eligible",
        deleted: { $ne: true },
      }),
      ServiceApplication.aggregate([
        {
          $group: {
            _id: null,
            wholePaid: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] },
            },
            partialPaid: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "Partially Paid"] }, 1, 0],
              },
            },
            unpaid: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "Unpaid"] }, 1, 0] },
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ["$status", "Pending Applications"] }, 1, 0],
              },
            },
            progress: {
              $sum: {
                $cond: [{ $eq: ["$status", "Application On Progress"] }, 1, 0],
              },
            },
            received: {
              $sum: {
                $cond: [{ $eq: ["$status", "Documents Received"] }, 1, 0],
              },
            },
            sent: {
              $sum: {
                $cond: [{ $eq: ["$status", "Documents Sent Courier"] }, 1, 0],
              },
            },
          },
        },
      ]),
      ServiceApplication.aggregate([
        {
          $lookup: {
            from: "servicedefinitions",
            localField: "service",
            foreignField: "_id",
            as: "serviceInfo",
          },
        },
        { $unwind: "$serviceInfo" },
        {
          $group: {
            _id: "$serviceInfo.title",
            wholePaid: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] },
            },
            partialPaid: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "Partially Paid"] }, 1, 0],
              },
            },
            unpaid: {
              $sum: { $cond: [{ $eq: ["$paymentStatus", "Unpaid"] }, 1, 0] },
            },
            pending: {
              $sum: {
                $cond: [{ $eq: ["$status", "Pending Applications"] }, 1, 0],
              },
            },
            progress: {
              $sum: {
                $cond: [{ $eq: ["$status", "Application On Progress"] }, 1, 0],
              },
            },
            received: {
              $sum: {
                $cond: [{ $eq: ["$status", "Documents Received"] }, 1, 0],
              },
            },
            sent: {
              $sum: {
                $cond: [{ $eq: ["$status", "Documents Sent Courier"] }, 1, 0],
              },
            },
          },
        },
      ]),
      ServiceDefinition.find({ status: "Active" }),
      Ticket.countDocuments({
        createdAt: { $gte: moment().startOf("day").toDate() },
      }),
      Ticket.countDocuments({ status: "Open" }),
      Ticket.countDocuments({ status: "Postponed" }),
      Ticket.countDocuments({ status: "Closed" }),
    ]);

    const srvStats = serviceStatusStats[0] || null;
    const documentStats = {
      wholePaid: srvStats?.wholePaid || 0,
      partialPaid: srvStats?.partialPaid || 0,
      unpaid: srvStats?.unpaid || 0,
      pending: srvStats?.pending || 0,
      progress: srvStats?.progress || 0,
      received: srvStats?.received || 0,
      sent: srvStats?.sent || 0,
    };

    const certificateStats = serviceTitleStats || [];

    // Ensure all active services show up
    const serviceStats = allServiceDefinitions.map((def) => {
      const stats = serviceTitleStats.find((s) => s._id === def.title);
      return (
        stats || {
          _id: def.title,
          wholePaid: 0,
          partialPaid: 0,
          unpaid: 0,
          pending: 0,
          progress: 0,
          received: 0,
          sent: 0,
        }
      );
    });

    const fStats = feeStats[0] || {
      completedCount: 0,
      partialPaidTotal: 0,
      pendingFeeTotal: 0,
    };
    const courseFeeStats = {
      completedCount: fStats.completedCount,
      partialPaidTotal: fStats.partialPaidTotal,
      pendingFeeTotal: Math.max(0, fStats.pendingFeeTotal),
      totalFee: fStats.partialPaidTotal + Math.max(0, fStats.pendingFeeTotal),
    };

    const lifecycleStats = {
      onProgress: onProgressCount,
      enrolled: enrolledCount,
      cancelled: cancelledCount,
    };

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
        .filter((p) => p.date >= startOfMonth && p.date <= endOfMonth)
        .reduce((acc, p) => acc + p.amount, 0);

      revenueData.push({
        name: monthDate.format("MMM YY"),
        revenue: monthlyRevenue,
      });

      // Enrollment for this specific month
      const count = await Student.countDocuments({
        applicationStatus: "Eligible",
        updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      enrollmentData.push({
        name: monthDate.format("MMM YY"),
        students: count,
      });

      // Application Submissions (createdAt)
      const appCount = await Student.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
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
          activeTicketsCount,
          rejectedApplicationsCount,
          approvedApplicationsCount: totalStudents,
          newApplicationsTodayCount,
          courseFeeStats,
          lifecycleStats,
          documentStats,
          certificateStats,
          serviceStats,
          newTicketsTodayCount,
          openTicketsCount,
          postponedTicketsCount,
          closedTicketsCount,
        },
        revenueData,
        enrollmentData,
        applicationData,
      },
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
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
