import User from "../../models/User.js";
import { AppError } from "../../utils/AppError.js";
import { sanitizeUser } from "../../utils/sanitizeUser.js";

export const getUserDetailService = async (userId) => {
  const user = await User.findById(userId).lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return sanitizeUser(user);
};