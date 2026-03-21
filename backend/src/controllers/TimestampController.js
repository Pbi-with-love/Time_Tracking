import Timestamp from "../models/Timestamp.js";
import mongoose from "mongoose";
import {
  getTimestampCached,
  getAllTimestampsCached,
  createTimestampCached,
  updateTimestampCached,
  deleteTimestampCached,
} from "../services/cache/timestampCache.Service.js";
import {
  timestampCreateValidate,
  timestampUpdateValidate,
} from "../validators/timestampValidator.js";
import { AppError } from "../utils/AppError.js";

// GET all timestamps
export const getAllTimestamps = async (req, res, next) => {
  try {
    const timestamps = await getAllTimestampsCached();
    res.status(200).json(timestamps);
  } catch (err) {
    next(err);
  }
};

// GET timestamp by ID
export const getTimestampById = async (req, res, next) => {
  try {
    const ts = await getTimestampCached(req.params.id);
    if (!ts) throw new AppError("Timestamp not found", 404);
    res.status(200).json(ts);
  } catch (err) {
    next(err);
  }
};

export const getTimestampsForTask = async (req, res, next) => {
  try {
    const { taskId, type } = req.params;

    const filter = { task: taskId };
    if (type) filter.type = type;

    const timestamps = await Timestamp.find(filter).populate("startRef").lean();

    res.status(200).json(timestamps);
  } catch (err) {
    next(err);
  }
};

// CREATE timestamp
export const createTimestamp = async (req, res, next) => {
  try {
    const { task, type, timestamp } = req.body;

    const validatedTimestamp = await timestampCreateValidate({
      task,
      type,
      timestamp,
    });

    const newTs = await createTimestampCached(validatedTimestamp);

    res.status(201).json(newTs);
  } catch (err) {
    next(err);
  }
};

// UPDATE timestamp
export const updateTimestamp = async (req, res, next) => {
  try {
    const { timestamp } = req.body;

    if (!timestamp || isNaN(new Date(timestamp))) {
      throw new AppError("Invalid timestamp", 400);
    }

    const updatedTs = await updateTimestampCached(req.params.id, {
      timestamp,
    });

    if (!updatedTs) throw new AppError("Timestamp not found", 404);
    res.status(200).json(updatedTs);
  } catch (err) {
    next(err);
  }
};

// DELETE timestamp
export const deleteTimestamp = async (req, res, next) => {
  try {
    const deletedTs = await deleteTimestampCached(req.params.id);
    if (!deletedTs) throw new AppError("Timestamp not found", 404);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
