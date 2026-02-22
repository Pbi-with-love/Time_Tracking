import Timestamp from "../models/Timestamp.js";
import mongoose from "mongoose";
import { getTaskCached } from "../services/cache/taskCache.Service.js";
import { AppError } from "../utils/AppError.js";

export const timestampCreateValidate = async ({ task, type, timestamp }) => {
    if (!task || !type) throw new AppError("Missing field", 400);

  if (!mongoose.Types.ObjectId.isValid(task)) {
    throw new AppError("Invalid task ID", 400);
  }

  const taskExists = await getTaskCached(task);
  if (!taskExists) {
    throw new AppError("Task not found", 404);
  }

  if (!["start", "end"].includes(type)) {
    throw new AppError("Invalid timestamp type", 400);
  }

  const tsValue = timestamp ? new Date(timestamp) : new Date();

  let startRef = null;
  let lastStart = null;

  if (type === "end") {
    lastStart = await Timestamp.findOne({
      task,
      type: "start",
      _id: {
        $nin: await Timestamp.distinct("startRef", {
          startRef: { $ne: null },
        }),
      },
    }).sort({ timestamp: -1 });

    if (!lastStart) {
      throw new AppError(
        "Cannot create end timestamp without a matching start",
        400
      );
    }

    startRef = lastStart._id;
  }

  return {
    task,
    type,
    timestamp: tsValue,
    startRef,
  };
};


export const timestampUpdateValidate = async ({ task, type, timestamp }) => {
  const updateData = {};
  if (task) {
    if (!mongoose.Types.ObjectId.isValid(task)) throw new AppError("Invalid task ID", 400);
    const taskExists = await getTaskCached(task);
    if (!taskExists) throw new AppError("Task not found", 404);
    updateData.task = task;
  }
  if (type) {
    if (!["start","end"].includes(type)) throw new AppError("Invalid timestamp type", 400);
    updateData.type = type;
  }
  if (timestamp) updateData.timestamp = new Date(timestamp);
  return updateData;
};
