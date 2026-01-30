import Timestamp from "../models/Timestamp.js";
import { getAllTimestampsCached } from "./timestampCache.Service.js";

export const getTimestampsByPeriod = async (
  period,
  startTime,
  endTime,
) => {

  const now = new Date();
  let start = null;
  let end = null;

  if (startTime && endTime) {
    start = new Date(startTime);
    end = new Date(endTime) > now ? now : new Date(endTime);
  } else {
    switch (period) {
      case "today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;

      case "thisWeek": {
        const day = now.getDay() || 7;
        start = new Date(now);
        start.setDate(now.getDate() - day + 1);
        start.setHours(0, 0, 0, 0);
        break;
      }

      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        break;

      default:
        return Timestamp.find().lean();
    }

    end = now;
  }

    const timestampInTimeRange = await Timestamp.find({
        startTime: { $lte: end },
        endTime: { $gte: start },
    }).lean();
    console.log("Fetched timestamps from DB for period:", timestampInTimeRange);


  return timestampInTimeRange.map((t) => {
    const s = new Date(t.startTime);
    const e = new Date(t.endTime);

    if (s < start) t.startTime = start.toISOString();
    if (e > end) t.endTime = end.toISOString();

    return t;
  });
};
