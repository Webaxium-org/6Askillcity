import Student from "../models/student.js";
import Payment from "../models/payment.js";
import Ticket from "../models/ticket.js";
import createError from "http-errors";
import moment from "moment";
import mongoose from "mongoose";
import PartnerPermission from "../models/partnerPermission.js";
import Program from "../models/program.js";
import ProgramFee from "../models/programFee.js";

export const getPartnerDashboardStats = async (req, res, next) => {
  try {
    const partnerId = req.user.userId;
    const partnerObjectId = new mongoose.Types.ObjectId(partnerId);

    // 1. Basic Stats
    const [totalStudents, totalApplications, activeTickets, totalRevenueData] =
      await Promise.all([
        Student.countDocuments({
          registeredBy: partnerId,
          applicationStatus: "Eligible",
        }),
        Student.countDocuments({ registeredBy: partnerId }),
        Ticket.countDocuments({
          partnerId,
          status: { $in: ["Open", "In Progress", "Postponed"] },
        }),
        Payment.aggregate([
          { $match: { partner: partnerObjectId } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    const totalRevenue =
      totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;

    // 2. Recent Applications (Last 5)
    const recentApplications = await Student.find({ registeredBy: partnerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("program", "name")
      .populate("university", "name");

    // 3. Recent Students (Eligible, Last 5)
    const recentStudents = await Student.find({
      registeredBy: partnerId,
      applicationStatus: "Eligible",
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("program", "name")
      .populate("university", "name");

    // 4. Enrollment Chart Data (Last 6 Months)
    const enrollmentData = [];
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = moment()
        .subtract(i, "months")
        .startOf("month")
        .toDate();
      const endOfMonth = moment().subtract(i, "months").endOf("month").toDate();
      const monthName = moment().subtract(i, "months").format("MMM");

      const count = await Student.countDocuments({
        registeredBy: partnerId,
        applicationStatus: "Eligible",
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      enrollmentData.push({ name: monthName, students: count });
    }

    // 5. Revenue Chart Data (Last 6 Months)
    const revenueChartData = [];
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = moment()
        .subtract(i, "months")
        .startOf("month")
        .toDate();
      const endOfMonth = moment().subtract(i, "months").endOf("month").toDate();
      const monthName = moment().subtract(i, "months").format("MMM");

      const revenueData = await Payment.aggregate([
        {
          $match: {
            partner: partnerObjectId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const monthlyRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
      revenueChartData.push({ name: monthName, revenue: monthlyRevenue });
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalApplications,
          activeTickets,
          totalRevenue,
        },
        recentApplications,
        recentStudents,
        enrollmentData,
        revenueChartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPermittedCourses = async (req, res, next) => {
  try {
    const partnerId = req.user.userId;
    const partnerObjectId = new mongoose.Types.ObjectId(partnerId);

    // 1. Get all active permissions for this partner
    const permissions = await PartnerPermission.find({
      partnerId: partnerObjectId,
      status: "active",
    });

    const programIds = new Set();
    const universityIds = new Set();

    permissions.forEach((p) => {
      if (p.type === "university" && p.universityId) {
        universityIds.add(p.universityId.toString());
      } else if (p.type === "program" && p.programId) {
        programIds.add(p.programId.toString());
      }
    });

    // 2. Fetch programs from universities
    const universityPrograms = await Program.find({
      university: { $in: Array.from(universityIds) },
      isActive: true,
    }).populate("university", "name");

    // 3. Fetch specific programs
    const specificPrograms = await Program.find({
      _id: { $in: Array.from(programIds) },
      isActive: true,
    }).populate("university", "name");

    // Combine and unique
    const allProgramsMap = new Map();
    [...universityPrograms, ...specificPrograms].forEach((p) => {
      allProgramsMap.set(p._id.toString(), p);
    });

    const allPrograms = Array.from(allProgramsMap.values());

    // 4. Fetch fees for each program
    const coursesWithFees = await Promise.all(
      allPrograms.map(async (p) => {
        const fee = await ProgramFee.findOne({
          program: p._id,
          isCurrent: true,
        });
        return {
          ...p.toObject(),
          fee,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: coursesWithFees,
    });
  } catch (error) {
    next(error);
  }
};
