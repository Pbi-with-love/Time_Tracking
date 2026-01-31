import Timestamp from "../models/Timestamp.js";
import { getTimestampCached } from "./timestampCache.Service.js";

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

      case "thisWeek": {
        const day = now.getDay() || 7;
        start = new Date(now);
        start.setDate(now.getDate() - day + 1);
        start.setHours(0, 0, 0, 0);
        break;
      }

      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        break;

      default:
        start = new Date(0);
    }

    end = now;
  }

  const query = {
    $or: [
      { type: "end", timestamp: { $gte: start } },

      { type: "start", timestamp: { $lt: end } },
    ],
  };

  if (taskId) {
    query.task = taskId;
  }

  const timestamps = await Timestamp.find(query)
    .sort({ timestamp: 1 })
    .populate("startRef")
    .lean();

  return { timestamps, start, end };
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

  let total = 0;

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
      total += endTs - startTs;
    }
  }

  if (tsWithoutEnd.size > 0) {
    const unfinishedTimestamps = await getTimestampCached([...tsWithoutEnd]);

    for (const ts of unfinishedTimestamps) {
      let tsTime = new Date(ts.timestamp < start ? start : ts.timestamp);
      total += end - tsTime;
    }
  }

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

  let total = 0;

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
      total += endTs - startTs;
    }
  }

  if (tsWithoutEnd.size > 0) {
    const unfinishedTimestamps = await getTimestampCached([...tsWithoutEnd]);

    for (const ts of unfinishedTimestamps) {
      let tsTime = new Date(ts.timestamp < start ? start : ts.timestamp);
      total += end - tsTime;
    }
  }

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

  const totalPerDay = {};

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
      let startDay = new Date(
        startTs.getFullYear(),
        startTs.getMonth(),
        startTs.getDate(),
      );
      let endDay = new Date(
        endTs.getFullYear(),
        endTs.getMonth(),
        endTs.getDate(),
      );

      const dayCount = Math.floor((endDay - startDay) / (24 * 60 * 60 * 1000));

      if (dayCount === 0) {
        const dayStr = startTs.toISOString().slice(0, 10);
        totalPerDay[dayStr] = (totalPerDay[dayStr] || 0) + (endTs - startTs);
      } else {
        // first day
        const firstDayStr = startTs.toISOString().slice(0, 10);
        const firstDayEnd = new Date(startDay.getTime() + 24 * 60 * 60 * 1000);
        totalPerDay[firstDayStr] =
          (totalPerDay[firstDayStr] || 0) + (firstDayEnd - startTs);

        // middle days
        for (let i = 1; i < dayCount; i++) {
          const midDay = new Date(startDay.getTime() + i * 24 * 60 * 60 * 1000);
          const midDayStr = midDay.toISOString().slice(0, 10);
          totalPerDay[midDayStr] = 24 * 60 * 60 * 1000;
        }

        // last day
        const lastDayStr = endTs.toISOString().slice(0, 10);
        const lastDayStart = new Date(endDay.getTime());
        totalPerDay[lastDayStr] =
          (totalPerDay[lastDayStr] || 0) + (endTs - lastDayStart);
      }
    }
  }

  if (tsWithoutEnd.size > 0) {
    const unfinishedTimestamps = await getTimestampCached([...tsWithoutEnd]);

    for (const ts of unfinishedTimestamps) {
      let startTs = new Date(
        t.startRef.timestamp < start ? start : t.startRef.timestamp,
      );
      let endTs = end;

      let startDay = new Date(
        startTs.getFullYear(),
        startTs.getMonth(),
        startTs.getDate(),
      );
      let endDay = new Date(
        endTs.getFullYear(),
        endTs.getMonth(),
        endTs.getDate(),
      );

      const dayCount = Math.floor((endDay - startDay) / (24 * 60 * 60 * 1000));

      if (dayCount === 0) {
        const dayStr = startTs.toISOString().slice(0, 10);
        totalPerDay[dayStr] = (totalPerDay[dayStr] || 0) + (endTs - startTs);
      } else {
        // first day
        const firstDayStr = startTs.toISOString().slice(0, 10);
        const firstDayEnd = new Date(startDay.getTime() + 24 * 60 * 60 * 1000);
        totalPerDay[firstDayStr] =
          (totalPerDay[firstDayStr] || 0) + (firstDayEnd - startTs);

        // middle days
        for (let i = 1; i < dayCount; i++) {
          const midDay = new Date(startDay.getTime() + i * 24 * 60 * 60 * 1000);
          const midDayStr = midDay.toISOString().slice(0, 10);
          totalPerDay[midDayStr] = 24 * 60 * 60 * 1000;
        }

        // last day
        const lastDayStr = endTs.toISOString().slice(0, 10);
        const lastDayStart = new Date(endDay.getTime());
        totalPerDay[lastDayStr] =
          (totalPerDay[lastDayStr] || 0) + (endTs - lastDayStart);
      }
    }
  }

  return totalPerDay;
};

export const totalTimeActiveForAllTaskDaily = async ({
  period,
  startTime,
  endTime,
} = {}) => {};

// // Calculate total active time per day for all tasks
// export const totalTimeActiveForAllTaskDaily = async (period) => {
//   const tasks = await getAllTasks();
//   const dailyTimes = await Promise.all(
//     tasks.map((task) => totalTimeActiveForEachTaskDaily(task._id, period)),
//   );

//   const totalPerDay = {};
//   dailyTimes.forEach((taskDaily) => {
//     Object.entries(taskDaily).forEach(([date, ms]) => {
//       totalPerDay[date] = (totalPerDay[date] || 0) + ms;
//     });
//   });

//   return totalPerDay;
// };
