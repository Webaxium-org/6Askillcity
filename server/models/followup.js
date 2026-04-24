import mongoose from "mongoose";

/**
 * Followup Collection
 * Stores timestamped follow-up notes attached to a Student (Application).
 * Both admins and partners can log followups.
 */
const FollowupSchema = new mongoose.Schema(
  {
    // The student/application this followup belongs to
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    // The person who logged this note
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Either "admin" | "partner" — determines which collection authorId references
    authorType: {
      type: String,
      enum: ["admin", "partner"],
      required: true,
    },

    // Display name of the author at time of writing (denormalised for speed)
    authorName: {
      type: String,
      required: true,
    },

    // The actual follow-up note
    note: {
      type: String,
      required: [true, "Follow-up note cannot be empty"],
      trim: true,
      maxlength: [2000, "Follow-up note cannot exceed 2000 characters"],
    },

    // Optional category tag for filtering
    category: {
      type: String,
      enum: ["general", "document", "eligibility", "callback", "other"],
      default: "general",
    },
    
    // Scheduling: When is the next interaction planned?
    nextFollowupDate: {
      type: Date,
      index: true,
    },

    // Soft delete
    deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Followup", FollowupSchema);
