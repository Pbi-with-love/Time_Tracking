import { api } from "./axiosClient"
import { getAllTags } from './Tags';
import { getAllTasks } from './Tasks';

export const getAllTimestamps = async () => {
  try {
    const res = await api.get(`/timestamps`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch timestamps ', error);
    throw error;
  }
};

export const getTimestampByTaskId = async (taskId) => {
  try {
    const res = await api.get(`/timesfortask/${taskId}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch timestamp by task id ', error);
    throw error;
  }
};

export const getTimestampById = async (id) => {
  try {
    const res = await api.get(`/timestamps/${id}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch timestamp by id ', error);
    throw error;
  }
};

export const createTimestamps = async (taskId, type) => {
  try {
    const timestamp = new Date();
    // Avoid the old version error
    const res = await api.post(`/timestamps`, {
      timestamp,
      task: taskId,
      type,
    });

    return res.data;
  } catch (error) {
    console.error('Failed to create timestamp', error);
    throw error;
  }
};

export const createTimestampWithCustomTime = async (taskId, customTimestamp, type) => {
  try {
    const res = await api.post(`/timestamps`, {
      timestamp: customTimestamp,
      task: taskId,
      type
    });

    return res.data;
  } catch (error) {
    console.error('Failed to create timestamp with custom time ', error);
    throw error;
  }
};

export const updateTimestampById = async (timestampId, updatedFields) => {
  try {
    const res = await api.patch(`/timestamps/${timestampId}`, updatedFields);
    return res.data;
  } catch (error) {
    console.error('Failed to update this timestamp ', error);
    throw error;
  }
};

export const deleteTimestamp = async (timestampId) => {
  try {
    const res = await api.delete(`/timestamps/${timestampId}`);
    return res.data;
  } catch (error) {
    console.error('Failed to delete the timestamp of this task ', error);
    throw error;
  }
};

// // Get ordered tasks with earliest and latest activity timestamps
export const getOrderedTasks = async (tasks) => {
  try {
    const ids = tasks.map((t) => t._id).join(',');
    const res = await api.get(`/tasks/orderedtasks`, { params: { ids } });
    return res.data;
  } catch (error) {
    console.error('Failed to get ordered tasks ', error);
    throw error;
  }
};

// Filter timestamps by a given period (today, thisWeek, thisMonth, all)
export const getTimestampsByPeriod = async ({ period, startTime, endTime, taskId } = {}) => {
  try {
    const params = {};

    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    if (taskId) params.taskId = taskId;

    const res = await api.get(`/timestamps/timestampsbyperiod`, { params });
    return res.data;
  } catch (error) {
    console.error('Failed to get timestamps by period ', error);
    throw error;
  }
};

// Calculate total active time for a task within a period
export const totalTimeActiveForEachTask = async ({ taskId, period, startTime, endTime } = {}) => {
  try {
    const params = {};

    if (taskId) params.taskId = taskId;
    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await api.get(`/timestamps/totaltimeactiveforeachtask`, {
      params,
    });
    return res.data.totalTime;
  } catch (error) {
    console.error('Failed to get total time for each task', error);
    throw error;
  }
};

// Calculate total active time for all tasks within a period
export const totalTimeActiveForAllTask = async ({ period, startTime, endTime } = {}) => {
  try {
    const params = {};

    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await api.get(`/timestamps/totaltimeactiveforalltask`, {
      params,
    });
    return res.data.totalTime;
  } catch (error) {
    console.error('Failed to get total time for all tasks ', error);
    throw error;
  }
};

// Calculate total active time per day for a specific task
export const totalTimeActiveForEachTaskDaily = async ({
  taskId,
  period,
  startTime,
  endTime,
} = {}) => {
  try {
    const params = {};

    if (taskId) params.taskId = taskId;
    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await api.get(`/timestamps/totaltimeactiveforeachtaskdaily`, {
      params,
    });
    return res.data.totalTimePerDay;
  } catch (error) {
    console.error('Failed to get total time per day for task ', error);
    throw error;
  }
};

// Calculate total active time per day for all tasks
export const totalTimeActiveForAllTasksDaily = async ({ period, startTime, endTime } = {}) => {
  try {
    const params = {};

    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await api.get(`/timestamps/totaltimeactiveforalltasksdaily`, {
      params,
    });
    return res.data.totalTimePerDay;
  } catch (error) {
    console.error('Failed to get total time per day for all tasks ', error);
    throw error;
  }
};

// Calculate total active time per hour for all tasks today
export const totalTimeActiveForAllTasksPerHour = async () => {
  try {
    const res = await api.get(`/timestamps/totaltimeactiveforalltasksperhour`);
    const hours = res.data.hours;
    return hours;
  } catch (error) {
    console.error('Failed to get total time per hour ', error);
    throw error;
  }
};

// Calculate total active time for each tag
export const totalTimeActiveForEachTag = async ({ period, startTime, endTime }) => {
  try {
    const params = {};

    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await api.get(`/timestamps/totaltimeactiveforeachtag`, { params });
    const tagTotals = res.data.tagTotals;

    return tagTotals;
  } catch (error) {
    console.error('Failed to get total time for each tag ', error);
    throw error;
  }
};

// Get the day with the most completed tasks in a period
export const getMostProductive = async ({ period, startTime, endTime }) => {
  if (period === 'today') return { day: null, count: 0 };

  try {
    const params = {};

    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await api.get(`/timestamps/mostproductiveday`, { params });
    const { day, weekday, count } = res.data.mostProductiveDay;

    return { day, weekday, count };
  } catch (error) {
    console.error('Failed to get most productive ', error);
    throw error;
  }
};

// Calculate the longest continuous active streak for any task in a period
export const getMostActiveStreak = async ({ period, startTime, endTime }) => {
  try {
    const params = {};

    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await api.get(`/timestamps/mostactivestreak`, { params });
    const { maxStreak, maxTotalTaskActiveDuringStreak } = res.data.mostActiveStreak;

    return { maxStreak, maxTotalTaskActiveDuringStreak };
  } catch (error) {
    console.error('Failed to get most active streak ', error);
    throw error;
  }
};

// Get total number of task starts and average tasks started per day in a period
export const getTaskStartStats = async ({ period, startTime, endTime }) => {
  try {
    const params = {};

    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await api.get(`/timestamps/taskstartstats`, { params });
    const { totalActiveStarts, avgTasksPerDay } = res.data.taskStartStats;

    return { totalActiveStarts, avgTasksPerDay };
  } catch (error) {
    console.error('Failed to get number of task starts ', error);
    throw error;
  }
};

// Get tasks with active time within a given start and end interval
export const getTasksOfInterest = async ({ start, end }) => {
  try {
    const res = await api.get(`/tasks/tasksofinterest`, {
      params: { start, end },
    });
    const taskOfInterest = res.data.taskOfInterest;

    return taskOfInterest;
  } catch (error) {
    console.error('Failed to get task of interest ', error);
    throw error;
  }
};

// Aggregate tags with total active time and number of tasks for a given period
export const getTagsOfInterest = async ({ start, end }) => {
  try {
    const res = await api.get(`/tags/tagsofinterest`, {
      params: { start, end },
    });
    const tagsOfInterest = res.data.tagsOfInterest;

    return tagsOfInterest;
  } catch (error) {
    console.error('Failed to get tag of interest ', error);
    throw error;
  }
};


// Generate daily bar chart data for a task within a date range, adjusted to Finland timezone
export const getTaskDailyBarChart = async ({ task, start, end }) => {
  try {
    const res = await api.get(`/tasks/taskdailybarchart`, {
      params: {taskId: task, start, end },
    });
    const taskDaily = res.data.taskDaily;

    return taskDaily;
  } catch (error) {
    console.error('Failed to get task daily bar chart ', error);
    throw error;
  }
};

// Get detailed activity intervals for a specific task within a time range
export const getTaskDetailsIntervals = async ({ start, end, task }) => {
  try {
    const res = await api.get(`/tasks/taskdetailsintervals`, {
      params: {taskId: task, startTime: start, endTime: end },
    });
    const activityIntervals = res.data;
    return activityIntervals;
  } catch (error) {
    console.error('Failed to get task details intervals ', error);
    throw error;
  }
};

// Calculate statistics for a task
export const getTaskStats = async () => {
  try {
    const res = await api.get(`/tasks/taskstats`);
    return res.data
  } catch (error) {
    console.error('Failed to get task stats ', error);
    throw error;
  }
};

// Check which intervals overlap in a list before update interval
export const checkOverlap = (intervals) => {
  if (!Array.isArray(intervals)) return [];

  const normalized = intervals.map((it, idx) => {
    const start = new Date(it.start).getTime();
    const end = it.end ? new Date(it.end).getTime() : Date.now();
    return { start, end, idx };
  });

  const flags = new Array(intervals.length).fill(false);

  for (let i = 0; i < normalized.length; i++) {
    const a = normalized[i];
    if (isNaN(a.start) || isNaN(a.end)) continue;

    for (let j = i + 1; j < normalized.length; j++) {
      const b = normalized[j];
      if (isNaN(b.start) || isNaN(b.end)) continue;

      if (a.start < b.end && a.end > b.start) {
        flags[a.idx] = true;
        flags[b.idx] = true;
      }
    }
  }

  return flags;
};


// Check if a new interval overlaps with existing intervals for a task before create new interval
export const checkNewIntervalOverlap = async ({start, end, taskId}) => {
  try {
    const res = await api.get(`/timestamps/isoverlapping`, {
      params: {taskId, start, end},
    });
    const isOverlapping = res.data;
    return isOverlapping;
  } catch (error) {
    console.error('Error checking interval overlap:', error);
    return false;
  }
};
