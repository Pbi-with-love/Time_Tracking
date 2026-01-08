import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
); 

export default mongoose.model("Tag", tagSchema);
