/**
 * Cache keys are namespaced by user id so that a cache hit can never
 * serve one user's document to another user. Every entity key below
 * takes the owner's id as its first argument.
 */
export const taskKey = (userId, taskId) => `user:${userId}:task:${taskId}`;
export const allTasksKey = (userId) => `user:${userId}:tasks:all`;

export const tagKey = (userId, tagId) => `user:${userId}:tag:${tagId}`;
export const allTagsKey = (userId) => `user:${userId}:tags:all`;

export const timestampKey = (userId, timestampId) =>
  `user:${userId}:timestamp:${timestampId}`;
export const allTimestampsKey = (userId) => `user:${userId}:timestamps:all`;

// Auth keys are not user-scoped: they are keyed by email / ip / token id
export const otpKey = (email) => `otp:${email}`;
export const otpRateLimitKey = (email) => `rate:otp:${email}`;
export const loginRateLimitKey = (ip) => `rate:login:${ip}`;

export const refreshTokenKey = (jti) => `rt:${jti}`
