import { getAllTasksIDCached } from "../services/taskCache.Service.js";
import Timestamp from "../models/Timestamp.js";
import mongoose from "mongoose";

export const getOrderedTasks = async (req, res, next) => {
  try {
    const taskIds = await getAllTasksIDCached();
    const objectIdTaskIds = taskIds.map((id) => new mongoose.Types.ObjectId(id));
    const statuses = await Timestamp.aggregate([
      {
        $match: {
          task: { $in: objectIdTaskIds },
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: "$task",
          lastTs: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "timestamps",
          localField: "lastTs.startRef",
          foreignField: "_id",
          as: "startRef",
        },
      },
      {
        $addFields: {
          "lastTs.startRef": { $arrayElemAt: ["$startRef", 0] },
        },
      },
    ]);

    console.log("statuses:", statuses);
    const tasksCurrentStatus = statuses.map(({ _id, lastTs }) => {
      let lastStart = -Infinity;
      let lastEnd = -Infinity;
      let isEnd = true;

      if (lastTs) {
        if (lastTs.type === "start") {
          isEnd = false;
          lastStart = new Date(lastTs.timestamp).getTime();
          lastEnd = Date.now();
        } else if (lastTs.type === "end") {
          isEnd = true;
          lastStart = lastTs.startRef
            ? new Date(lastTs.startRef.timestamp).getTime()
            : -Infinity;

          lastEnd = new Date(lastTs.timestamp).getTime();
        }
      }

      return { taskId: _id, lastStart, lastEnd, isEnd };
    });
    const earliestTasks = [...tasksCurrentStatus].sort(
      (a, b) => a.lastStart - b.lastStart
    );

    const latestTasks = [...tasksCurrentStatus].sort((a, b) => {
      if (!a.isEnd && !b.isEnd) {
        return b.lastStart - a.lastStart;
      }
      return b.lastEnd - a.lastEnd;
    });

    res.status(200).json({ earliestTasks, latestTasks });
  } catch (err) {
    next(err);
  }
};
