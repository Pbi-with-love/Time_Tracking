import Timestamp from "../models/Timestamp.js";
import mongoose from "mongoose";
import {
  getTimestampsByPeriod,
  totalTimeActiveForEachTask,
  totalTimeActiveForEachTaskDaily,
} from "../services/timestampByPeriod.Service.js";
import { AppError } from "../utils/AppError.js";

export const handleGetTimestampsByPeriod = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const timestamps = await getTimestampsByPeriod(period, startTime, endTime);

    res.status(200).json(timestamps);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const handleTotalTimeActiveForEachTask = async (req, res, next) => {
  try {
    const { taskId, period, startTime, endTime } = req.query;

    const totalTime = await totalTimeActiveForEachTask({
      taskId,
      period,
      startTime,
      endTime,
    });

    res.status(200).json({ totalTime });
  } catch (err) {
    next(err);
  }
};

export const handleTotalTimeActiveForAllTask = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const totalTime = await totalTimeActiveForEachTask({
      period,
      startTime,
      endTime,
    });

    res.status(200).json({ totalTime });
  } catch (err) {
    next(err);
  }
};

export const handleTotalTimeActiveForEachTasksDaily = async (req, res, next) => {
  try {
    const { period, startTime, endTime, taskId } = req.query;

    const totalTimePerDay = await totalTimeActiveForEachTaskDaily({
      taskId,
      period,
      startTime,
      endTime,
    });

    res.status(200).json({ totalTimePerDay });
  } catch (err) {
    next(err);
  }
};
