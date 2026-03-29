import redis from "../../config/redisClient.js";
import {
  otpKey,
  otpRateLimitKey,
  loginRateLimitKey,
} from "../../utils/redisKey.js";

export const generateOTPKey = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveOTP = async (email, data) => {
  const key = otpKey(email);

  await redis.set(key, JSON.stringify(data), {
    EX: 300,
  });
};

export const getOTP = async (email) => {
  const key = otpKey(email);
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export const deleteOTP = async (email) => {
  const key = otpKey(email);
  await redis.del(key);
};

export const verifyOTP = async (email, inputOTP) => {
  const data = await getOTP(email);

  if (!data) return null;

  if (data.otp !== inputOTP) return null;

  return data;
};

export const rateLimit = async (key, limit = 5, windowSec = 60) => {
  const current = await redis.incr(key);

  // set TTL only first time
  if (current === 1) {
    await redis.expire(key, windowSec);
  }

  return current <= limit;
};

// Specific helper: OTP request rate limit
export const otpRateLimit = async (email) => {
  const key = otpRateLimitKey(email);
  return await rateLimit(key, 3, 60);
};

// Optional: login rate limit (by IP)
export const loginRateLimit = async (ip) => {
  const key = loginRateLimitKey(ip);
  return await rateLimit(key, 5, 60);
};