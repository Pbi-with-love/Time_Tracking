import express from "express";
import {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/TagController.js";
import {
  getAllTasks,
  getTaskById,
  getTasksByTagId,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/TaskController.js";
import {
  getAllTimestamps,
  getTimestampById,
  getTimestampsForTask,
  createTimestamp,
  updateTimestamp,
  deleteTimestamp,
} from "../controllers/TimestampController.js";
import { getOrderedTasks } from "../controllers/TaskOrder.js";

const router = express.Router();

// --- Tag routes ---
router.get("/tags", getAllTags);
router.get("/tags/:id", getTagById);
router.post("/tags", createTag);
router.patch("/tags/:id", updateTag); 
router.delete("/tags/:id", deleteTag);

// --- Task routes ---
router.get("/tasks", getAllTasks);
router.get("/tasks/tag/:tagId", getTasksByTagId);
router.get("/tasks/:id", getTaskById);
router.post("/tasks", createTask);
router.patch("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

// --- Timestamp routes ---
router.get("/timestamps", getAllTimestamps);
router.get("/timestamps/:id", getTimestampById);

// --- Sort order ---
router.get("/orderedtasks", getOrderedTasks);

// Get timestamps for a specific task, with optional type filter
router.get("/timesfortask/:taskId", getTimestampsForTask);
router.get("/timesfortask/:taskId/:type", getTimestampsForTask);

router.post("/timestamps", createTimestamp);
router.patch("/timestamps/:id", updateTimestamp);
router.delete("/timestamps/:id", deleteTimestamp);

export default router;
