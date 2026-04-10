import { api } from "./axiosClient"

export const getAllTags = async () => {
  try {
    const res = await api.get(`/tags`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch tags: ", error);
    throw error;
  }
};

export const getTagByID = async (tagId) => {
  try {
    const res = await api.get(`/tags/${tagId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch tag by id ", error);
    throw error;
  }
};

export const createTags = async (title, description) => {
  try {
    const res = await api.post(`/tags`, {
      title,
      description,
    });
    return res.data;
  } catch (error) {
    console.error("Failed to create task ", error);
    throw error;
  }
};

export const updateTag = async (tagId, updatedFields) => {
  try {
    const res = await api.patch(`/tags/${tagId}`, updatedFields);
    return res.data;
  } catch (error) {
    console.error("Failed to update tag ", error);
    throw error;
  }
};

export const deleteTag = async (tagId) => {
  try {
    const res = await api.delete(`/tags/${tagId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete tag ", error);
    throw error;
  }
};
