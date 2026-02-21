import axios from 'axios';

import { getAllTags } from './Tags';
import { getAllTasks } from './Tasks';

const API_URL = 'http://localhost:3000/api';

export const getAllTimestamps = async () => {
  try {
    const res = await axios.get(`${API_URL}/timestamps`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch timestamps ', error);
    throw error;
  }
};

export const getTimestampByTaskId = async (taskId) => {
  try {
    const res = await axios.get(`${API_URL}/timesfortask/${taskId}`);
    return res.data;
  } catch (error) {
    console.error('Failed to fetch timestamp by task id ', error);
    throw error;
  }
};

export const getTimestampById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/timestamps/${id}`);
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
    const res = await axios.post(`${API_URL}/timestamps`, {
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

export const createTimestampWithCustomTime = async (taskId, customTimestamp, type = 1) => {
  try {
    const res = await axios.post(`${API_URL}/timestamps`, {
      timestamp: customTimestamp,
      task: taskId,
      type: type,
    });

    return res.data;
  } catch (error) {
    console.error('Failed to create timestamp with custom time ', error);
    throw error;
  }
};

export const updateTimestampById = async (timestampId, updatedFields) => {
  try {
    const res = await axios.patch(`${API_URL}/timestamps/${timestampId}`, updatedFields);
    return res.data;
  } catch (error) {
    console.error('Failed to update this timestamp ', error);
    throw error;
  }
};

export const deleteTimestamp = async (timestampId) => {
  try {
    const res = await axios.delete(`${API_URL}/timestamps/${timestampId}`);
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
    const res = await axios.get(`${API_URL}/tasks/orderedtasks`, { params: { ids } });
    return res.data;
  } catch (error) {
    console.error('Failed to get ordered tasks ', error);
    throw error;
  }
};

// Filter timestamps by a given period (today, thisWeek, thisMonth, all)
export const getTimestampsByPeriod = async ({ period, startTime, endTime } = {}) => {
  try {
    const params = {};

    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await axios.get(`${API_URL}/timestamps/timestampsbyperiod`, { params });
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

    const res = await axios.get(`${API_URL}/timestamps/totaltimeactiveforeachtask`, {
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


    const res = await axios.get(`${API_URL}/timestamps/totaltimeactiveforalltask`, {
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

    const res = await axios.get(`${API_URL}/timestamps/totaltimeactiveforeachtasksdaily`, {
      params,
    });
    return res.data.totalTimePerDay;
  } catch (error) {
    console.error('Failed to get total time per day for task ', error);
    throw error;
  }
};

// Calculate total active time per day for all tasks
export const totalTimeActiveForAllTaskDaily = async ({ period, startTime, endTime } = {}) => {
  try {
    const params = {};

    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await axios.get(`${API_URL}/timestamps/totaltimeactiveforalltasksdaily`, {
      params,
    });
    return res.data.totalTimePerDay;
  } catch (error) {
    console.error('Failed to get total time per day for all tasks ', error);
    throw error;
  }
};

// Calculate total active time per hour for all tasks today
export const totalTimeActiveForAllTaskPerHour = async () => {
  try {
    const res = await axios.get(`${API_URL}/timestamps/totaltimeactiveforalltasksperhour`);
    const hours = res.data.hours;
    return hours;
  } catch (error) {
    console.error('Failed to get total time per hour ', error);
    throw error;
  }
};

// Calculate total active time for each tag
export const totalTimeActiveForEachTag = async ({period, startTime, endTime}) => {
  try {
    const params = {};

    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await axios.get(`${API_URL}/timestamps/totaltimeactiveforeachtag`, { params });
    const tagTotals = res.data.tagTotals;

    return tagTotals;
  } catch (error) {
    console.error('Failed to get total time for each tag ', error);
    throw error;
  }
};

// Get the day with the most completed tasks in a period
export const getMostProductive = async ({period, startTime, endTime}) => {
  if (period === 'today') return { day: null, count: 0 };

  try {
    const params = {};

    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await axios.get(`${API_URL}/timestamps/mostproductiveday`, { params });
    const { day, weekday, count } = res.data.mostProductiveDay;

    return { day, weekday, count };
  } catch (error) {
    console.error('Failed to get most productive ', error);
    throw error;
  }
};

// Calculate the longest continuous active streak for any task in a period
export const getMostActiveStreak = async ({period, startTime, endTime}) => {
  try {
    const params = {};

    if (period) params.period = period;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const res = await axios.get(`${API_URL}/timestamps/mostactivestreak`, { params });
    const { maxStreak, maxTotalTaskActiveDuringStreak } = res.data.mostActiveStreak;

    return { maxStreak, maxTotalTaskActiveDuringStreak };
  } catch (error) {
    console.error('Failed to get most active streak ', error);
    throw error;
  }
};

// Get total number of task starts and average tasks started per day in a period
export const getMostActiveTimes = async (period) => {
  try {
    const allTimestamps = await getTimestampsByPeriod({ period });

    const totalActiveStarts = allTimestamps.filter((t) => t.type === 'start').length;

    const activePerDay = {};
    allTimestamps.forEach((t) => {
      if (t.type === 'start') {
        const day = new Date(t.timestamp).toISOString().slice(0, 10);
        if (!activePerDay[day]) activePerDay[day] = new Set();
        activePerDay[day].add(t.task);
      }
    });

    const days = Object.keys(activePerDay).length;
    const avgTasksPerDay =
      days > 0 ? Object.values(activePerDay).reduce((sum, set) => sum + set.size, 0) / days : 0;

    return { totalActiveStarts, avgTasksPerDay };
  } catch (error) {
    console.error('Failed to get most active times ', error);
    throw error;
  }
};

// Get tasks with active time within a given start and end interval
export const getTasksOfInterest = async ({ start, end }) => {
  const startTimeInterval = new Date(start);
  const userSelectedEnd = new Date(end);
  const now = new Date();
  const endTimeInterval = userSelectedEnd > now ? now : userSelectedEnd;

  const tasks = await getAllTasks();

  const tasksWithTimestamps = await Promise.all(
    tasks.map(async (task) => {
      const timestamps = await getTimestampByTaskId(task._id);

      timestamps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      let activeTime = 0;
      let currentStart = null;
      let hasActiveInInterval = false;

      for (const t of timestamps) {
        const ts = new Date(t.timestamp);

        if (t.type === 'start') {
          if (ts >= startTimeInterval && ts <= endTimeInterval) {
            currentStart = ts;
            hasActiveInInterval = true;
          }
        } else if (t.type === 'end' && currentStart) {
          const tsEnd = ts;
          if (tsEnd <= startTimeInterval) {
            currentStart = null;
            continue;
          }
          const effectiveEnd = tsEnd > endTimeInterval ? endTimeInterval : tsEnd;
          activeTime += effectiveEnd - currentStart;
          currentStart = null;
          hasActiveInInterval = true;
        }
      }

      if (currentStart && currentStart < endTimeInterval) {
        activeTime += endTimeInterval - currentStart;
        hasActiveInInterval = true;
      }

      if (!hasActiveInInterval || activeTime <= 0) return null;

      return {
        id: task._id,
        title: task.title,
        tags: task.tags,
        description: task.description,
        activeTime,
      };
    }),
  );

  return tasksWithTimestamps.filter(Boolean);
};

// Aggregate tags with total active time and number of tasks for a given period
export const getTagsOfInterest = async ({ start, end }) => {
  const tasks = await getTasksOfInterest({ start, end });
  const allTags = await getAllTags();

  const tagStatsMap = {};
  tasks.forEach((task) => {
    if (!task.tags) return;

    const taskTagIds = task.tags
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter(Boolean);

    taskTagIds.forEach((tagId) => {
      if (!tagStatsMap[tagId]) {
        tagStatsMap[tagId] = {
          totalTime: 0,
          taskIds: new Set(),
        };
      }
      tagStatsMap[tagId].totalTime += task.activeTime || 0;
      tagStatsMap[tagId].taskIds.add(task._id);
    });
  });

  const tagsOfInterest = Object.entries(tagStatsMap)
    .map(([tagIdStr, { totalTime, taskIds }]) => {
      const tagId = parseInt(tagIdStr, 10);
      const tagObj = allTags.find((t) => t._id === tagId);
      if (!tagObj) return null;

      return {
        id: tagObj._id,
        title: tagObj.title,
        description: tagObj.description,
        activeTime: totalTime,
        numberOfTasks: taskIds.size,
      };
    })
    .filter(Boolean);

  return tagsOfInterest;
};

// Get detailed activity intervals for a specific task within a time range
export const getTaskDetailsIntervals = async ({ start, end, task }) => {
  const startInterval = new Date(start);
  const endIntervalUser = new Date(end);
  const now = new Date();
  const endInterval = endIntervalUser > now ? now : endIntervalUser;

  const timestamps = await getTimestampByTaskId(task._id);
  timestamps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const activityIntervals = [];
  let currentStart = null;
  let currentStartId = null;

  for (const t of timestamps) {
    const ts = new Date(t.timestamp);

    if (t.type === 'start') {
      currentStart = ts;
      currentStartId = t._id;
    } else if (t.type === 'end' && currentStart) {
      const tsEnd = ts;

      const overlapStart = currentStart < endInterval ? currentStart : null;
      const overlapEnd = tsEnd > startInterval ? tsEnd : null;

      if (overlapStart && overlapEnd && overlapStart < overlapEnd) {
        activityIntervals.push({
          startTsId: currentStartId,
          endTsId: t._id,
          startTime: overlapStart < startInterval ? startInterval : overlapStart,
          endTime: overlapEnd > endInterval ? endInterval : overlapEnd,
          duration: overlapEnd - overlapStart,
          status: 'End',
          originalStart: currentStart,
          originalEnd: tsEnd,
        });
      }

      currentStart = null;
      currentStartId = null;
    }
  }

  if (currentStart && currentStart < endInterval) {
    const overlapStart = currentStart < endInterval ? currentStart : null;
    if (overlapStart) {
      activityIntervals.push({
        startTsId: currentStartId,
        endTsId: null,
        startTime: overlapStart < startInterval ? startInterval : overlapStart,
        endTime: null,
        duration: Date.now() - overlapStart.getTime(),
        status: 'Ongoing',
        originalStart: currentStart,
        originalEnd: null,
      });
    }
  }

  const filteredIntervals = activityIntervals.filter((interval) => interval.duration > 0);
  filteredIntervals.sort((a, b) => a.startTime - b.startTime);

  return {
    id: task._id,
    title: task.title,
    tags: task.tags,
    description: task.description,
    activityIntervals: filteredIntervals,
  };
};

// Generate daily bar chart data for a task within a date range, adjusted to Finland timezone
export const getTaskDailyBarChart = async ({ task, start, end }) => {
  const formatDateKeyFinland = (d) => {
    const options = {
      timeZone: 'Europe/Helsinki',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(d);
    const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    return `${values.year}-${values.month}-${values.day}`;
  };

  const getFinlandStartOfDay = (d) => {
    const options = {
      timeZone: 'Europe/Helsinki',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false,
    };
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(d);
    const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    return new Date(`${values.year}-${values.month}-${values.day}T00:00:00+02:00`);
  };

  const startDate = getFinlandStartOfDay(new Date(start));
  const endDate = getFinlandStartOfDay(new Date(end));
  endDate.setHours(23, 59, 59, 999);

  const now = new Date();
  if (endDate > now) endDate.setTime(now.getTime());

  const timestamps = await getTimestampByTaskId(task._id);
  timestamps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const activityIntervals = [];
  let currentStart = null;

  for (const t of timestamps) {
    const ts = new Date(t.timestamp);

    if (t.type === 'start') {
      currentStart = ts;
    } else if (t.type === 'end' && currentStart) {
      const overlapStart = currentStart < startDate ? startDate : currentStart;
      const overlapEnd = ts > endDate ? endDate : ts;

      if (overlapStart < overlapEnd) {
        activityIntervals.push({
          startTime: overlapStart,
          endTime: overlapEnd,
          duration: overlapEnd - overlapStart,
          status: 'End',
        });
      }
      currentStart = null;
    }
  }

  if (currentStart && currentStart <= endDate) {
    const overlapStart = currentStart < startDate ? startDate : currentStart;
    const overlapEnd = endDate;
    if (overlapStart < overlapEnd) {
      activityIntervals.push({
        startTime: overlapStart,
        endTime: overlapEnd,
        duration: overlapEnd - overlapStart,
        status: 'Ongoing',
      });
    }
  }

  const dailyMap = {};
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = formatDateKeyFinland(d);
    dailyMap[key] = 0;
  }

  for (const interval of activityIntervals) {
    const startD = new Date(interval.startTime);
    const endD = new Date(interval.endTime);

    let currentDay = getFinlandStartOfDay(startD);

    while (currentDay <= endD) {
      const dayKey = formatDateKeyFinland(currentDay);
      if (dailyMap[dayKey] !== undefined) {
        const dayStart = new Date(currentDay);
        const dayEnd = new Date(currentDay);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const overlapStart = startD > dayStart ? startD : dayStart;
        const overlapEnd = endD < dayEnd ? endD : dayEnd;

        if (overlapStart < overlapEnd) {
          dailyMap[dayKey] += overlapEnd - overlapStart;
        }
      }
      currentDay.setDate(currentDay.getDate() + 1);
    }
  }

  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([day, ms]) => ({
      date: day,
      hours: ms / (1000 * 60 * 60),
      milliseconds: ms,
    }));

  return {
    taskId: task._id,
    taskName: task.title,
    dailyData,
  };
};

// Calculate average statistics for a task: total daily active time, average start/end, break time
export const getTaskAvgStats = async (taskId) => {
  const timestamps = await getTimestampByTaskId(taskId);
  if (!timestamps || timestamps.length === 0) return null;

  timestamps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  let firstStart = null;
  let lastEnd = null;
  let totalActiveMs = 0;
  let startTimes = [];
  let endTimes = [];
  let breakTimes = [];

  let currentStart = null;

  for (const t of timestamps) {
    const ts = new Date(t.timestamp);

    if (t.type === 'start') {
      currentStart = ts;
      startTimes.push(ts.getTime());

      if (!firstStart) {
        firstStart = ts;
      }

      if (lastEnd) {
        breakTimes.push(ts.getTime() - lastEnd.getTime());
      }
    } else if (t.type === 'end' && currentStart) {
      const tsEnd = ts;
      endTimes.push(tsEnd.getTime());
      totalActiveMs += tsEnd - currentStart;
      lastEnd = tsEnd;
      currentStart = null;
    }
  }

  if (currentStart) {
    const now = new Date();
    totalActiveMs += now - currentStart;
    lastEnd = now;
  }

  if (!firstStart) return null;

  const startDay = new Date(firstStart);
  startDay.setHours(0, 0, 0, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;

  const numDays = Math.floor((now - startDay) / msPerDay) + 1;

  const avgTotalTimePerDay = totalActiveMs / numDays;

  const avgStartTime = startTimes.length
    ? startTimes.reduce((sum, ts) => {
        const d = new Date(ts);
        const timeOfDay =
          d.getHours() * 3600000 +
          d.getMinutes() * 60000 +
          d.getSeconds() * 1000 +
          d.getMilliseconds();
        return sum + timeOfDay;
      }, 0) / startTimes.length
    : null;

  const avgEndTime = endTimes.length
    ? endTimes.reduce((sum, ts) => {
        const d = new Date(ts);
        const timeOfDay =
          d.getHours() * 3600000 +
          d.getMinutes() * 60000 +
          d.getSeconds() * 1000 +
          d.getMilliseconds();
        return sum + timeOfDay;
      }, 0) / endTimes.length
    : null;

  const avgBreakTime = breakTimes.length
    ? breakTimes.reduce((a, b) => a + b, 0) / breakTimes.length
    : null;

  return {
    avgTotalTimePerDay,
    avgStartTime,
    avgEndTime,
    avgBreakTime,
  };
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
        flags[a._idx] = true;
        flags[b._idx] = true;
      }
    }
  }

  return flags;
};

// Check if a new interval overlaps with existing intervals for a task before create new interval
export const checkNewIntervalOverlap = async (startTime, endTime, taskId) => {
  try {
    const timestamps = await getTimestampByTaskId(taskId);

    if (!timestamps || timestamps.length === 0) return false;

    const sorted = timestamps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const intervals = [];
    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      if (current.type === 'start') {
        const end = sorted.slice(i + 1).find((ts) => ts.type === 'end');
        if (end) {
          intervals.push({
            start: new Date(current.timestamp).getTime(),
            end: new Date(end.timestamp).getTime(),
          });
        }
      }
    }

    const newInterval = {
      start: new Date(startTime).getTime(),
      end: new Date(endTime).getTime(),
    };
    intervals.push(newInterval);

    for (let i = 0; i < intervals.length; i++) {
      const a = intervals[i];
      for (let j = i + 1; j < intervals.length; j++) {
        const b = intervals[j];
        if (a.start < b.end && a.end > b.start) {
          if (i === intervals.length - 1 || j === intervals.length - 1) {
            return true;
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking interval overlap:', error);
    return false;
  }
};
