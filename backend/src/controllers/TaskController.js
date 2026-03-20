import Task from "../models/Task.js";
import mongoose from "mongoose";
import {
  getAllTaskCached,
  getTaskCached,
  updateTaskCached,
  deleteTaskCached,
  createTaskCached,
} from "../services/cache/taskCache.Service.js";
import { AppError } from "../utils/AppError.js";
import { getTaskStats, getTaskDetailsIntervals } from "../services/taskInterval.Service.js"


// GET all tasks
export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await getAllTaskCached();
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// GET task by ID
export const getTaskById = async (req, res, next) => {
  try {
    const task = await getTaskCached(req.params.id);
    if (!task) throw new AppError("Task not found", 404);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// GET tasks by Tag ID
export const getTasksByTagId = async (req, res, next) => {
  try {
    const { tagId } = req.params;
    const tasks = await Task.find({
      tags: new mongoose.Types.ObjectId(tagId),
    }).lean();
    res.status(200).json(tasks);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// CREATE task
export const createTask = async (req, res, next) => {
  try {
    const { title, description, tags = [] } = req.body;
    const tagIds = tags ? tags.map((id) => new mongoose.Types.ObjectId(id)) : [];

    const newTask = await createTaskCached({
      title,
      description,
      tags: tagIds,
    });

    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
};

// UPDATE task
export const updateTask = async (req, res, next) => {
  try {
    const { tags, ...rest } = req.body;
    console.log("tags" , tags);
    const updatedData = tags
      ? { ...rest, tags: tags.map((id) => new mongoose.Types.ObjectId(id)) }
      : rest;
    const updatedTask = await updateTaskCached(req.params.id, updatedData);
    if (!updatedTask) {
      throw new AppError("Task not found", 404);
    }
    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
    console.log(err);
  }
};

// DELETE task
export const deleteTask = async (req, res, next) => {
  try {
    const deletedTask = await deleteTaskCached(req.params.id);
    if (!deletedTask)
      throw new AppError("Task not found", 404);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const taskStats = async (req, res, next) => {
  try {
    const stats = await getTaskStats();
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}

export const taskDetailsIntervals = async (req, res, next) => {
  try {
    const { taskId, startTime, endTime } = req.query;
    const activityIntervals = await getTaskDetailsIntervals({ taskId, startTime, endTime });
    res.status(200).json(activityIntervals);
  } catch (err) {
    console.log(err);
    next(err);
  }
}