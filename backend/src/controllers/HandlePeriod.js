import Timestamp from "../models/Timestamp.js";
import mongoose from "mongoose";
import {
  getTimestampsByPeriod,
} from "../services/timestampByPeriod.Service.js";
import { AppError } from "../utils/AppError.js";

// GET all timestamps
export const handleGetTimestampsByPeriod = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const timestamps = await getTimestampsByPeriod(
      period,
      startTime,
      endTime
    );
    
    res.status(200).json(timestamps);
  } catch (err) {
    next(err);
  }
};

