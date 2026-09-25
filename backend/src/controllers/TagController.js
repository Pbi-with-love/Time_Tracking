import {
  getTagCached,
  getAllTagCached,
  createTagCached,
  updateTagCached,
  deleteTagCached,
} from "../services/cache/tagCache.Service.js";

// GET all tags
export const getAllTags = async (req, res) => {
  try {
    const tags = await getAllTagCached(req.user.id);
    res.status(200).json(tags);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch tags", error: error.message });
  }
};

// GET tag by ID
export const getTagById = async (req, res) => {
  try {
    const tag = await getTagCached(req.user.id, req.params.id);
    if (!tag) return res.status(404).json({ error: "Tag not found" });
    res.status(200).json(tag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE tag
export const createTag = async (req, res) => {
  try {
    // Whitelist the stored fields — `user` is set from the authenticated
    // request, never from the body
    const { title, description } = req.body;
    const newTag = await createTagCached(req.user.id, { title, description });
    res.status(201).json(newTag);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create tag", error: error.message });
  }
};

// UPDATE tag
export const updateTag = async (req, res) => {
  try {
    // Whitelist the updatable fields — `user` must never come from the body
    const { title, description } = req.body;
    const updatedData = {};
    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;

    const updatedTag = await updateTagCached(
      req.user.id,
      req.params.id,
      updatedData,
    );
    if (!updatedTag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.status(200).json(updatedTag);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update tag", error: error.message });
  }
};

// DELETE tag
export const deleteTag = async (req, res) => {
  try {
    const deletedTag = await deleteTagCached(req.user.id, req.params.id);
    if (!deletedTag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete tag", error: error.message });
  }
};
