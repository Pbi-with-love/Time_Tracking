import redis from "../../config/redisClient.js";
import Timestamp from "../../models/Timestamp.js";
import { timestampKey, allTimestampsKey } from "../../utils/redisKey.js";

// GET single timestamp cached
export const getTimestampCached = async (userId, tsId) => {
  const cached = await redis.get(timestampKey(userId, tsId));
  if (cached) return JSON.parse(cached);

  const ts = await Timestamp.findOne({ _id: tsId, user: userId })
    .populate("startRef")
    .lean();
  if (!ts) return null;

  await redis.set(timestampKey(userId, tsId), JSON.stringify(ts), { EX: 300 });
  return ts;
};

// Get multiple timestamps cached
export const getTimestampsCachedByMultipleIds = async (userId, tsIds) => {
  if (tsIds.length === 0) return [];

  const map = new Map();
  const missingIds = [];

  const keys = tsIds.map((id) => timestampKey(userId, id));
  const cachedRaw = await redis.mGet(keys);

  cachedRaw.forEach((cache, index) => {
    const id = tsIds[index]
    if (cache) map.set(id, JSON.parse(cache));
    else missingIds.push(tsIds[index]);
  });

  if (missingIds.length > 0) {
    const missingTs = await Timestamp.find({
      _id: { $in: missingIds },
      user: userId,
    })
      .populate("startRef")
      .lean();

    for (const ts of missingTs) {
      const id = ts._id.toString();
      map.set(id, ts);
    }

    await Promise.all(
      missingTs.map((ts) =>
        redis.set(timestampKey(userId, ts._id.toString()), JSON.stringify(ts), {
          EX: 300,
        })
      )
    );
  }

  return tsIds.map((id) => map.get(id.toString())).filter(Boolean);
};

// GET all timestamps cached
export const getAllTimestampsCached = async (userId) => {
  const allCached = await redis.get(allTimestampsKey(userId));

  const map = new Map();
  if (allCached) {
    const ids = JSON.parse(allCached);
    if (!ids.length) {
      return [];
    }

    const keys = ids.map((id) => timestampKey(userId, id));
    const cachedRaw = await redis.mGet(keys);

    const missingIds = [];

    cachedRaw.forEach((cache, index) => {
      const id = ids[index];
      if (cache) map.set(id, JSON.parse(cache));
      else missingIds.push(id);
    });

    if (missingIds.length > 0) {
      const missingTs = await Timestamp.find({
        _id: { $in: missingIds },
        user: userId,
      })
        .populate("startRef")
        .lean();

      for (const ts of missingTs) {
        const id = ts._id.toString();
        map.set(id, ts);
      }

      await Promise.all(
        missingTs.map((ts) =>
          redis.set(
            timestampKey(userId, ts._id.toString()),
            JSON.stringify(ts),
            { EX: 300 }
          )
        )
      );
    }

    return ids.map((id) => map.get(id.toString())).filter(Boolean);
  }

  const allTs = await Timestamp.find({ user: userId })
    .populate("startRef")
    .lean();
  const ids = allTs.map((ts) => ts._id.toString());

  await redis.set(allTimestampsKey(userId), JSON.stringify(ids), { EX: 300 });

  for (const ts of allTs) {
    await redis.set(timestampKey(userId, ts._id), JSON.stringify(ts), {
      EX: 300,
    });
  }

  return allTs;
};

// CREATE timestamp cached
export const createTimestampCached = async (userId, data) => {
  // `user` is set here rather than from the request body, so ownership
  // can never be spoofed by the client
  const newTs = new Timestamp({ ...data, user: userId });
  await newTs.save();

  const populatedTs = await newTs.populate("startRef");

  const plainTs = populatedTs.toObject();

  // Invalidate all cache
  await redis.del(allTimestampsKey(userId));
  await redis.set(
    timestampKey(userId, plainTs._id.toString()),
    JSON.stringify(plainTs),
    { EX: 300 }
  );

  return plainTs;
};

// UPDATE timestamp cached
export const updateTimestampCached = async (userId, tsId, updatedData) => {
  const updatedTs = await Timestamp.findOneAndUpdate(
    { _id: tsId, user: userId },
    updatedData,
    {
      new: true,
      runValidators: true,
    },
  ).populate("startRef");

  if (!updatedTs) return null;

  const plainTs = updatedTs.toObject();

  await redis.del(allTimestampsKey(userId));
  await redis.set(timestampKey(userId, tsId), JSON.stringify(plainTs), {
    EX: 300,
  });

  return plainTs;
};

// DELETE timestamp cached
export const deleteTimestampCached = async (userId, tsId) => {
  const deletedTs = await Timestamp.findOneAndDelete({
    _id: tsId,
    user: userId,
  });
  if (!deletedTs) return null;

  await redis.del(timestampKey(userId, tsId));
  await redis.del(allTimestampsKey(userId));

  return deletedTs;
};
