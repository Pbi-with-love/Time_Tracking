import mongoose from "mongoose";

const taskOrderSchema = new mongoose.Schema({
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

taskOrderSchema.index({ scope: 1, tags: 1 }, { unique: true });

export default mongoose.model("TaskOrder", taskOrderSchema);
