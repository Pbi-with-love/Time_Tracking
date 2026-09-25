import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true }
);

// Serves Task.find({ user }) via the prefix, and Task.find({ user, tags })
taskSchema.index({ user: 1, tags: 1 });

// Legacy: supports the currently unscoped Task.find({ tags }) lookup.
// Drop this once getTasksByTagId is scoped to the requesting user.
taskSchema.index({ tags: 1 });

export default mongoose.model("Task", taskSchema);
