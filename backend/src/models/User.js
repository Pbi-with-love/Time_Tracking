import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, match: [/^\S+@\S+\.\S+$/, "Invalid email"], trim: true },
    passwordHash: { type: String, required: true },
    username: { type: String, required: true, unique: true, trim: true },

    name: { type: String, trim: true, },

    dateOfBirth: {
      type: Date,
    },


    roles: {
      type: [String],
      enum: ["user", "admin"],
      default: ["user"],
    },

    profile: {
      avatarUrl: String,
      bio: String,
      caption: String,
      description: String,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, username: 1 });

export default mongoose.model("User", userSchema);