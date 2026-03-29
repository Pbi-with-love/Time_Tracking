import redis from "../../config/redisClient.js";
import {
  otpRateLimit,
  generateOTPKey,
  saveOTP,
  verifyOTP,
  deleteOTP,
} from "../services/cache/otpCache.Service.js";
import { refreshTokenKey } from "../utils/redisKey.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/User.js";
import { sendOTP } from "../utils/mailer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// Register new account
export const register = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    throw new AppError("Missing required fields", 400);
  }

  const regex = /^\S+@\S+\.\S+$/;
  if (!regex.test(email)) {
    throw new AppError("Invalid email", 400);
  }

  const existing = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existing) {
    if (existing.email === email) {
      throw new AppError("Email already registered", 400);
    }

    if (existing.username === username) {
      throw new AppError("Username already taken", 400);
    }
  }

  const allowed = await otpRateLimit(email);
  if (!allowed) {
    throw new AppError("Too many OTP requests, try later", 429);
  }

  const otp = generateOTPKey();
  const passwordHash = await bcrypt.hash(password, 10);

  await saveOTP(email, {
    otp,
    type: "register",
    data: {
      username,
      passwordHash,
    },
  });

  await sendOTP(email, otp);

  res.status(200).json({
    message: "OTP sent",
  });
};

// Verify OTP
export const verify = async (req, res) => {
  const { email, otp } = req.body;

  const validOTP = await verifyOTP(email, otp);
  if (!validOTP) {
    throw new AppError("Invalid OTP", 400);
  }

  const { username, passwordHash } = validOTP.data;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("User already exists", 400);
  }

  const user = await User.create({
    email,
    username,
    passwordHash,
    roles: ["user"],
  });

  await deleteOTP(email);

  res.status(201).json({
    message: "User created successfully",
    userId: user._id,
  });
};

// Login and returning token
export const login = async (req, res) => {
  const { loginId, password } = req.body;
  if (!loginId || !password) {
    throw new AppError("Invalid credentials", 401);
  }

  const user = await User.findOne({
    $or: [{ email: loginId }, { username: loginId }],
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessTokenJTI = uuidv4();
  const accessToken = jwt.sign(
    {
      id: user._id,
      roles: user.roles,
      jti: accessTokenJTI,
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  const refreshTokenJTI = uuidv4();
  const refreshToken = jwt.sign(
    {
      id: user._id,
      jti: refreshTokenJTI
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, //dev env only, when deploy change to true
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await redis.set(refreshTokenKey(refreshTokenJTI), user._id.toString(), {
    EX: 7 * 24 * 60 * 60,
  });

  return res.status(200).json({
    message: "Login successful",
    accessToken
  });
};

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    if (decoded?.jti && decoded?.exp) {
      await redis.del(refreshTokenKey(decoded.jti))
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false, //dev env only, when deploy change to true
    sameSite: "strict",
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
};

// Chosing rotation method: extend 7 day from the last request
export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  
  if (!token) {
    throw new AppError("No refresh token", 401);
  }

  const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
  if (!decoded) {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await User.findById(decoded.id);

  const exist = await redis.get(refreshTokenKey(decoded.jti));
  if (!exist) {
    throw new AppError("Refresh token revoked", 401);
  }

  /** Avoid racecondition: 
    * Request1 check exist → true
    * Request2 check exist → true
    * Request1 delete
    * Request2 delete
    → BOTH ISSUE NEW TOKEN
  */
  const result = await redis.del(refreshTokenKey(decoded.jti));
  if (!result) {
    throw new AppError("Refresh token revoked", 401);
  }
  

  const accessTokenJTI = uuidv4();
  const newAccessToken = jwt.sign(
    {
      id: decoded.id,
      roles: user.roles,
      jti: accessTokenJTI
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshTokenJTI = uuidv4();
  const newRefreshToken = jwt.sign(
    {
      id: decoded.id,
      jti: refreshTokenJTI
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await redis.set(refreshTokenKey(refreshTokenJTI), decoded.id, {
    EX: 7 * 24 * 60 * 60,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false, //dev env only, when deploy change to true
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    accessToken: newAccessToken
  });
}
