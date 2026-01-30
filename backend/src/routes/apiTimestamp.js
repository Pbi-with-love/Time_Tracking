import express from 'express';
import {
  getAllTimestamps,
  getTimestampById,
  getTimestampsForTask,
  createTimestamp,
  updateTimestamp,
  deleteTimestamp,
} from "../controllers/TimestampController.js";
import { handleGetTimestampsByPeriod } from "../controllers/HandlePeriod.js";

const router = express.Router();

// --- Period-based timestamp retrieval ---
router.get("/timestampsbyperiod", handleGetTimestampsByPeriod);

// --- Timestamp routes ---
router.get("/", getAllTimestamps);
router.get("/:id", getTimestampById);


router.post("/", createTimestamp);
router.patch("/:id", updateTimestamp);
router.delete("/:id", deleteTimestamp);

export default router;