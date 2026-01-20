import express from 'express';
import connectDB from './config/db.js';
import apiRoutes from './api/api.js';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from "./middlewares/errorHandler.js"

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

// Connect to database
connectDB();

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// API routes
app.use('/api', apiRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Time Tracking API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Error handler
app.use(errorHandler);

export default app;