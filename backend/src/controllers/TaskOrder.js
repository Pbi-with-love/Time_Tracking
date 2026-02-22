import Timestamp from "../models/Timestamp.js";
import mongoose from "mongoose";

export const getOrderedTasks = async (req, res, next) => {
  try {
    const taskIds = req.query.ids.split(",");
    
    const objectIdTaskIds = taskIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
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
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "_id",
          as: "task",
        },
      },
      {
        $addFields: {
          task: { $arrayElemAt: ["$task", 0] },
        },
      },
      {
        $project: {
          lastTs: 1,
          title: "$task.title",
          description: "$task.description",
          tags: "$task.tags",
          taskCreatedAt: "$task.createdAt",
          taskUpdatedAt: "$task.updatedAt",
        },
      },
    ]);

    const tasksCurrentStatus = statuses.map(
      ({
        _id,
        lastTs,
        title,
        description,
        tags,
        taskCreatedAt,
        taskUpdatedAt,
      }) => {
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

        return {
          _id,
          lastStart,
          lastEnd,
          isEnd,
          title,
          description,
          tags,
          taskCreatedAt,
          taskUpdatedAt,
        };
      }
    );
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
    console.log(err);
    next(err);
  }
};
