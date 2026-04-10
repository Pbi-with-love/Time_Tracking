import { api } from "./axiosClient"

export const getAllTasks = async () => {
  try {
    const res = await api.get(`/tasks`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch tasks ", error);
    throw error;
  }
};

export const getTaskById = async (taskId) => {
  try {
    const res = await api.get(`/tasks/${taskId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch task by id ", error);
    throw error;
  }
};

export const createTask = async (title, description, tagIds) => {
  try {
    const res = await api.post(`/tasks`, {
      title,
      description,
      tags: tagIds,
    });
    return res.data;
  } catch (error) {
    console.error("Failed to create new task ", error);
    throw error;
  }
};

export const updateTask = async (taskId, updatedFields) => {
  try {
    const res = await api.patch(`/tasks/${taskId}`, updatedFields);
    return res.data;
  } catch (error) {
    console.error("Failed to update task ", error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const res = await api.delete(`/tasks/${taskId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete task ", error);
    throw error;
  }
};

export const deleteTagInTaskByTagId = async (tagId) => {
  try {
    const res = await api.get(`/tasks/tag/${tagId}`);
    const tasksWithTag = res.data;
    
    const updateTasks = tasksWithTag.map((t) => {
      const newTags = t.tags.filter((tag) => tag !== tagId);
      return updateTask(t._id, { tags: newTags });
    });

    // An array of each promise res after updating
    const results = await Promise.all(updateTasks);
    return results;
  } catch (error) {
    console.error("Failed to delete tag in task ", error);
    throw error;
  }
};
