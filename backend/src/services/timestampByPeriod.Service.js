import Timestamp from "../models/Timestamp.js";

import {
  accumulateDailyTime,
  sumTimestampDurations,
} from "../utils/timestampAggregation.js";

import {
  getTimestampCached,
  getTimestampsCachedByMultipleIds,
} from "./timestampCache.Service.js";

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

  // Query for timestamps that either start before the end of the period or end after the start of the period
  // This query will seperate into main problem 3 case: start before start and end after end, start before start and end befroe start, start after start and end after start
  // tsStart -- start --- end --- tsEnd, tsStart -- tsEnd -- start -- -- end, start --- tsStart --- end --- tsEnd
  // The problems become when if you have a start ts valid, but you dont know if it has a end ts or not, if it has end ts and that end ts is not exist in the
  // result of the query, then you will need to remove this start because this start-end pair is not in range (startTs endTs start end)
  // The other case is if you have a start ts valid, but it is not end yet (which means it has no end ts), then you can keep this start ts (startTs -- start --- end)
  // The last case is if you have a end ts valid but the start ts is not valid (not exist in the result of the query), then you need to remove this end ts because this end ts is not in range (start end startTs endTs)
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

  const total = await sumTimestampDurations({ timestamps, start, end });

  return total;
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

  const total = await sumTimestampDurations({ timestamps, start, end });

  return total;
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

export const totalTimeActiveForAllTaskDaily = async ({
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

export const totalTimeActiveForAllTaskPerHour = async () => {
  const { timestamps, start, end } = await getTimestampsByPeriod({
    period: "today",
  });

  const hours = Array.from({ length: 24 }, () => 0);

  const tsWithoutEnd = new Set();

  for (const t of timestamps) {
    if (t.type === "start") {
      tsWithoutEnd.add(t._id.toString());
    }
    if (t.type === "end" && t.startRef && t.startRef.timestamp) {
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

// // Calculate total active time per hour for all tasks today
// export const totalTimeActiveForAllTaskPerHour = async () => {
//   try {
//     const tasks = await getAllTasks();
//     const hours = Array.from({ length: 24 }, () => 0);

//     const now = new Date();
//     const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

//     for (const task of tasks) {
//       const res = await axios.get(`${API_URL}/timesfortask/${task._id}`);
//       const timestamps = await getTimestampsByPeriod({ period: 'today' });

//       timestamps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

//       let startTime = null;

//       for (const t of timestamps) {
//         if (t.type === 'start') {
//           startTime = new Date(t.timestamp);
//         } else if (t.type === 'end' && startTime) {
//           let endTime = new Date(t.timestamp);

//           if (startTime < startOfDay) startTime = startOfDay;
//           if (endTime > now) endTime = now;

//           let current = new Date(startTime)

//           while (current < endTime) {
//             const hourIndex = current.getHours();
//             const nextHour = new Date(current);
//             nextHour.setHours(hourIndex + 1, 0, 0, 0);

//             const intervalEnd = endTime < nextHour ? endTime : nextHour;

//             hours[hourIndex] += intervalEnd - current;

//             current = intervalEnd;
//           }

//           startTime = null;
//         }
//       }

//       if (startTime) {
//         let endTime = now;
//         let current = new Date(startTime);

//         while (current < endTime) {
//           const hourIndex = current.getHours();
//           const nextHour = new Date(current);
//           nextHour.setHours(hourIndex + 1, 0, 0, 0);

//           const intervalEnd = endTime < nextHour ? endTime : nextHour;

//           hours[hourIndex] += intervalEnd - current;

//           current = intervalEnd;
//         }
//       }
//     }

//     return hours;
//   } catch (error) {
//     console.error('Failed to get total time per hour ', error);
//     throw error;
//   }
// };
