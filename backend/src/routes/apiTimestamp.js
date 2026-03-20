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
  handleTotalTimeActiveForAllTasksDaily,
  handleTotalTimeActiveForAllTasksPerHour,
  handleTotalTimeActiveForEachTag,
  handleMostProductiveDay,
  handleMostActiveStreak,
  handleTaskStartStats,
  handleCheckNewIntervalOverlap
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
  "/totaltimeactiveforeachtaskdaily",
  handleTotalTimeActiveForEachTasksDaily,
);

// --- Period-based total active time for all tasks daily ---
router.get(
  "/totaltimeactiveforalltasksdaily",
  handleTotalTimeActiveForAllTasksDaily,
);

// --- Period-based total active time for all tasks per hour ---
router.get(
  "/totaltimeactiveforalltasksperhour",
  handleTotalTimeActiveForAllTasksPerHour,
);

// --- Period-based total active time for each tag ---
router.get("/totaltimeactiveforeachtag", handleTotalTimeActiveForEachTag);

// --- Period-based: day with the highest number of completed tasks tracked --- 
router.get("/mostproductiveday", handleMostProductiveDay)

// --- Period-based: longest time that having at least 1 task is active
router.get("/mostactivestreak", handleMostActiveStreak)

// --- Period-based: calculate how many times tasks were started and their daily average
router.get("/taskstartstats", handleTaskStartStats)

// --- Period-based: checking overlaping before creating new interval
router.get("/isoverlapping", handleCheckNewIntervalOverlap)

// --- Timestamp routes ---
router.get("/", getAllTimestamps);
router.get("/:id", getTimestampById);

router.post("/", createTimestamp);
router.patch("/:id", updateTimestamp);
router.delete("/:id", deleteTimestamp);

export default router;
