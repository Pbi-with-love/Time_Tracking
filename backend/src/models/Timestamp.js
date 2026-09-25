import mongoose from "mongoose";

const timestampSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    type: {
      type: String,
      enum: ["start", "end"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now, required: true },
    startRef: { type: mongoose.Schema.Types.ObjectId, ref: "Timestamp" },
  },
  { timestamps: true }
);

// Per-task reads, and the "latest unmatched start" lookup when closing an interval
timestampSchema.index({ user: 1, task: 1, timestamp: -1 });

// Period range queries: find({ user, type, timestamp: { $gte/$lte: ... } })
timestampSchema.index({ user: 1, type: 1, timestamp: 1 });

// Resolving paired starts (startRef $in [...]) and the "already closed" check
timestampSchema.index({ startRef: 1 });

export default mongoose.model("Timestamp", timestampSchema);
