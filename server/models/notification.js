import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel",
    },
    recipientModel: {
      type: String,
      enum: ["User", "AdmissionPoint"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      // Examples: 'application_submitted', 'application_approved', 'application_rejected', 'payment_completed', 'new_ticket', 'ticket_status_updated'
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId, // Generic ID pointing to the ticket, application, etc.
    },
    link: {
      type: String, // Frontend path to redirect to when clicked
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for faster querying since this collection might grow
NotificationSchema.index({ recipientId: 1, isDeleted: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, isRead: 1 });

export default mongoose.model("Notification", NotificationSchema);
