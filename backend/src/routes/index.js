import express from 'express';
import tagRoutes from './apiTag.js';
import taskRoutes from './apiTask.js';
import timestampRoutes from './apiTimestamp.js';
import timeForTaskRoutes from './apiTimeForTask.js';
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();

router.use('/tags', authMiddleware, tagRoutes);
router.use('/tasks', authMiddleware, taskRoutes);
router.use('/timestamps', authMiddleware, timestampRoutes);
router.use('/timesfortask', authMiddleware, timeForTaskRoutes);

export default router;
