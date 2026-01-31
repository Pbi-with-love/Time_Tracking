import express from "express";
import {
  getAllTimestamps,
  getTimestampById,
  createTimestamp,
  updateTimestamp,
  deleteTimestamp,
} from "../controllers/TimestampController.js";
import {
  handleGetTimestampsByPeriod,
  handleTotalTimeActiveForEachTask,
  handleTotalTimeActiveForAllTask,
  handleTotalTimeActiveForEachTasksDaily,
} from "../controllers/HandlePeriod.js";

const router = express.Router();

// --- Period-based timestamp retrieval ---
router.get("/timestampsbyperiod", handleGetTimestampsByPeriod);

// --- Period-based total active time for each task ---`
router.get("/totaltimeactiveforeachtask", handleTotalTimeActiveForEachTask);

// --- Period-based total active time for all tasks ---
router.get("/totaltimeactiveforalltask", handleTotalTimeActiveForAllTask);

// --- Period-based total active time for each task daily ---
router.get(
  "/totaltimeactiveforeachtasksdaily",
  handleTotalTimeActiveForEachTasksDaily
);

// --- Timestamp routes ---
router.get("/", getAllTimestamps);
router.get("/:id", getTimestampById);

router.post("/", createTimestamp);
router.patch("/:id", updateTimestamp);
router.delete("/:id", deleteTimestamp);

export default router;
