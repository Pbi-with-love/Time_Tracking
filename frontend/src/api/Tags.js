import axios from "axios";

const API_URL = "http://localhost:3000/api";

export const getAllTags = async () => {
  try {
    const res = await axios.get(`${API_URL}/tags`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch tags: ", error);
    throw error;
  }
};

export const getTagByID = async (tagId) => {
  try {
    const res = await axios.get(`${API_URL}/tags/${tagId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch tag by id ", error);
    throw error;
  }
};

export const createTags = async (title, description) => {
  try {
    const res = await axios.post(`${API_URL}/tags`, {
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
    const res = await axios.patch(`${API_URL}/tags/${tagId}`, updatedFields);
    return res.data;
  } catch (error) {
    console.error("Failed to update tag ", error);
    throw error;
  }
};

export const deleteTag = async (tagId) => {
  try {
    const res = await axios.delete(`${API_URL}/tags/${tagId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete tag ", error);
    throw error;
  }
};
