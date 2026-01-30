import express from 'express';
import {
  getTimestampsForTask,
} from "../controllers/TimestampController.js";

const router = express.Router();

// Get timestamps for a specific task, with optional type filter
router.get("/:taskId", getTimestampsForTask);
router.get("/:taskId/:type", getTimestampsForTask);

export default router;