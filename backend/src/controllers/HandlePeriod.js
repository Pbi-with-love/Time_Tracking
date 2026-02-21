import Timestamp from "../models/Timestamp.js";
import mongoose from "mongoose";
import {
  getTimestampsByPeriod,
  totalTimeActiveForEachTask,
  totalTimeActiveForAllTask,
  totalTimeActiveForEachTaskDaily,
  totalTimeActiveForAllTaskDaily,
  totalTimeActiveForAllTaskPerHour,
  totalTimeActiveForEachTag,
  getMostProductive,
  getMostActiveStreak,
  getTaskStartStats
} from "../services/timestampByPeriod.Service.js";
import { AppError } from "../utils/AppError.js";

export const handleGetTimestampsByPeriod = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const { timestamps } = await getTimestampsByPeriod(
      { period, startTime, endTime }
    );

    res.status(200).json(timestamps);
  } catch (err) {
    next(err);
  }
};

export const handleTotalTimeActiveForEachTask = async (req, res, next) => {
  try {
    const { taskId, period, startTime, endTime } = req.query;

    const { total } = await totalTimeActiveForEachTask({
      taskId,
      period,
      startTime,
      endTime,
    });

    res.status(200).json({ totalTime: total });
  } catch (err) {
    next(err);
  }
};

export const handleTotalTimeActiveForAllTask = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const { total } = await totalTimeActiveForAllTask({
      period,
      startTime,
      endTime,
    });

    res.status(200).json({ totalTime: total });
  } catch (err) {
    next(err);
  }
};

export const handleTotalTimeActiveForEachTasksDaily = async (
  req,
  res,
  next,
) => {
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

export const handleTotalTimeActiveForAllTasksDaily = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const totalTimePerDay = await totalTimeActiveForAllTaskDaily({
      period,
      startTime,
      endTime,
    });

    res.status(200).json({ totalTimePerDay });
  } catch (err) {
    next(err);
  }
};

export const handleTotalTimeActiveForAllTasksPerHour = async (req, res, next) => {
  try {
    const hours = await totalTimeActiveForAllTaskPerHour();

    res.status(200).json({ hours });
  } catch (err) {
    next(err);
  }
};

export const handleTotalTimeActiveForEachTag = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const tagTotals = await totalTimeActiveForEachTag({period, startTime, endTime});

    res.status(200).json({tagTotals})
  } catch (err) {
    next(err);
  }
}

export const handleMostProductiveDay = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const mostProductiveDay = await getMostProductive({period, startTime, endTime});
    res.status(200).json({ mostProductiveDay })
  } catch (err) {
    next(err)
  }
}

export const handleMostActiveStreak = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const mostActiveStreak = await getMostActiveStreak({period, startTime, endTime});
    res.status(200).json({ mostActiveStreak })
  } catch (err) {
    next(err)
  }
}

export const handleTaskStartStats = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const taskStartStats = await getTaskStartStats({period, startTime, endTime});
    res.status(200).json({ taskStartStats })
  } catch (err) {
    next(err)
  }
}
