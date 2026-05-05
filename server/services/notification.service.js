import Notification from "../models/notification.js";
import User from "../models/user.js";
import { getIo } from "./socket.service.js";

/**
 * Sends a notification to all active admins.
 * @param {Object} data - { title, message, type, relatedId, link }
 */
export const sendToAdmins = async (data) => {
  try {
    const admins = await User.find({ role: "admin", isActive: true }).select("_id");
    if (!admins.length) return;

    const notificationsToInsert = admins.map((admin) => ({
      recipientId: admin._id,
      recipientModel: "User",
      title: data.title,
      message: data.message,
      type: data.type,
      relatedId: data.relatedId,
      link: data.link,
    }));

    const inserted = await Notification.insertMany(notificationsToInsert);

    const io = getIo();
    if (io) {
      // We can either emit to a global 'admins' room, or emit to each admin individually.
      // Emitting individually with their specific DB _id is safer if they need the exact DB document ID to mark it read.
      inserted.forEach((notif) => {
        io.to(`User_${notif.recipientId}`).emit("notification", notif);
      });
      // Also emit to the general admins room just in case
      io.to("admins").emit("notification_generic", data);
    }
  } catch (error) {
    console.error("Error sending notification to admins:", error);
  }
};

/**
 * Sends a notification to a specific recipient (User or AdmissionPoint).
 * @param {String} recipientId - The ObjectId of the user/partner
 * @param {String} recipientModel - 'User' or 'AdmissionPoint'
 * @param {Object} data - { title, message, type, relatedId, link }
 */
export const sendToRecipient = async (recipientId, recipientModel, data) => {
  try {
    const notification = await Notification.create({
      recipientId,
      recipientModel,
      title: data.title,
      message: data.message,
      type: data.type,
      relatedId: data.relatedId,
      link: data.link,
    });

    const io = getIo();
    if (io) {
      const room = `${recipientModel}_${recipientId}`;
      io.to(room).emit("notification", notification);
    }
    return notification;
  } catch (error) {
    console.error("Error sending notification to recipient:", error);
  }
};
