import Notification from "../models/notification.js";
import createError from "http-errors";

// Get user's notifications
export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType === "partner" ? "AdmissionPoint" : "User";

    const limit = parseInt(req.query.limit) || 50;

    const notifications = await Notification.find({
      recipientId: userId,
      recipientModel: userType,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// Mark a single notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw createError(404, "Notification not found or unauthorized");
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read for the user
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { recipientId: userId, isDeleted: false, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    next(error);
  }
};

// Soft delete a notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: userId },
      { isDeleted: true },
      { new: true }
    );

    if (!notification) {
      throw createError(404, "Notification not found or unauthorized");
    }

    res.status(200).json({ success: true, message: "Notification deleted." });
  } catch (error) {
    next(error);
  }
};

// Soft delete all notifications
export const clearAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { recipientId: userId, isDeleted: false },
      { isDeleted: true }
    );

    res.status(200).json({ success: true, message: "All notifications cleared." });
  } catch (error) {
    next(error);
  }
};
