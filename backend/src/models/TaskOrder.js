import mongoose from "mongoose";

const taskOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  scope: {
    type: String,
    enum: ["default", "earliest", "latest"],
    required: true,
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],
  order: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
  ],
});

// One saved order per (owner, scope, tag set)
taskOrderSchema.index({ user: 1, scope: 1, tags: 1 }, { unique: true });

export default mongoose.model("TaskOrder", taskOrderSchema);
