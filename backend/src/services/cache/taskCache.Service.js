import redis from "../../config/redisClient.js";
import Task from "../../models/Task.js";
import { taskKey, allTasksKey } from "../../utils/redisKey.js";

export const getTaskCached = async (taskId) => {
  const cached = await redis.get(taskKey(taskId));

  if (cached) {
    return JSON.parse(cached);
  }

  const task = await Task.findById(taskId).lean();
  if (!task) {
    return null;
  }
  await redis.set(taskKey(taskId), JSON.stringify(task), { EX: 300 });

  return task;
};

export const getTasksCachedByMultipleIds = async (taskIds) => {
  if (taskIds.length === 0) return [];

  const map = new Map();
  const missingIds = [];

  const key = taskIds.map((id) => taskKey(id));
  const cachedRaw = await redis.mGet(key);

  cachedRaw.forEach((cache, index) => {
    const id = taskIds[index];
    if (cache) map.set(id, JSON.parse(cache));
    else missingIds.push(taskIds[index]);
  })

  if (missingIds.length > 0) {
    const missingTasks = await Task.find({
      _id: { $in: missingIds },
    }).lean();

    for (const task of missingTasks) {
      const id = task._id.toString();
      map.set(id, task);
    }
    await Promise.all(
      missingTasks.map((t) => {
        redis.set(taskKey(t._id.toString()), JSON.stringify(t), {
          EX: 300
        })
      })
    )
  }

  return taskIds.map((id) => map.get(id.toString())).filter(Boolean);
};

export const getAllTasksIDCached = async () => {
  const cachedAllTaskId = await redis.get(allTasksKey());

  if (cachedAllTaskId) {
    return JSON.parse(cachedAllTaskId);
  }

  const tasks = await Task.find().lean();
  const ids = tasks.map((t) => t._id.toString());

  await redis.set(allTasksKey(), JSON.stringify(ids), { EX: 300 });
  return ids;
};

export const getAllTaskCached = async () => {
  const cachedAllTaskId = await redis.get(allTasksKey());

  if (cachedAllTaskId) {
    console.log("hit cache");
    const ids = JSON.parse(cachedAllTaskId);

    const keys = ids.map((id) => taskKey(id));

    if (!ids.length) {
      return [];
    }

    // Use mGet to fetch multiple keys at once
    const cachedTasksRaw = await redis.mGet(keys);

    const tasksCache = [];
    const missingIds = [];

    cachedTasksRaw.forEach((cache, index) => {
      if (cache) {
        tasksCache.push(JSON.parse(cache));
      } else {
        missingIds.push(ids[index]);
      }
    });

    if (missingIds.length > 0) {
      const missingTasks = await Task.find({ _id: { $in: missingIds } }).lean();

      tasksCache.push(...missingTasks);
      await Promise.all(
        missingTasks.map((t) =>
          redis.set(taskKey(t._id), JSON.stringify(t), { EX: 300 })
        )
      );
    }

    return tasksCache;
  }

  const tasks = await Task.find().lean();
  const ids = tasks.map((t) => t._id.toString());

  await redis.set(allTasksKey(), JSON.stringify(ids), { EX: 300 });

  for (const task of tasks) {
    await redis.set(taskKey(task._id), JSON.stringify(task), { EX: 300 });
  }

  return tasks;
};

export const createTaskCached = async (data) => {
  const newTask = new Task(data);
  await newTask.save();

  const plainTask = newTask.toObject();

  // Invalidate all tasks cache
  await redis.del(allTasksKey());
  await redis.set(taskKey(plainTask._id), JSON.stringify(plainTask), {
    EX: 300,
  });

  return plainTask;
};

export const updateTaskCached = async (taskId, updatedData) => {
  const updatedTask = await Task.findByIdAndUpdate(taskId, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!updatedTask) return null;

  const plainTask = updatedTask.toObject();

  // Invalidate cache
  await redis.del(allTasksKey());
  await redis.set(taskKey(taskId), JSON.stringify(plainTask), { EX: 300 });

  return plainTask;
};

export const deleteTaskCached = async (taskId) => {
  const deletedTask = await Task.findByIdAndDelete(taskId);

  if (!deletedTask) return null;

  // Invalidate cache
  await redis.del(taskKey(taskId));
  await redis.del(allTasksKey());

  return deletedTask;
};


