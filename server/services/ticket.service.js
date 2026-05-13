import Ticket from "../models/ticket.js";
import TicketMessage from "../models/ticketMessage.js";
import { getIo } from "./socket.service.js";
import { sendToAdmins, sendToRecipient } from "./notification.service.js";

// Helper to standardise pagination and sorting
const getPaginationOptions = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;
  const sort = query.sort || "-createdAt";
  return { skip, limit, sort, page };
};

export const createTicket = async (data) => {
  const ticket = await Ticket.create(data);
  const populatedTicket = await Ticket.findById(ticket._id)
    .populate(
      "creatorId",
      "fullName email centerName licenseeName licenseeEmail",
    )
    .populate("assignedToPartner", "centerName licenseeName")
    .populate("studentId", "name enrollmentNumber");

  const io = getIo();
  if (io) {
    if (ticket.creatorModel === "AdmissionPoint") {
      // Notify all admins about a new ticket from a partner
      await sendToAdmins({ title: "New Support Ticket", message: `New ticket created: "${ticket.title}"`, type: "new_ticket", relatedId: ticket._id, link: "/dashboard/tickets" });
      io.to("admins").emit("new_ticket_created", populatedTicket);
    } else {
      if (ticket.assignedToPartner) {
        const partnerRoom = `AdmissionPoint_${ticket.assignedToPartner._id || ticket.assignedToPartner}`;
        await sendToRecipient(ticket.assignedToPartner._id || ticket.assignedToPartner, "AdmissionPoint", { title: "New Ticket Received", message: `Admin sent you a ticket: "${ticket.title}"`, type: "new_ticket", relatedId: ticket._id, link: "/dashboard/tickets" });
        io.to(partnerRoom).emit("new_ticket_created", populatedTicket);
      } else if (ticket.assignedTo) {
        const targetUserRoom = `User_${ticket.assignedTo._id || ticket.assignedTo}`;
        await sendToRecipient(ticket.assignedTo._id || ticket.assignedTo, "User", { title: "New Ticket Assigned", message: `You were assigned to ticket: "${ticket.title}"`, type: "new_ticket", relatedId: ticket._id, link: "/dashboard/tickets" });
        io.to(targetUserRoom).emit("new_ticket_created", populatedTicket);
      }
      // If User (Admin) creates it, maybe notify specific admins or just rely on list fetch
      await sendToAdmins({ title: "New Internal Ticket", message: `New ticket created: "${ticket.title}"`, type: "new_ticket", relatedId: ticket._id, link: "/dashboard/tickets" });
      io.to("admins").emit("new_ticket_created", populatedTicket);
    }
  }

  return populatedTicket;
};

export const getTickets = async (filter, query) => {
  const { skip, limit, sort, page } = getPaginationOptions(query);
  const total = await Ticket.countDocuments(filter);
  const tickets = await Ticket.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate(
      "creatorId",
      "fullName email centerName licenseeName licenseeEmail",
    )
    .populate("assignedToPartner", "centerName licenseeName")
    .populate("assignedTo", "fullName email")
    .populate("studentId", "name enrollmentNumber");

  return {
    tickets,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  };
};

export const getTicketMetrics = async (baseFilter) => {
  const total = await Ticket.countDocuments(baseFilter);
  const open = await Ticket.countDocuments({ ...baseFilter, status: "Open" });
  const inProgress = await Ticket.countDocuments({ ...baseFilter, status: "In Progress" });
  const postponed = await Ticket.countDocuments({ ...baseFilter, status: "Postponed" });
  const closed = await Ticket.countDocuments({ ...baseFilter, status: "Closed" });

  return { total, open, inProgress, postponed, closed };
};

export const getTicketById = async (ticketId, userId, userType) => {
  const ticket = await Ticket.findById(ticketId)
    .populate(
      "creatorId",
      "fullName email centerName licenseeName licenseeEmail",
    )
    .populate("assignedToPartner", "centerName licenseeName")
    .populate("assignedTo", "fullName email")
    .populate("closedBy", "fullName email centerName licenseeName")
    .populate("studentId", "name enrollmentNumber");

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  // Authorization check
  if (userType === "partner") {
    const userIdStr = userId.toString();
    const isCreator = ticket.creatorId._id.toString() === userIdStr;
    const isAssigned =
      ticket.assignedToPartner &&
      ticket.assignedToPartner._id.toString() === userIdStr;

    if (!isCreator && !isAssigned) {
      throw new Error("Unauthorized");
    }
  }

  const messages = await TicketMessage.find({ ticketId })
    .sort("createdAt")
    .populate(
      "senderId",
      "fullName email centerName licenseeName licenseeEmail",
    );

  return { ticket, messages };
};

export const updateTicketStatus = async (
  ticketId,
  status,
  postponedUntil,
  userId,
  userType,
) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new Error("Ticket not found");

  if (ticket.status === "Closed") {
    throw new Error("Cannot update status of a closed ticket");
  }

  if (userType !== "admin") {
    const userIdStr = userId.toString();
    const isCreator = ticket.creatorId.toString() === userIdStr;
    const isAssigned =
      ticket.assignedToPartner &&
      ticket.assignedToPartner.toString() === userIdStr;

    if (userType === "partner") {
      if (isCreator) {
        throw new Error("Unauthorized: You cannot update status of a ticket you created");
      }
      if (!isAssigned) {
        throw new Error("Unauthorized: You are not assigned to this ticket");
      }
    } else {
      // If it's some other non-admin type, reject
      throw new Error("Unauthorized: Only admins or assigned partners can update ticket status");
    }
  }

  ticket.status = status;
  if (status === "Postponed" && postponedUntil) {
    ticket.postponedUntil = new Date(postponedUntil);
  } else if (status !== "Postponed") {
    ticket.postponedUntil = null;
  }

  if (status === "Closed") {
    ticket.closedAt = new Date();
    ticket.closedBy = userId;
    ticket.closedByModel = userType === "admin" ? "User" : "AdmissionPoint";
  }

  await ticket.save();

  // Create status change message in history
  const statusMsg = await TicketMessage.create({
    ticketId,
    senderId: userId,
    senderModel: userType === "admin" ? "User" : "AdmissionPoint",
    message: `Updated ticket status to **${status}**${status === "Postponed" && postponedUntil ? ` (Until ${new Date(postponedUntil).toLocaleDateString()})` : ""}`,
  });

  const populatedMsg = await TicketMessage.findById(statusMsg._id).populate(
    "senderId",
    "fullName email centerName licenseeName licenseeEmail"
  );

  const io = getIo();
  if (io) {
    // Notify the other party
    let targetRoom;
    if (ticket.creatorModel === "AdmissionPoint") {
      targetRoom = `AdmissionPoint_${ticket.creatorId}`;
    } else if (ticket.assignedToPartner) {
      targetRoom = `AdmissionPoint_${ticket.assignedToPartner}`;
    } else if (ticket.assignedTo && ticket.assignedTo.toString() !== userId) {
      targetRoom = `User_${ticket.assignedTo}`;
    } else {
      targetRoom = `User_${ticket.creatorId}`;
    }

    const isSenderAdmin = userType === "admin";
    if (isSenderAdmin) {
      if (targetRoom && targetRoom !== `User_${userId}`) {
        io.to(targetRoom).emit("new_ticket_message", populatedMsg);
        const targetId = targetRoom.split("_")[1]; 
        const targetModel = targetRoom.split("_")[0]; 
        await sendToRecipient(targetId, targetModel, { title: "Ticket Status Updated", message: `Status changed to ${status}`, type: "ticket_status_updated", relatedId: ticket._id, link: "/dashboard/tickets" });
      }
      io.to("admins").emit("new_ticket_message", populatedMsg);
    } else {
      io.to("admins").emit("new_ticket_message", populatedMsg);
      await sendToAdmins({ title: "Ticket Status Updated", message: `Partner changed status to ${status}`, type: "ticket_status_updated", relatedId: ticket._id, link: "/dashboard/tickets" });
      // Echo back to partner's room
      io.to(`AdmissionPoint_${userId}`).emit("new_ticket_message", populatedMsg);
    }

    /* Removed redundant notification emit */

    // Broadcast ticket status update so UI can update lists
    io.to(targetRoom).emit("ticket_status_updated", {
      ticketId: ticket._id,
      status,
      postponedUntil: ticket.postponedUntil,
    });
    if (userType === "partner") {
      io.to("admins").emit("ticket_status_updated", {
        ticketId: ticket._id,
        status,
        postponedUntil: ticket.postponedUntil,
      });
    }
  }

  return ticket;
};

export const addMessageToTicket = async (
  ticketId,
  senderId,
  senderModel,
  message,
) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new Error("Ticket not found");

  const ticketMsg = await TicketMessage.create({
    ticketId,
    senderId,
    senderModel,
    message,
  });

  const populatedMsg = await TicketMessage.findById(ticketMsg._id).populate(
    "senderId",
    "fullName email centerName licenseeName licenseeEmail",
  );

  const io = getIo();
  if (io) {
    const isSenderAdmin = senderModel === "User";

    // Room of the target involved
    let targetRoom;
    if (ticket.creatorModel === "AdmissionPoint") {
      targetRoom = `AdmissionPoint_${ticket.creatorId}`;
    } else if (ticket.assignedToPartner) {
      targetRoom = `AdmissionPoint_${ticket.assignedToPartner}`;
    } else if (ticket.assignedTo) {
      targetRoom = `User_${ticket.assignedTo}`;
    }

    // If Admin sends message, notify the target (partner or assigned user)
    if (isSenderAdmin) {
      if (targetRoom && targetRoom !== `User_${senderId}`) {
        io.to(targetRoom).emit("new_ticket_message", populatedMsg);
        const targetId = targetRoom.split("_")[1]; const targetModel = targetRoom.split("_")[0]; await sendToRecipient(targetId, targetModel, { title: "New Message on Ticket", message: `New reply on ticket "${ticket.title}"`, type: "new_message", relatedId: ticket._id, link: "/dashboard/tickets" });
      }

      // Also broadcast to other admins observing the ticket
      io.to("admins").emit("new_ticket_message", populatedMsg);
    } else {
      // Partner sends message, notify Admins
      io.to("admins").emit("new_ticket_message", populatedMsg);
      await sendToAdmins({ title: "New Message on Ticket", message: `New reply from Partner on ticket "${ticket.title}"`, type: "new_message", relatedId: ticket._id, link: "/dashboard/tickets" });
      // And echo back to the partner's room (helpful for multiple sessions)
      if (targetRoom) {
        io.to(targetRoom).emit("new_ticket_message", populatedMsg);
      }
    }
  }

  return populatedMsg;
};
