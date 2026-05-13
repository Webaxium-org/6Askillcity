import * as ticketService from "../services/ticket.service.js";
import createError from "http-errors";
import moment from "moment";

export const createTicket = async (req, res, next) => {
  try {
    const { title, description, priority, category, assignedToPartner, assignedTo } =
      req.body;
    const creatorId = req.user.userId;
    // Map userType from auth middleware to the Model name
    const creatorModel =
      req.user.userType === "admin" ? "User" : "AdmissionPoint";

    const ticket = await ticketService.createTicket({
      title,
      description,
      priority,
      creatorId,
      creatorModel,
      assignedToPartner,
      assignedTo,
      category,
      studentId: req.body.studentId,
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const filter = {};

    // If partner, they can only see their own tickets or tickets assigned to them
    if (req.user.userType === "partner") {
      filter.$or = [
        { creatorId: req.user.userId, creatorModel: "AdmissionPoint" },
        { assignedToPartner: req.user.userId },
      ];
    }

    // Admins can see all by default, or filter by status/priority if provided in query
    if (req.query.status && req.query.status !== "All") {
      filter.status = req.query.status;
    }

    if (req.query.studentId) {
      filter.studentId = req.query.studentId;
    }

    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    if (req.query.startDate && req.query.endDate) {
      let dateField = "createdAt";
      if (req.query.status === "Postponed") {
        dateField = "postponedUntil";
      } else if (req.query.status === "Closed") {
        dateField = "closedAt";
      }

      filter[dateField] = {
        $gte: moment(req.query.startDate).startOf("day").toDate(),
        $lte: moment(req.query.endDate).endOf("day").toDate(),
      };
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      // Search by title or description or priority
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { priority: searchRegex },
        ],
      });
    }

    const result = await ticketService.getTickets(filter, req.query);

    res.status(200).json({
      success: true,
      data: result.tickets,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const result = await ticketService.getTicketById(
      ticketId,
      req.user.userId,
      req.user.userType,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketMetrics = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.userType === "partner") {
      filter.$or = [
        { creatorId: req.user.userId, creatorModel: "AdmissionPoint" },
        { assignedToPartner: req.user.userId },
      ];
    }

    const metrics = await ticketService.getTicketMetrics(filter);

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status, postponedUntil } = req.body;

    const ticket = await ticketService.updateTicketStatus(
      ticketId,
      status,
      postponedUntil,
      req.user.userId,
      req.user.userType,
    );

    res.status(200).json({
      success: true,
      message: "Ticket status updated",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const addMessage = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message) {
      throw createError(400, "Message is required");
    }

    const senderId = req.user.userId;
    const senderModel =
      req.user.userType === "admin" ? "User" : "AdmissionPoint";

    // Simple auth check via service layer or inside controller
    // If partner, ensure they own the ticket
    if (req.user.userType === "partner") {
      const ticketResult = await ticketService.getTicketById(
        ticketId,
        req.user.userId,
        req.user.userType,
      );
      if (!ticketResult.ticket) {
        throw createError(404, "Ticket not found");
      }
    }

    const newMsg = await ticketService.addMessageToTicket(
      ticketId,
      senderId,
      senderModel,
      message,
    );

    res.status(201).json({
      success: true,
      message: "Message added",
      data: newMsg,
    });
  } catch (error) {
    next(error);
  }
};
