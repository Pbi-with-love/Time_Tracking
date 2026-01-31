import mongoose from "mongoose";

const timestampSchema = new mongoose.Schema(
  {
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

timestampSchema.index({ task: 1, timestamp: -1 });
timestampSchema.index({ startRef: 1 });


export default mongoose.model("Timestamp", timestampSchema);
