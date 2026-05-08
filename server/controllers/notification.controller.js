import Notification from "../models/notification.js";
import createError from "http-errors";

// Get user's notifications (supports pagination)
export const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType === "partner" ? "AdmissionPoint" : "User";

    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const query = {
      recipientId: userId,
      recipientModel: userType,
      isDeleted: false,
    };

    // Optional filter by read status
    if (req.query.filter === "unread") query.isRead = false;
    if (req.query.filter === "read") query.isRead = true;

    const [notifications, totalCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lightweight unread count only
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType === "partner" ? "AdmissionPoint" : "User";

    const count = await Notification.countDocuments({
      recipientId: userId,
      recipientModel: userType,
      isDeleted: false,
      isRead: false,
    });

    res.status(200).json({ success: true, count });
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
