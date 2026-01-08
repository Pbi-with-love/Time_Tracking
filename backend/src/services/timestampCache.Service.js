import redis from "../config/redisClient.js";
import Timestamp from "../models/Timestamp.js";
import { timestampKey, allTimestampsKey } from "../utils/redisKey.js";

// GET single timestamp cached
export const getTimestampCached = async (tsId) => {
  const cached = await redis.get(timestampKey(tsId));
  if (cached) return JSON.parse(cached);

  const ts = await Timestamp.findById(tsId).populate("startRef").lean();
  if (!ts) return null;

  await redis.set(timestampKey(tsId), JSON.stringify(ts), { EX: 300 });
  return ts;
};

// GET all timestamps cached
export const getAllTimestampsCached = async () => {
  const allCached = await redis.get(allTimestampsKey());

  if (allCached) {
    const ids = JSON.parse(allCached);
    const keys = ids.map((id) => timestampKey(id));
    const cachedRaw = await redis.mGet(keys);

    const timestampsCache = [];
    const missingIds = [];

    cachedRaw.forEach((cache, index) => {
      if (cache) timestampsCache.push(JSON.parse(cache));
      else missingIds.push(ids[index]);
    });

    if (missingIds.length > 0) {
      const missingTs = await Timestamp.find({
        _id: { $in: missingIds },
      }).populate("startRef").lean();

      timestampsCache.push(...missingTs);
      await Promise.all(
        missingTs.map((ts) =>
          redis.set(timestampKey(ts._id.toString()), JSON.stringify(ts), {
            EX: 300,
          })
        )
      );
    }

    return timestampsCache;
  }

  const allTs = await Timestamp.find().populate("startRef").lean();
  const ids = allTs.map((ts) => ts._id.toString());

  await redis.set(allTimestampsKey(), JSON.stringify(ids), { EX: 300 });

  for (const ts of allTs) {
    await redis.set(timestampKey(ts._id), JSON.stringify(ts), { EX: 300 });
  }

  return allTs;
};

// CREATE timestamp cached
export const createTimestampCached = async (data) => {
  const newTs = new Timestamp(data);
  await newTs.save();

  const populatedTs = await newTs.populate("startRef");

  const plainTs = populatedTs.toObject();

  // Invalidate all cache
  await redis.del(allTimestampsKey());
  await redis.set(
    timestampKey(plainTs._id.toString()),
    JSON.stringify(plainTs),
    { EX: 300 }
  );

  return plainTs;
};

// UPDATE timestamp cached
export const updateTimestampCached = async (tsId, updatedData) => {
  const updatedTs = await Timestamp.findByIdAndUpdate(tsId, updatedData, {
    new: true,
    runValidators: true,
  }).populate("startRef");

  if (!updatedTs) return null;

  const plainTs = updatedTs.toObject();

  await redis.del(allTimestampsKey());
  await redis.set(timestampKey(tsId), JSON.stringify(plainTs), { EX: 300 });

  return plainTs;
};

// DELETE timestamp cached
export const deleteTimestampCached = async (tsId) => {
  const deletedTs = await Timestamp.findByIdAndDelete(tsId);
  if (!deletedTs) return null;

  await redis.del(timestampKey(tsId));
  await redis.del(allTimestampsKey());

  return deletedTs;
};
