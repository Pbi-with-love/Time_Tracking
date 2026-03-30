import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new AppError("No token", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError("Invalid token", 401));
  }
};
