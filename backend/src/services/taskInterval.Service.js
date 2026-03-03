import { getTasksCachedByMultipleIds } from "./cache/taskCache.Service.js";
import {
  totalTimeActiveForAllTask,
  totalTimeActiveForEachTaskDaily,
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

// const getTaskActivityFrequency = async () => {
//   const activityFrequencyData = await Timestamp.aggregate([
//     { $match: { type: "start" } },
//     {
//       $facet: {
//         perTask: [
//           {
//             $group: {
//               _id: "$task",
//               count: { $sum: 1 }
//             }
//           }
//         ],
//         total: [{ $count: "totalCount" }]
//       }
//     }
//   ]);

//   if (!activityFrequencyData.length) return [];

//   const { perTask, total } = activityFrequencyData[0];
//   const totalCount = total[0]?.totalCount || 0;
//   if (totalCount === 0) return [];

//   const activityFrequency = perTask.map((task) => ({
//     _id: task._id.toString(),
//     frequency: task.count / totalCount
//   }));

//   const sorted = [...activityFrequency].sort(
//     (a, b) => a.frequency - b.frequency
//   );

//   const values = sorted.map(t => t.frequency);

//   const percentile = (arr, p) => {
//     const index = Math.ceil(p * arr.length) - 1;
//     return arr[Math.max(0, index)];
//   };

//   const Q1 = percentile(values, 0.25);
//   const Q2 = percentile(values, 0.5);
//   const Q3 = percentile(values, 0.75);

//   const classified = activityFrequency.map((task) => {
//     let level;
//     if (task.frequency < Q1) level = "rare";
//     else if (task.frequency < Q2) level = "occasional";
//     else if (task.frequency < Q3) level = "frequent";
//     else level = "very_frequent";

//     return {
//       ...task,
//       level
//     };
//   });


//   return classified;
// };

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
