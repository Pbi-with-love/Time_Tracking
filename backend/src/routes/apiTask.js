import express from 'express';
import { getAllTasks, getTaskById, getTasksByTagId, createTask, updateTask, deleteTask, taskStats,taskDetailsIntervals } from '../controllers/TaskController.js';
import { getOrderedTasks } from "../controllers/TaskOrder.js";
import { handleTasksOfInterest, handleTaskDailyBarChart } from "../controllers/HandlePeriod.js"
const router = express.Router();

// --- Task routes ---
router.get('/', getAllTasks);

// --- Task of interest routes ---
router.get("/tasksofinterest", handleTasksOfInterest);

// --- Specific task daily active time for bar chart
router.get("/taskdailybarchart", handleTaskDailyBarChart);

// --- Stats for each task
router.get("/taskstats", taskStats);

// --- Get interval for one task in a specific time range
router.get("/taskdetailsintervals", taskDetailsIntervals)

// --- Sort order ---
router.get("/orderedtasks", getOrderedTasks);
router.get("/tag/:tagId", getTasksByTagId);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);



export default router;
