const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },

    name: String,

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


export default mongoose.model("User", userSchema);