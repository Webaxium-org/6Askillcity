import Student from "../models/student.js";
import Payment from "../models/payment.js";
import Ticket from "../models/ticket.js";
import createError from "http-errors";
import moment from "moment";
import mongoose from "mongoose";
import PartnerPermission from "../models/partnerPermission.js";
import Program from "../models/program.js";
import Branch from "../models/branch.js";
import ProgramFee from "../models/programFee.js";

export const getPartnerDashboardStats = async (req, res, next) => {
  try {
    const partnerId = req.user.userId;
    const partnerObjectId = new mongoose.Types.ObjectId(partnerId);

    const year = parseInt(req.query.year) || moment().year();
    const half = req.query.half || (moment().month() < 6 ? "H1" : "H2");

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
      .populate("branch", "name duration type")
      .populate("university", "name");

    // 3. Recent Students (Eligible, Last 5)
    const recentStudents = await Student.find({
      registeredBy: partnerId,
      applicationStatus: "Eligible",
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("program", "name")
      .populate("branch", "name duration type")
      .populate("university", "name");

    const startMonth = half === "H1" ? 0 : 6;
    const endMonth = half === "H1" ? 5 : 11;

    // 4. Enrollment & Revenue Chart Data
    const enrollmentData = [];
    const revenueChartData = [];

    for (let m = startMonth; m <= endMonth; m++) {
      const monthDate = moment().year(year).month(m);
      const startOfMonth = monthDate.clone().startOf("month").toDate();
      const endOfMonth = monthDate.clone().endOf("month").toDate();
      const monthLabel = monthDate.format("MMM YY");

      // Enrollment count
      const count = await Student.countDocuments({
        registeredBy: partnerId,
        applicationStatus: "Eligible",
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });
      enrollmentData.push({ name: monthLabel, students: count });

      // Revenue aggregate
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
      revenueChartData.push({ name: monthLabel, revenue: monthlyRevenue });
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

    // 1. Get all active permissions for this partner
    const permissions = await PartnerPermission.find({
      partnerId: partnerId,
      status: "active",
    }).lean();

    if (!permissions.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    const universityIds = permissions
      .filter(p => p.type === "university" && p.universityId)
      .map(p => p.universityId.toString());
      
    const programIds = permissions
      .filter(p => p.type === "program" && p.programId)
      .map(p => p.programId.toString());
      
    const branchIds = permissions
      .filter(p => p.type === "branch" && p.branchId)
      .map(p => p.branchId.toString());

    // 2. Fetch programs for permitted universities
    let allProgramIds = new Set(programIds);
    if (universityIds.length > 0) {
      const programsInUnis = await Program.find({ 
        university: { $in: universityIds } 
      }).select("_id").lean();
      programsInUnis.forEach(p => allProgramIds.add(p._id.toString()));
    }
    
    // 3. Fetch all permitted branches
    const allBranches = await Branch.find({
      $or: [
        { program: { $in: Array.from(allProgramIds) } },
        { _id: { $in: branchIds } }
      ]
    })
    .populate({
      path: "program",
      populate: { path: "university" }
    })
    .lean();

    // 4. Fetch current fees for each branch
    const branchesWithFees = await Promise.all(
      allBranches.map(async (b) => {
        const fee = await ProgramFee.findOne({
          branch: b._id,
          isCurrent: true,
        }).lean();
        return {
          ...b,
          fee,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: branchesWithFees,
    });
  } catch (error) {
    next(error);
  }
};
