import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

// Serves Tag.find({ user }) — tags are always read for a single owner
tagSchema.index({ user: 1 });

export default mongoose.model("Tag", tagSchema);
