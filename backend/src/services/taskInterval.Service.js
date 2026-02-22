import { getTasksCachedByMultipleIds } from "./cache/taskCache.Service.js";
import { totalTimeActiveForAllTask } from "./timestampByPeriod.Service.js"

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
  }))

  return tasksWithActiveTime;
};
// export const getTasksOfInterest = async ({ start, end }) => {
//   const startTimeInterval = new Date(start);
//   const userSelectedEnd = new Date(end);
//   const now = new Date();
//   const endTimeInterval = userSelectedEnd > now ? now : userSelectedEnd;

//   const tasks = await getAllTasks();

//   const tasksWithTimestamps = await Promise.all(
//     tasks.map(async (task) => {
//       const timestamps = await getTimestampByTaskId(task._id);

//       timestamps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

//       let activeTime = 0;
//       let currentStart = null;
//       let hasActiveInInterval = false;

//       for (const t of timestamps) {
//         const ts = new Date(t.timestamp);

//         if (t.type === 'start') {
//           if (ts >= startTimeInterval && ts <= endTimeInterval) {
//             currentStart = ts;
//             hasActiveInInterval = true;
//           }
//         } else if (t.type === 'end' && currentStart) {
//           const tsEnd = ts;
//           if (tsEnd <= startTimeInterval) {
//             currentStart = null;
//             continue;
//           }
//           const effectiveEnd = tsEnd > endTimeInterval ? endTimeInterval : tsEnd;
//           activeTime += effectiveEnd - currentStart;
//           currentStart = null;
//           hasActiveInInterval = true;
//         }
//       }

//       if (currentStart && currentStart < endTimeInterval) {
//         activeTime += endTimeInterval - currentStart;
//         hasActiveInInterval = true;
//       }

//       if (!hasActiveInInterval || activeTime <= 0) return null;

//       return {
//         id: task._id,
//         title: task.title,
//         tags: task.tags,
//         description: task.description,
//         activeTime,
//       };
//     }),
//   );

//   return tasksWithTimestamps.filter(Boolean);
// };
