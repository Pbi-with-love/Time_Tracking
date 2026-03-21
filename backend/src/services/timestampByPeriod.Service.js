import Timestamp from "../models/Timestamp.js";

import {
  accumulateDailyTime,
  sumTimestampDurations,
} from "../utils/timestampAggregation.js";

import {
  getTimestampCached,
  getTimestampsCachedByMultipleIds,
} from "./cache/timestampCache.Service.js";

import { getTasksCachedByMultipleIds } from "./cache/taskCache.Service.js";
import { getTimestampsForTask } from "../controllers/TimestampController.js";

import mongoose from "mongoose";

// Retrieve timestamps based on period or custom time range
export const getTimestampsByPeriod = async ({
  period,
  startTime,
  endTime,
  taskId = null,
} = {}) => {
  const now = new Date();
  let start = null;
  let end = null;

  if (startTime && endTime) {
    start = new Date(startTime);
    end = new Date(endTime) > now ? now : new Date(endTime);
  } else {
    switch (period) {
      case "today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;

      case "thisWeek":
        const day = now.getDay() || 7;
        start = new Date(now);
        start.setDate(now.getDate() - day + 1);
        start.setHours(0, 0, 0, 0);
        break;

      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        break;

      default:
        start = new Date(0);
    }

    end = now;
  }
  /**
   * Query for timestamps that either start before the end of the period or end after the start of the period
   * This query will seperate into main problem 3 case: start before start and end after end, start before start and end before start, start after start and end after start
   *  tsStart -- start --- end --- tsEnd, tsStart -- tsEnd -- start -- -- end, start --- tsStart --- end --- tsEnd
   * The problems become when if you have a start ts valid, but you dont know if it has a end ts or not, if it has end ts and that end ts is not exist in the
   * result of the query, then you will need to remove this start because this start-end pair is not in range (startTs endTs start end)
   * The other case is if you have a start ts valid, but it is not end yet (which means it has no end ts), then you can keep this start ts (startTs -- start --- end)
   * The last case is if you have a end ts valid but the start ts is not valid (not exist in the result of the query), then you need to remove this end ts because this end ts is not in range (start end startTs endTs)
   */
  const query = {
    $or: [
      { type: "end", timestamp: { $gte: start } },

      { type: "start", timestamp: { $lte: end } },
    ],
  };

  if (taskId) {
    query.task = taskId;
  }

  const timestamps = await Timestamp.find(query)
    .sort({ timestamp: 1 })
    .populate("startRef")
    .lean();

  const validStartTimestamps = new Set();
  const startWithoutEnd = new Set();
  const filteredTimestamps = [];
  for (const t of timestamps) {
    if (t.type === "start") {
      startWithoutEnd.add(t._id.toString());
      validStartTimestamps.add(t._id.toString());
      filteredTimestamps.push(t);
    } else if (t.type === "end" && t.startRef && t.startRef._id) {
      if (startWithoutEnd.has(t.startRef._id.toString())) {
        startWithoutEnd.delete(t.startRef._id.toString());
        filteredTimestamps.push(t);
      }
    }
  }

  if (startWithoutEnd.size > 0) {
    const ids = [...startWithoutEnd].map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    const alreadyFinishedTimestamp = await Timestamp.find({
      type: "end",
      startRef: { $in: ids },
    }).lean();

    for (const t of alreadyFinishedTimestamp) {
      if (t.startRef && t.startRef._id) {
        validStartTimestamps.delete(t.startRef._id.toString());
      }
    }
  }

  const finalTimestamp = filteredTimestamps.filter((t) => {
    if (t.type === "start" && validStartTimestamps.has(t._id.toString())) {
      return true;
    } else if (t.type === "end") {
      return true;
    }
    return false;
  });

  return { timestamps: finalTimestamp, start, end };
};

// Calculate total active time for a specific task
export const totalTimeActiveForEachTask = async ({
  taskId,
  period,
  startTime,
  endTime,
} = {}) => {
  let timeRange;
  if (startTime && endTime) {
    timeRange = { startTime, endTime };
  } else {
    timeRange = { period };
  }
  const { timestamps, start, end } = await getTimestampsByPeriod({
    taskId,
    ...timeRange,
  });

  const { total, taskTotalsTs } = await sumTimestampDurations({
    timestamps,
    start,
    end,
  });

  return { total, taskTotalsTs };
};

// Calculate total active time for all tasks
export const totalTimeActiveForAllTask = async ({
  period,
  startTime,
  endTime,
} = {}) => {
  let timeRange;
  if (startTime && endTime) {
    timeRange = { startTime, endTime };
  } else {
    timeRange = { period };
  }
  const { timestamps, start, end } = await getTimestampsByPeriod({
    ...timeRange,
  });

  const { total, taskTotalsTs } = await sumTimestampDurations({
    timestamps,
    start,
    end,
  });
  return { total, taskTotalsTs };
};

// Calculate total active time for each day for a specific task
export const totalTimeActiveForEachTaskDaily = async ({
  taskId,
  period,
  startTime,
  endTime,
} = {}) => {
  const { timestamps, start, end } = await getTimestampsByPeriod({
    taskId,
    period,
    startTime,
    endTime,
  });

  const totalPerDay = await accumulateDailyTime({ timestamps, start, end });

  return totalPerDay;
};

export const totalTimeActiveForAllTasksDaily = async ({
  period,
  startTime,
  endTime,
} = {}) => {
  const { timestamps, start, end } = await getTimestampsByPeriod({
    period,
    startTime,
    endTime,
  });

  const totalPerDay = await accumulateDailyTime({ timestamps, start, end });

  return totalPerDay;
};

export const totalTimeActiveForAllTasksPerHour = async () => {
  const { timestamps, start, end } = await getTimestampsByPeriod({
    period: "today",
  });

  const hours = Array.from({ length: 24 }, () => 0);

  const tsWithoutEnd = new Set();

  for (const t of timestamps) {
    if (t.type === "start") {
      tsWithoutEnd.add(t._id.toString());
    } else if (t.type === "end" && t.startRef && t.startRef._id) {
      tsWithoutEnd.delete(t.startRef._id.toString());
      let startTs = new Date(
        t.startRef.timestamp < start ? start : t.startRef.timestamp,
      );
      let endTs = new Date(t.timestamp > end ? end : t.timestamp);

      let current = new Date(startTs);

      while (current < endTs) {
        const hourIndex = current.getHours();
        const nextHour = new Date(current);
        nextHour.setHours(hourIndex + 1, 0, 0, 0);

        const intervalEnd = nextHour < endTs ? nextHour : endTs;

        hours[hourIndex] += intervalEnd - current;

        current = intervalEnd;
      }
    }
  }

  if (tsWithoutEnd.size > 0) {
    const unfinishedTimestamps = await getTimestampsCachedByMultipleIds([
      ...tsWithoutEnd,
    ]);

    for (const ts of unfinishedTimestamps) {
      let tsTime = new Date(ts.timestamp < start ? start : ts.timestamp);
      let current = new Date(tsTime);

      while (current < end) {
        const hourIndex = current.getHours();
        const nextHour = new Date(current);
        nextHour.setHours(hourIndex + 1, 0, 0, 0);

        const intervalEnd = nextHour < end ? nextHour : end;

        hours[hourIndex] += intervalEnd - current;
        current = intervalEnd;
      }
    }
  }

  return hours;
};

// Calculate total active time for each tag
export const totalTimeActiveForEachTag = async ({
  period,
  startTime,
  endTime,
} = {}) => {
  const { taskTotalsTs } = await totalTimeActiveForAllTask({
    period,
    startTime,
    endTime,
  });

  const taskIds = Object.keys(taskTotalsTs);
  const tasks = await getTasksCachedByMultipleIds([...taskIds]);
  const tagTotals = {};
  const numberOfTasks = {};

  for (const task of tasks) {
    const totalTime = taskTotalsTs[task._id.toString()] || 0;
    for (const tagId of task.tags) {
      if (!numberOfTasks[tagId]) numberOfTasks[tagId] = 0;
      numberOfTasks[tagId]++;
      tagTotals[tagId.toString()] =
        (tagTotals[tagId.toString()] || 0) + totalTime;
    }
  }

  return { tagTotals, numberOfTasks };
};

// Get the day with the most completed tasks in a period
export const getMostProductive = async ({
  period,
  startTime,
  endTime,
} = {}) => {
  if (period === "today") return { day: null, count: 0 };

  const { timestamps } = await getTimestampsByPeriod({
    period,
    startTime,
    endTime,
  });

  const dayMap = {};
  const tsWithoutEnd = new Set();

  for (const t of timestamps) {
    const ts = new Date(t.timestamp);
    const dayKey = ts.toISOString().split("T")[0];

    if (!dayMap[dayKey]) dayMap[dayKey] = 0;

    if (t.type === "start") {
      tsWithoutEnd.add(t._id.toString());
    } else if (t.type === "end" && t.startRef && t.startRef._id) {
      tsWithoutEnd.delete(t.startRef._id.toString());
      dayMap[dayKey] += 1;
    }
  }

  // I just increse one when there is a valid end exist, so dont need to handle task without end in this function
  const [dayKey, count] = Object.entries(dayMap).sort(
    (a, b) => b[1] - a[1],
  )[0] || [null, 0];

  if (!dayKey) return { day: null, count: 0 };

  const dateObj = new Date(dayKey);
  const dayFormatted = dateObj.toLocaleDateString("en-GB");
  const weekday = dateObj.toLocaleDateString("en-GB", { weekday: "long" });

  return { day: dayFormatted, weekday, count };
};

/**
 * This function returns the longest time streak during which at least one task is active.
 * The algorithm used in this function: the first ts with type start will be assigned its timestamp to the variable streakStart
 * Because I don't need to care the second, third,... ts type start, only when the streak is end, I just need to take final TS - startStreak to calculate the time streak
 * S1 -> S2 -> S3 -> E1 -> E3 -> E2 => time range = E2 - S1
 * Next I need to know when a streak is stopped, it will stop when all the start ts in current streak match will all end Ts in timestamps array
 * Which means in this streak there is no more task is active => Calculate currStreak, compare maxStreak => Start new Streak if this streak is not a final one
 * Create variable active when there is a start ts it will increase by one, and with end Ts it will decrease by one -> when active == 0 the current streak is end
 * currentStreakTasks is a set use to track how many task have been activated during this streak by storing all the ts type start.
 * For example S1 -> S2 -> S3 -> E1 -> E3 -> E2 have 3 startTs which means the number of task active in this streak is currentStreakTasks.size == 3
 */
export const getMostActiveStreak = async ({
  period,
  startTime,
  endTime,
} = {}) => {
  const { timestamps, start, end } = await getTimestampsByPeriod({
    period,
    startTime,
    endTime,
  });

  let maxStreak = 0;
  let streak = 0;
  let currentStreakTasks = new Set();
  let maxTotalTaskActiveDuringStreak = 0;
  let active = 0;
  let streakStart = null;

  for (const t of timestamps) {
    if (t.type === "start") {
      if (active === 0) {
        streakStart = new Date(t.timestamp < start ? start : t.timestamp);
        /**
         * Reset the task set at the start of a new streak.
         * We do this here rather than when maxStreak is found,
         * so tasks from previous streaks are not carried over.
         */
        currentStreakTasks.clear();
      }
      active++;
      currentStreakTasks.add(t._id.toString());
    } else if (t.type === "end" && t.startRef && t.startRef._id) {
      active = Math.max(0, active - 1);
      if (active == 0 && streakStart) {
        const endTs = new Date(t.timestamp > end ? end : t.timestamp);
        streak = endTs - streakStart;
        if (streak > maxStreak) {
          maxStreak = streak;
          maxTotalTaskActiveDuringStreak = currentStreakTasks.size;
        }
        streakStart = null;
      }
    }
  }

  if (active > 0 && streakStart) {
    streak = end - streakStart;
    if (streak > maxStreak) {
      maxStreak = streak;
      maxTotalTaskActiveDuringStreak = currentStreakTasks.size;
    }
  }

  return { maxStreak, maxTotalTaskActiveDuringStreak };
};

export const getTaskStartStats = async ({
  period,
  startTime,
  endTime,
} = {}) => {
  const { timestamps, start, end } = await getTimestampsByPeriod({
    period,
    startTime,
    endTime,
  });

  let totalActiveStarts = 0;
  const activePerDay = {};

  for (const t of timestamps) {
    if (t.type === "start") {
      totalActiveStarts++;
      const day = new Date(t.timestamp).toISOString().slice(0, 10);
      if (!activePerDay[day]) activePerDay[day] = new Set();
      activePerDay[day].add(t.task);
    }
  }

  const days = Object.keys(activePerDay).length;
  const avgTasksPerDay =
    days > 0
      ? Object.values(activePerDay).reduce((sum, set) => sum + set.size, 0) /
        days
      : 0;

  return { totalActiveStarts, avgTasksPerDay };
};

// Check if a new interval overlaps with existing intervals for a task before create new interval
export const checkNewIntervalOverlap = async ({
  startTime,
  endTime,
  taskId,
} = {}) => {
  const timestamps = await Timestamp.find({ task: taskId })
    .sort({ timestamp: 1 })
    .lean();

  if (!timestamps || timestamps.length === 0) return false;

  let prevStart = null;
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  for (const t of timestamps) {
    const time = new Date(t.timestamp).getTime();
    if (t.type === "start") {
      prevStart = time;
    } else if (t.type === "end" && prevStart != null) {
      let startTs = prevStart;
      let endTs = new Date(t.timestamp).getTime();

      if (startTs < end && endTs > start) return true;
      prevStart = null;
    }
  }

  return false;
};

// // Check if a new interval overlaps with existing intervals for a task before create new interval
// export const checkNewIntervalOverlap = async (startTime, endTime, taskId) => {
//   try {
//     const timestamps = await getTimestampByTaskId(taskId);

//     if (!timestamps || timestamps.length === 0) return false;

//     const sorted = timestamps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

//     const intervals = [];
//     for (let i = 0; i < sorted.length; i++) {
//       const current = sorted[i];
//       if (current.type === 'start') {
//         const end = sorted.slice(i + 1).find((ts) => ts.type === 'end');
//         if (end) {
//           intervals.push({
//             start: new Date(current.timestamp).getTime(),
//             end: new Date(end.timestamp).getTime(),
//           });
//         }
//       }
//     }

//     const newInterval = {
//       start: new Date(startTime).getTime(),
//       end: new Date(endTime).getTime(),
//     };
//     intervals.push(newInterval);

//     for (let i = 0; i < intervals.length; i++) {
//       const a = intervals[i];
//       for (let j = i + 1; j < intervals.length; j++) {
//         const b = intervals[j];
//         if (a.start < b.end && a.end > b.start) {
//           if (i === intervals.length - 1 || j === intervals.length - 1) {
//             return true;
//           }
//         }
//       }
//     }

//     return false;
//   } catch (error) {
//     console.error('Error checking interval overlap:', error);
//     return false;
//   }
// };
