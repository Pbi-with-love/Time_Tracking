import express from "express";
import {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} from "../controllers/TagController.js";
import { handleTagsOfInterest } from "../controllers/HandlePeriod.js"
const router = express.Router();

router.get("/tagsofinterest", handleTagsOfInterest)

// --- Tag routes ---
router.get("/", getAllTags);
router.get("/:id", getTagById);
router.post("/", createTag);
router.patch("/:id", updateTag); 
router.delete("/:id", deleteTag);

export default router;