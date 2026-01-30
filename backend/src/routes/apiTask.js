import express from 'express';
import { getAllTasks, getTaskById, getTasksByTagId, createTask, updateTask, deleteTask } from '../controllers/TaskController.js';
import { getOrderedTasks } from "../controllers/TaskOrder.js";
const router = express.Router();

// --- Task routes ---
router.get('/', getAllTasks);
// --- Sort order ---
router.get("/orderedtasks", getOrderedTasks);
router.get('/tag/:tagId', getTasksByTagId);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);



export default router;
