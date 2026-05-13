import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Ticket description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Postponed", "Closed"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    category: {
      type: String,
      enum: ["Student", "Finance", "University", "Other"],
      default: "Other",
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "creatorModel",
    },
    creatorModel: {
      type: String,
      required: true,
      enum: ["User", "AdmissionPoint"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedToPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionPoint",
    },
    postponedUntil: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "closedByModel",
      default: null,
    },
    closedByModel: {
      type: String,
      enum: ["User", "AdmissionPoint"],
      default: null,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Ticket", TicketSchema);
