import express from "express";
import { login, logout, register, verify, refresh } from "../controllers/Auth.js";
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { getUserDetailController } from "../controllers/User.js"

const router = express.Router();

router.post("/register", register);
router.post("/verify", verify);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);

router.get("/me", authMiddleware, getUserDetailController);

export default router;