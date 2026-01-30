import express from 'express';
import tagRoutes from './apiTag.js';
import taskRoutes from './apiTask.js';
import timestampRoutes from './apiTimestamp.js';
import timeForTaskRoutes from './apiTimeForTask.js';

const router = express.Router();

router.use('/tags', tagRoutes);
router.use('/tasks', taskRoutes);
router.use('/timestamps', timestampRoutes);
router.use('/timesfortask', timeForTaskRoutes);

export default router;
