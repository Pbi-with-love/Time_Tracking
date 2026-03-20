import { getTasksCachedByMultipleIds } from "./cache/taskCache.Service.js";
import {
  totalTimeActiveForAllTask,
  totalTimeActiveForEachTaskDaily,
  getTimestampsByPeriod
} from "./timestampByPeriod.Service.js";
import { getAllTimestampsCached, getTimestampsCachedByMultipleIds } from "./cache/timestampCache.Service.js"
import { getTaskCached } from "./cache/taskCache.Service.js";
import Timestamp from "../models/Timestamp.js";
// Get tasks with active time within a given start and end interval
export const getTasksOfInterest = async ({ start, end }) => {
  const { taskTotalsTs } = await totalTimeActiveForAllTask({
    startTime: start,
    endTime: end,
  });

  const taskIds = Object.keys(taskTotalsTs);
  const tasks = await getTasksCachedByMultipleIds([...taskIds]);

  const tasksWithActiveTime = tasks.map((task) => ({
    ...task,
    activeTime: taskTotalsTs[task._id.toString()] || 0,
  }));

  return tasksWithActiveTime;
};

// Get tasks daily active time for bar chart visualization
export const getTaskDailyBarChart = async ({ taskId, startTime, endTime }) => {
  const task = await getTaskCached(taskId);
  const totalPerDay = await totalTimeActiveForEachTaskDaily({
    taskId,
    startTime,
    endTime,
  });

  const dailyData = Object.entries(totalPerDay).map(([day, ms]) => {
    return {
      date: day,
      hours: ms / (1000 * 60 * 60),
      milliseconds: ms,
    };
  });

  return {
    taskId,
    taskName: task.title,
    dailyData,
  };
};


export const getTaskStats = async () => {
  // Stat 1: The ratio number of ts type start for a specific task and the number of total ts type start of all tasks
  const activityFrequencyData = await Timestamp.aggregate([
    { $match: { type: "start" } },
    {
      $facet: {
        perTask: [
          {
            $group: {
              _id: "$task",
              count: { $sum: 1 }
            }
          }
        ],
        total: [{ $count: "totalCount" }]
      }
    }
  ]);

  if (!activityFrequencyData.length) return [];

  const { perTask, total } = activityFrequencyData[0]; // to access to mongoDB result query
  const totalCount = total[0]?.totalCount || 0;
  if (totalCount === 0) return [];

  const activityFrequency = perTask.map((task) => ({
    _id: task._id.toString(),
    frequency: task.count / totalCount
  }));

  const sorted = [...activityFrequency].sort(
    (a, b) => a.frequency - b.frequency
  );

  const values = sorted.map(t => t.frequency);

  // Use box plot to classified the behavior that user usually click start for a specific task or not
  const percentile = (arr, p) => {
    const index = Math.ceil(p * arr.length) - 1;
    return arr[Math.max(0, index)];
  };

  const Q1 = percentile(values, 0.25);
  const Q2 = percentile(values, 0.5);
  const Q3 = percentile(values, 0.75);
  const classified = {};
  activityFrequency.forEach((task) => {
    let level;
    if (task.frequency < Q1) level = "Rare";
    else if (task.frequency < Q2) level = "Occasional";
    else if (task.frequency < Q3) level = "Frequent";
    else level = "Very frequent";

    classified[task._id] = level;
  });

  
  const timestamps = await getAllTimestampsCached();
  const tsWithoutEnd = new Set();
  const totalTime = {};
  const activeDays = {}; // activeDay is an obj for each element is a set of day that a task (taskId) is active at least 1 time
  for (const t of timestamps) {
    if (t.type === "start") {
      tsWithoutEnd.add(t._id.toString());
    } else if (t.type === "end" && t.startRef && t.startRef._id) {
      tsWithoutEnd.delete(t.startRef._id.toString());
      let startTs = new Date(t.startRef.timestamp);
      let endTs = new Date(t.timestamp);
      const taskId = t.task.toString();
      totalTime[taskId] = (totalTime[taskId] || 0) + (endTs - startTs);
      let curr = new Date(
        startTs.getFullYear(),
        startTs.getMonth(),
        startTs.getDate(),
      );
      let endDay = new Date(
        endTs.getFullYear(),
        endTs.getMonth(),
        endTs.getDate(),
      );
      activeDays[taskId] ??= new Set();
      while (curr <= endDay) {
        const key = curr.toISOString().slice(0, 10);
        activeDays[taskId].add(key);
        curr.setDate(curr.getDate() + 1);
      }
    }
  }

  if (tsWithoutEnd.size > 0) {
    const unfinishedTimestamps = await getTimestampsCachedByMultipleIds([...tsWithoutEnd]);
    const now = new Date();
    for (const ts of unfinishedTimestamps) {
      const startTs = new Date(ts.timestamp);
      const taskId = ts.task.toString();
      const endTs = now;
      totalTime[taskId] = (totalTime[taskId] || 0) + (endTs - startTs);
      let curr = new Date(
        startTs.getFullYear(),
        startTs.getMonth(),
        startTs.getDate(),
      );
      let endDay = new Date(
        endTs.getFullYear(),
        endTs.getMonth(),
        endTs.getDate(),
      );
      activeDays[taskId] ??= new Set();
      while (curr <= endDay) {
        const key = curr.toISOString().slice(0, 10);
        activeDays[taskId].add(key);
        curr.setDate(curr.getDate() + 1);
      }
    }
  }

  // Stat 2: Average time per day by the ratio of total time for that task and total day active for that task (only day that task is active at least 1 time is considered)
  const avgPerDay = {};
  // Stat 3: Measures how regularly the task is performed, activeDays / total span of days (from first to last active day)
  const timeConsistency = {};
  // Stat 4: Total number of distinct days the task was active
  const activeDayCount = {};
  for (const taskId in totalTime) {
    if (!activeDays[taskId] || activeDays[taskId].size === 0) {
      avgPerDay[taskId] = 0;
      activeDayCount[taskId] = 0;
      timeConsistency[taskId] = {
        ratio: 0,
        level: "None",
      };
    } else {
      avgPerDay[taskId] = totalTime[taskId] / activeDays[taskId].size;
      activeDayCount[taskId] = activeDays[taskId].size;
      const daysArr = Array.from(activeDays[taskId]);
      const firstDay = new Date(daysArr[0]);
      const lastDay = new Date(daysArr[daysArr.length - 1]);
      const totalSpanDay = (lastDay - firstDay) / (1000 * 60 * 60 * 24) + 1;
      const ratio = activeDays[taskId].size / totalSpanDay;
      let levelDetail = "";
      if (ratio >= 0.95) levelDetail = "Always";
      else if (ratio >= 0.8) levelDetail = "Frequent";
      else if (ratio >= 0.5) levelDetail = "Moderate";
      else if (ratio >= 0.2) levelDetail = "Occasional";
      else levelDetail = "Rare";
      timeConsistency[taskId] = {
        ratio,
        level: levelDetail,
      };
    }
  }

  return {averageActiveTimePerDay: avgPerDay, timeConsistency, activeDayCount, activityFrequency: classified};
}

// Get detailed activity intervals for a specific task within a time range
export const getTaskDetailsIntervals = async ({startTime, endTime, taskId}) => {
  const task = await getTaskCached(taskId);
  const { timestamps, start, end } = await getTimestampsByPeriod({
    taskId,
    startTime,
    endTime,
  });

  const tsWithoutEnd = new Set();
  const activityIntervals = [];
  for (const t of timestamps) {
    if (t.type === "start") {
      tsWithoutEnd.add(t._id.toString());
    } else if (t.type === "end" && t.startRef && t.startRef._id) {
      tsWithoutEnd.delete(t.startRef._id.toString());
      let originalStartTs = new Date(t.startRef.timestamp);
      let startTs = new Date(
        t.startRef.timestamp < start ? start : t.startRef.timestamp,
      );
      let originalEndTs = new Date(t.timestamp)
      let endTs = new Date(t.timestamp > end ? end : t.timestamp);
      activityIntervals.push({
        startTsId: t.startRef._id,
        endTsId: t._id,
        startTime: startTs,
        endTime: endTs,
        duration: endTs - startTs,
        originalStart: originalStartTs,
        originalEnd: originalEndTs,
        status: 'End',
      })
    }
  }
  if (tsWithoutEnd.size > 0) {
    const unfinishedTimestamps = await getTimestampsCachedByMultipleIds([
      ...tsWithoutEnd,
    ]);

    for (const ts of unfinishedTimestamps) {
      let originalTsTime = new Date(ts.timestamp);
      let tsTime = new Date(ts.timestamp < start ? start : ts.timestamp);
      let current = new Date(tsTime);
      activityIntervals.push({
        startTsId: ts._id,
        endTsId: null,
        startTime: tsTime,
        endTime: null,
        duration: current - tsTime,
        status: 'Ongoing',
        originalStart: originalTsTime,
        originalEnd: current
      })
    }
  }
  const filteredIntervals = activityIntervals.filter((interval) => interval.duration > 0);
  filteredIntervals.sort((a, b) => a.startTime - b.startTime);

  return {
    id: taskId,
    title: task.title,
    tags: task.tags,
    description: task.description,
    activityIntervals: filteredIntervals,
  };
}

// // Get detailed activity intervals for a specific task within a time range
// export const getTaskDetailsIntervals = async ({ start, end, task }) => {
//   const startInterval = new Date(start);
//   const endIntervalUser = new Date(end);
//   const now = new Date();
//   const endInterval = endIntervalUser > now ? now : endIntervalUser;

//   const timestamps = await getTimestampByTaskId(task._id);
//   timestamps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

//   const activityIntervals = [];
//   let currentStart = null;
//   let currentStartId = null;

//   for (const t of timestamps) {
//     const ts = new Date(t.timestamp);

//     if (t.type === 'start') {
//       currentStart = ts;
//       currentStartId = t._id;
//     } else if (t.type === 'end' && currentStart) {
//       const tsEnd = ts;

//       const overlapStart = currentStart < endInterval ? currentStart : null;
//       const overlapEnd = tsEnd > startInterval ? tsEnd : null;

//       if (overlapStart && overlapEnd && overlapStart < overlapEnd) {
//         activityIntervals.push({
//           startTsId: currentStartId,
//           endTsId: t._id,
//           startTime: overlapStart < startInterval ? startInterval : overlapStart,
//           endTime: overlapEnd > endInterval ? endInterval : overlapEnd,
//           duration: overlapEnd - overlapStart,
//           status: 'End',
//           originalStart: currentStart,
//           originalEnd: tsEnd,
//         });
//       }

//       currentStart = null;
//       currentStartId = null;
//     }
//   }

//   if (currentStart && currentStart < endInterval) {
//     const overlapStart = currentStart < endInterval ? currentStart : null;
//     if (overlapStart) {
//       activityIntervals.push({
//         startTsId: currentStartId,
//         endTsId: null,
//         startTime: overlapStart < startInterval ? startInterval : overlapStart,
//         endTime: null,
//         duration: Date.now() - overlapStart.getTime(),
//         status: 'Ongoing',
//         originalStart: currentStart,
//         originalEnd: null,
//       });
//     }
//   }

//   const filteredIntervals = activityIntervals.filter((interval) => interval.duration > 0);
//   filteredIntervals.sort((a, b) => a.startTime - b.startTime);

//   return {
//     id: task._id,
//     title: task.title,
//     tags: task.tags,
//     description: task.description,
//     activityIntervals: filteredIntervals,
//   };
// };