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
import University from "../models/university.js";


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
          $or: [
            { creatorId: partnerObjectId, creatorModel: "AdmissionPoint" },
            { assignedToPartner: partnerObjectId }
          ],
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
      return res.status(200).json({ 
        success: true, 
        data: [], 
        permittedHierarchy: { universities: [], programs: [], branches: [] } 
      });
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

    const universitySet = new Set(universityIds);
    const programSet = new Set(programIds);

    // 2. Fetch and filter Universities (always root level)
    const validUnis = await University.find({ _id: { $in: universityIds } })
      .select("name shortName logo")
      .lean();
    const validUniIds = validUnis.map(u => u._id.toString());

    // 3. Fetch and filter Programs (must have parent Uni permission)
    const validProgs = await Program.find({
      _id: { $in: programIds },
      university: { $in: validUniIds }
    }).populate("university", "name").lean();
    const validProgIds = validProgs.map(p => p._id.toString());

    // 4. Fetch explicitly permitted branches and verify full hierarchy (Uni -> Program -> Branch)
    const rawBranches = await Branch.find({
      _id: { $in: branchIds }
    })
    .populate({
      path: "program",
      populate: { path: "university" }
    })
    .lean();

    // Only show branches if they have permission across ALL levels
    const validBranches = rawBranches.filter(b => 
      programSet.has(b.program?._id?.toString()) &&
      universitySet.has(b.program?.university?._id?.toString())
    );

    // 5. Fetch current fees for each branch
    const branchesWithFees = await Promise.all(
      validBranches.map(async (b) => {
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
      permittedHierarchy: {
        universities: validUnis,
        programs: validProgs,
        branches: branchesWithFees
      }
    });
  } catch (error) {
    next(error);
  }
};
