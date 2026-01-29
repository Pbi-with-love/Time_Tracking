import redis from "../config/redisClient.js";
import Tag from "../models/Tag.js";
import { tagKey, allTagsKey } from "../utils/redisKey.js";

export const getTagCached = async (tagId) => {
  const tagCached = await redis.get(tagKey(tagId));

  if (tagCached) {
    return JSON.parse(tagCached);
  }

  const tag = await Tag.findById(tagId).lean();
  if (!tag) return null;

  await redis.set(tagKey(tagId), JSON.stringify(tag), { EX: 300 });

  return tag;
};

export const getAllTagCached = async () => {
  const allTagCached = await redis.get(allTagsKey());

  if (allTagCached) {
    const ids = JSON.parse(allTagCached);
    const keys = ids.map((id) => tagKey(id));

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
      const missingTags = await Tag.find({ _id: { $in: missingIds } }).lean();

      tagsCache.push(...missingTags);
      await Promise.all(
        missingTags.map((t) =>
          redis.set(tagKey(t._id.toString()), JSON.stringify(t), { EX: 300 })
        )
      );
    }

    return tagsCache;
  }

  const tags = await Tag.find().lean();
  const ids = tags.map((tag) => tag._id.toString());

  await redis.set(allTagsKey(), JSON.stringify(ids), { EX: 300 });

  for (const tag of tags) {
    await redis.set(tagKey(tag._id), JSON.stringify(tag), { EX: 300 });
  }

  return tags;
};

export const createTagCached = async (data) => {
  const newTag = new Tag(data);
  await newTag.save();

  const plainTag = newTag.toObject();

  // Invalidate cache
  await redis.del(allTagsKey());
  await redis.set(tagKey(plainTag._id.toString()), JSON.stringify(plainTag), {
    EX: 300,
  });

  return plainTag;
};

export const updateTagCached = async (tagId, updatedData) => {
  const updatedTag = await Tag.findByIdAndUpdate(tagId, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!updatedTag) return null;

  const plainTag = updatedTag.toObject();

  // Invalidate cache
  await redis.del(allTagsKey());
  await redis.set(tagKey(tagId), JSON.stringify(plainTag), { EX: 300 });

  return plainTag;
};

export const deleteTagCached = async (tagId) => {
  const deletedTag = await Tag.findByIdAndDelete(tagId);
  if (!deletedTag) return null;

  // Invalidate cache
  await redis.del(tagKey(tagId));
  await redis.del(allTagsKey());

  return deletedTag;
};
