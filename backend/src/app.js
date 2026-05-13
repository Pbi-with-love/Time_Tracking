import express from 'express';
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from "./middlewares/errorHandler.js"
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Connect to database
connectDB();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());
app.use(cookieParser())

// API routes
app.use('/api', apiRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to the Time Tracking API');
});


// Error handler
app.use(errorHandler);

export default app;