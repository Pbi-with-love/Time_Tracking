import Timestamp from "../models/Timestamp.js";
import mongoose from "mongoose";
import {
  getTimestampsByPeriod,
  totalTimeActiveForEachTask,
  totalTimeActiveForAllTask,
  totalTimeActiveForEachTaskDaily,
  totalTimeActiveForAllTasksDaily,
  totalTimeActiveForAllTasksPerHour,
  totalTimeActiveForEachTag,
  getMostProductive,
  getMostActiveStreak,
  getTaskStartStats,
  checkNewIntervalOverlap
} from "../services/timestampByPeriod.Service.js";
import {
  getTasksOfInterest,
  getTaskDailyBarChart
} from "../services/taskInterval.Service.js"
import {
  getTagsOfInterest
} from "../services/tagInterval.Service.js"

// Every handler below is scoped to the authenticated user via req.user.id

export const handleGetTimestampsByPeriod = async (req, res, next) => {
  try {
    const { period, startTime, endTime, taskId } = req.query;

    const { timestamps } = await getTimestampsByPeriod(
      { userId: req.user.id, period, startTime, endTime, taskId }
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
      userId: req.user.id,
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

    const { total, taskTotalsTs } = await totalTimeActiveForAllTask({
      userId: req.user.id,
      period,
      startTime,
      endTime,
    });

    res.status(200).json({ totalTime: total, taskTotalsTs });
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
      userId: req.user.id,
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

    const totalTimePerDay = await totalTimeActiveForAllTasksDaily({
      userId: req.user.id,
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
    const hours = await totalTimeActiveForAllTasksPerHour({
      userId: req.user.id,
    });

    res.status(200).json({ hours });
  } catch (err) {
    next(err);
  }
};

export const handleTotalTimeActiveForEachTag = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const { tagTotals } = await totalTimeActiveForEachTag({
      userId: req.user.id,
      period,
      startTime,
      endTime,
    });

    res.status(200).json({tagTotals})
  } catch (err) {
    next(err);
  }
}

export const handleMostProductiveDay = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const mostProductiveDay = await getMostProductive({
      userId: req.user.id,
      period,
      startTime,
      endTime,
    });
    res.status(200).json({ mostProductiveDay })
  } catch (err) {
    next(err)
  }
}

export const handleMostActiveStreak = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const mostActiveStreak = await getMostActiveStreak({
      userId: req.user.id,
      period,
      startTime,
      endTime,
    });
    res.status(200).json({ mostActiveStreak })
  } catch (err) {
    next(err)
  }
}

export const handleTaskStartStats = async (req, res, next) => {
  try {
    const { period, startTime, endTime } = req.query;

    const taskStartStats = await getTaskStartStats({
      userId: req.user.id,
      period,
      startTime,
      endTime,
    });
    res.status(200).json({ taskStartStats })
  } catch (err) {
    next(err)
  }
}

export const handleTasksOfInterest = async (req, res, next) => {
  try {
    const { start, end } = req.query;

    const taskOfInterest = await getTasksOfInterest({
      userId: req.user.id,
      start,
      end,
    });
    res.status(200).json({ taskOfInterest })
  } catch (err) {
    next(err)
  }
}

export const handleTagsOfInterest = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const tagsOfInterest = await getTagsOfInterest({
      userId: req.user.id,
      start,
      end,
    });
    return res.status(200).json({ tagsOfInterest })
  } catch (err) {
    next(err)
  }
}

export const handleTaskDailyBarChart = async (req, res, next) => {
  try {
    const { start, end, taskId } = req.query;
    const taskDaily = await getTaskDailyBarChart({
      userId: req.user.id,
      taskId,
      startTime: start,
      endTime: end,
    });
    return res.status(200).json({ taskDaily })
  } catch (err) {
    next(err)
  }
}

export const handleCheckNewIntervalOverlap = async (req, res, next) => {
  try {
    const { start, end, taskId } = req.query;
    const isOverLap = await checkNewIntervalOverlap({
      userId: req.user.id,
      taskId,
      startTime: start,
      endTime: end,
    });
    return res.status(200).json({ isOverLap });
  } catch (err) {
    next(err)
  }
}
