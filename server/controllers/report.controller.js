import Student from "../models/student.js";
import Payment from "../models/payment.js";
import AdmissionPoint from "../models/admissionPoint.js";
import University from "../models/university.js";
import Program from "../models/program.js";
import mongoose from "mongoose";

export const getAcademicReport = async (req, res) => {
  try {
    const { groupBy } = req.query; // 'year', 'course', 'batch'
    
    let aggregation = [];
    
    if (groupBy === 'year') {
      aggregation = [
        {
          $group: {
            _id: "$completionYear",
            count: { $sum: 1 },
            students: { $push: { name: "$name", email: "$email", status: "$applicationStatus" } }
          }
        },
        { $sort: { _id: -1 } }
      ];
    } else if (groupBy === 'course') {
      aggregation = [
        {
          $lookup: {
            from: "programs",
            localField: "program",
            foreignField: "_id",
            as: "programDetails"
          }
        },
        { $unwind: "$programDetails" },
        {
          $group: {
            _id: "$programDetails.name",
            count: { $sum: 1 },
            students: { $push: { name: "$name", email: "$email", status: "$applicationStatus" } }
          }
        }
      ];
    }

    const data = await Student.aggregate(aggregation);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdmissionReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query; // 'daily', 'weekly', 'monthly', 'yearly', 'center'
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let grouping = {};
    if (type === 'daily') {
      grouping = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    } else if (type === 'weekly') {
      grouping = { $dateToString: { format: "%Y-W%V", date: "$createdAt" } };
    } else if (type === 'monthly') {
      grouping = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    } else if (type === 'yearly') {
      grouping = { $dateToString: { format: "%Y", date: "$createdAt" } };
    } else if (type === 'center') {
      const data = await Student.aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: "admissionpoints",
            localField: "registeredBy",
            foreignField: "_id",
            as: "center"
          }
        },
        { $unwind: "$center" },
        {
          $group: {
            _id: "$center.centerName",
            count: { $sum: 1 },
            students: { $push: { name: "$name", createdAt: "$createdAt" } }
          }
        }
      ]);
      return res.json({ success: true, data });
    }

    const data = await Student.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: grouping,
          count: { $sum: 1 },
          students: { $push: { name: "$name", email: "$email" } }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentReport = async (req, res) => {
  try {
    const { docType } = req.query; // 'affidavit', 'migration', 'general'
    
    let query = {};
    if (docType === 'affidavit') {
      query = { affidavit: { $exists: true, $ne: "" } };
    } else if (docType === 'migration') {
      query = { migrationCertificate: { $exists: true, $ne: "" } };
    }

    const data = await Student.find(query)
      .select("name email phone university program applicationStatus affidavit migrationCertificate")
      .populate("university", "name")
      .populate("program", "name");
      
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFinancialReport = async (req, res) => {
  try {
    const payments = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          transactions: { $push: "$$ROOT" }
        }
      }
    ]);

    if (!payments.length) return res.json({ success: true, data: { total: 0, splits: {} } });

    const total = payments[0].totalAmount;
    
    // Split logic: 6A (40%), Team (20%), University (40%) - example percentages
    const data = {
      total,
      splits: {
        to6A: total * 0.4,
        toTeam: total * 0.2,
        toUniversity: total * 0.4
      },
      transactions: payments[0].transactions
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeeWiseReport = async (req, res) => {
  try {
    const data = await Student.aggregate([
      {
        $lookup: {
          from: "programfees",
          localField: "programFee",
          foreignField: "_id",
          as: "feeDetails"
        }
      },
      { $unwind: { path: "$feeDetails", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$feeDetails.name",
          count: { $sum: 1 },
          totalPaid: { $sum: "$totalFeePaid" },
          totalExpected: { $sum: { $ifNull: ["$feeDetails.totalAmount", 0] } }
        }
      }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
