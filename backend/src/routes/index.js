import express from 'express';
import tagRoutes from './apiTag.js';
import taskRoutes from './apiTask.js';
import timestampRoutes from './apiTimestamp.js';
import timeForTaskRoutes from './apiTimeForTask.js';
import authRoutes from './apiAuth.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
const router = express.Router();

router.use('/auth', authRoutes);

// All routes below require authentication
router.use(authMiddleware);
router.use('/tags', tagRoutes);
router.use('/tasks', taskRoutes);
router.use('/timestamps', timestampRoutes);
router.use('/timesfortask', timeForTaskRoutes);

export default router;

