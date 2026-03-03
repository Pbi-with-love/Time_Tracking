import { getTimestampsCachedByMultipleIds } from "../services/cache/timestampCache.Service.js";

// Utility functions to aggregate timestamp durations for a specific set of timestamps
export const sumTimestampDurations = async ({ timestamps, start, end }) => {
  let total = 0;
  const taskTotalsTs = {};

  const tsWithoutEnd = new Set();
  for (const t of timestamps) {
    if (t.type === "start") {
      tsWithoutEnd.add(t._id.toString());
    }
    else if (t.type === "end" && t.startRef && t.startRef._id) {
      tsWithoutEnd.delete(t.startRef._id.toString());
      let startTs = new Date(
        t.startRef.timestamp < start ? start : t.startRef.timestamp,
      );
      let endTs = new Date(t.timestamp > end ? end : t.timestamp);
      const taskId = t.task.toString();
      taskTotalsTs[taskId] = (taskTotalsTs[taskId] || 0) + (endTs - startTs);
      total += endTs - startTs;
    }
  }

  if (tsWithoutEnd.size > 0) {
    const unfinishedTimestamps = await getTimestampsCachedByMultipleIds([...tsWithoutEnd]);

    for (const ts of unfinishedTimestamps) {
      let tsTime = new Date(ts.timestamp < start ? start : ts.timestamp);
      const taskId = ts.task.toString();
      taskTotalsTs[taskId] = (taskTotalsTs[taskId] || 0) + (end - tsTime);
      total += end - tsTime;
    }
  }

  return { total, taskTotalsTs };
};


// caculate total active daily time per day for a specific input set of timestamps
export const accumulateDailyTime = async ({ timestamps, start, end }) => {
  const totalPerDay = {};

  const tsWithoutEnd = new Set();
  for (const t of timestamps) {
    if (t.type === "start") {
      tsWithoutEnd.add(t._id.toString());
    }
    else if (t.type === "end" && t.startRef && t.startRef._id) {
      tsWithoutEnd.delete(t.startRef._id.toString());
      let startTs = new Date(
        t.startRef.timestamp < start ? start : t.startRef.timestamp,
      );
      let endTs = new Date(t.timestamp > end ? end : t.timestamp);
      /* These lines of code are creating new Date objects representing the start and end of a specific
      day based on the timestamps provided. */
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
    const unfinishedTimestamps = await getTimestampsCachedByMultipleIds([...tsWithoutEnd]);

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