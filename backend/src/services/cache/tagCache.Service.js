import redis from "../../config/redisClient.js";
import Tag from "../../models/Tag.js";
import { tagKey, allTagsKey } from "../../utils/redisKey.js";

export const getTagCached = async (userId, tagId) => {
  const tagCached = await redis.get(tagKey(userId, tagId));

  if (tagCached) {
    return JSON.parse(tagCached);
  }

  const tag = await Tag.findOne({ _id: tagId, user: userId }).lean();
  if (!tag) return null;

  await redis.set(tagKey(userId, tagId), JSON.stringify(tag), { EX: 300 });

  return tag;
};

export const getTagsCachedByMultipleIds = async (userId, tagIds) => {
  if (tagIds.length === 0) return [];

  const missingIds = [];
  const map = new Map();

  const key = tagIds.map((id) => tagKey(userId, id));
  const cachedRaw = await redis.mGet(key);

  cachedRaw.forEach((cache, index) => {
    const id = tagIds[index].toString();
    if (cache) map.set(id, JSON.parse(cache));
    else missingIds.push(tagIds[index]);
  });

  if (missingIds.length > 0) {
    const missingTags = await Tag.find({
      _id: { $in: missingIds },
      user: userId,
    }).lean();

    for (const tag of missingTags) {
      const id = tag._id.toString();
      map.set(id, tag);
    }
    await Promise.all(
      missingTags.map((t) => {
        redis.set(tagKey(userId, t._id.toString()), JSON.stringify(t), {
          EX: 300
        })
      })
    )
  }

  return tagIds.map((id) => map.get(id.toString())).filter(Boolean);
}

export const getAllTagCached = async (userId) => {
  const allTagCached = await redis.get(allTagsKey(userId));

  if (allTagCached) {
    const ids = JSON.parse(allTagCached);
    const keys = ids.map((id) => tagKey(userId, id));

    if (!ids.length) {
      return [];
    }

    const cachedTagsRaw = await redis.mGet(keys);

    const tagsCache = [];
    const missingIds = [];

    cachedTagsRaw.forEach((cache, index) => {
      if (cache) {
        tagsCache.push(JSON.parse(cache));
      } else {
        missingIds.push(ids[index]);
      }
    });

    if (missingIds.length > 0) {
      const missingTags = await Tag.find({
        _id: { $in: missingIds },
        user: userId,
      }).lean();

      tagsCache.push(...missingTags);
      await Promise.all(
        missingTags.map((t) =>
          redis.set(tagKey(userId, t._id.toString()), JSON.stringify(t), {
            EX: 300,
          })
        )
      );
    }

    return tagsCache;
  }

  const tags = await Tag.find({ user: userId }).lean();
  const ids = tags.map((tag) => tag._id.toString());

  await redis.set(allTagsKey(userId), JSON.stringify(ids), { EX: 300 });

  for (const tag of tags) {
    await redis.set(tagKey(userId, tag._id), JSON.stringify(tag), { EX: 300 });
  }

  return tags;
};

export const createTagCached = async (userId, data) => {
  // `user` is set here rather than from the request body, so ownership
  // can never be spoofed by the client
  const newTag = new Tag({ ...data, user: userId });
  await newTag.save();

  const plainTag = newTag.toObject();

  // Invalidate cache
  await redis.del(allTagsKey(userId));
  await redis.set(tagKey(userId, plainTag._id.toString()), JSON.stringify(plainTag), {
    EX: 300,
  });

  return plainTag;
};

export const updateTagCached = async (userId, tagId, updatedData) => {
  const updatedTag = await Tag.findOneAndUpdate(
    { _id: tagId, user: userId },
    updatedData,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedTag) return null;

  const plainTag = updatedTag.toObject();

  // Invalidate cache
  await redis.del(allTagsKey(userId));
  await redis.set(tagKey(userId, tagId), JSON.stringify(plainTag), { EX: 300 });

  return plainTag;
};

export const deleteTagCached = async (userId, tagId) => {
  const deletedTag = await Tag.findOneAndDelete({ _id: tagId, user: userId });
  if (!deletedTag) return null;

  // Invalidate cache
  await redis.del(tagKey(userId, tagId));
  await redis.del(allTagsKey(userId));

  return deletedTag;
};
