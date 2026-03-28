import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(new AppError("No token", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError("Invalid token", 401));
  }
};