import redis from "../../config/redisClient.js";
import Task from "../../models/Task.js";
import { taskKey, allTasksKey } from "../../utils/redisKey.js";

/**
 * Every read and write filters on `user`, so an id belonging to another
 * user resolves to null (surfacing as a 404) rather than leaking a document.
 */

export const getTaskCached = async (userId, taskId) => {
  const cached = await redis.get(taskKey(userId, taskId));

  if (cached) {
    return JSON.parse(cached);
  }

  const task = await Task.findOne({ _id: taskId, user: userId }).lean();
  if (!task) {
    return null;
  }
  await redis.set(taskKey(userId, taskId), JSON.stringify(task), { EX: 300 });

  return task;
};

export const getTasksCachedByMultipleIds = async (userId, taskIds) => {
  if (taskIds.length === 0) return [];

  const map = new Map();
  const missingIds = [];

  const key = taskIds.map((id) => taskKey(userId, id));
  const cachedRaw = await redis.mGet(key);

  cachedRaw.forEach((cache, index) => {
    const id = taskIds[index];
    if (cache) map.set(id, JSON.parse(cache));
    else missingIds.push(taskIds[index]);
  })

  if (missingIds.length > 0) {
    const missingTasks = await Task.find({
      _id: { $in: missingIds },
      user: userId,
    }).lean();

    for (const task of missingTasks) {
      const id = task._id.toString();
      map.set(id, task);
    }
    await Promise.all(
      missingTasks.map((t) => {
        redis.set(taskKey(userId, t._id.toString()), JSON.stringify(t), {
          EX: 300
        })
      })
    )
  }

  return taskIds.map((id) => map.get(id.toString())).filter(Boolean);
};

export const getAllTasksIDCached = async (userId) => {
  const cachedAllTaskId = await redis.get(allTasksKey(userId));

  if (cachedAllTaskId) {
    return JSON.parse(cachedAllTaskId);
  }

  const tasks = await Task.find({ user: userId }).lean();
  const ids = tasks.map((t) => t._id.toString());

  await redis.set(allTasksKey(userId), JSON.stringify(ids), { EX: 300 });
  return ids;
};

export const getAllTaskCached = async (userId) => {
  const cachedAllTaskId = await redis.get(allTasksKey(userId));

  if (cachedAllTaskId) {
    const ids = JSON.parse(cachedAllTaskId);

    const keys = ids.map((id) => taskKey(userId, id));

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
      const missingTasks = await Task.find({
        _id: { $in: missingIds },
        user: userId,
      }).lean();

      tasksCache.push(...missingTasks);
      await Promise.all(
        missingTasks.map((t) =>
          redis.set(taskKey(userId, t._id), JSON.stringify(t), { EX: 300 })
        )
      );
    }

    return tasksCache;
  }

  const tasks = await Task.find({ user: userId }).lean();
  const ids = tasks.map((t) => t._id.toString());

  await redis.set(allTasksKey(userId), JSON.stringify(ids), { EX: 300 });

  for (const task of tasks) {
    await redis.set(taskKey(userId, task._id), JSON.stringify(task), {
      EX: 300,
    });
  }

  return tasks;
};

export const createTaskCached = async (userId, data) => {
  // `user` is set here rather than from the request body, so ownership
  // can never be spoofed by the client
  const newTask = new Task({ ...data, user: userId });
  await newTask.save();

  const plainTask = newTask.toObject();

  // Invalidate all tasks cache
  await redis.del(allTasksKey(userId));
  await redis.set(taskKey(userId, plainTask._id), JSON.stringify(plainTask), {
    EX: 300,
  });

  return plainTask;
};

export const updateTaskCached = async (userId, taskId, updatedData) => {
  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId, user: userId },
    updatedData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedTask) return null;

  const plainTask = updatedTask.toObject();

  // Invalidate cache
  await redis.del(allTasksKey(userId));
  await redis.set(taskKey(userId, taskId), JSON.stringify(plainTask), {
    EX: 300,
  });

  return plainTask;
};

export const deleteTaskCached = async (userId, taskId) => {
  const deletedTask = await Task.findOneAndDelete({
    _id: taskId,
    user: userId,
  });

  if (!deletedTask) return null;

  // Invalidate cache
  await redis.del(taskKey(userId, taskId));
  await redis.del(allTasksKey(userId));

  return deletedTask;
};
