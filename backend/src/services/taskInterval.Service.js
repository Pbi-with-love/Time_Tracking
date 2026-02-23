import { getTasksCachedByMultipleIds } from "./cache/taskCache.Service.js";
import { totalTimeActiveForAllTask, totalTimeActiveForEachTaskDaily } from "./timestampByPeriod.Service.js";
import { getTaskCached } from "./cache/taskCache.Service.js"
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

export const getTaskDailyBarChart = async ({taskId, startTime, endTime}) => {
  const task = await getTaskCached(taskId);
  const totalPerDay = await totalTimeActiveForEachTaskDaily({taskId, startTime, endTime});

  const dailyData = Object.entries(totalPerDay).map(([day, ms]) => {
    return {
      date: day,
      hours: ms / (1000 * 60 * 60),
      milliseconds: ms
    }
  })

  return {
    taskId,
    taskName: task.title,
    dailyData
  }
};
