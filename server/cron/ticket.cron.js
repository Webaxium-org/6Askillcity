import cron from "node-cron";
import Ticket from "../models/ticket.js";
import { getIo } from "../services/socket.service.js"; // We will create this

export const initTicketCron = () => {
  // Run every minute to check for postponed tickets that have reached their trigger time
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      // Find tickets that are Postponed and postponedUntil is in the past
      const ticketsToReopen = await Ticket.find({
        status: "Postponed",
        postponedUntil: { $lte: now, $ne: null },
      });

      if (ticketsToReopen.length === 0) return;

      for (const ticket of ticketsToReopen) {
        ticket.status = "Open";
        ticket.postponedUntil = null;
        await ticket.save();

        const io = getIo();
        if (io) {
          // Notify the creator
          io.to(`${ticket.creatorModel}_${ticket.creatorId.toString()}`).emit(
            "notification",
            {
              type: "ticket_reopened",
              title: "Ticket Reopened",
              message: `Your postponed ticket "${ticket.title}" is now Open.`,
              ticketId: ticket._id,
            }
          );
          
          // Notify the assigned to if exists
          if (ticket.assignedTo) {
             io.to(`User_${ticket.assignedTo.toString()}`).emit(
              "notification",
              {
                type: "ticket_reopened",
                title: "Ticket Reopened",
                message: `Ticket "${ticket.title}" assigned to you is now Open.`,
                ticketId: ticket._id,
              }
            );
          }
        }
      }
      
      console.log(`Cron: Reopened ${ticketsToReopen.length} postponed ticket(s)`);
    } catch (error) {
      console.error("Cron Error: Failed to check postponed tickets", error);
    }
  });
};
