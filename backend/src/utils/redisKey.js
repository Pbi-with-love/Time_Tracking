export const taskKey = (taskId) => `task:${taskId}`;
export const allTasksKey = () => `tasks:all`;

export const tagKey = (tagId) => `tag:${tagId}`;
export const allTagsKey = () => `tags:all`;

export const timestampKey = (timestampId) => `timestamp:${timestampId}`;
export const allTimestampsKey = () => `timestamps:all`;

export const otpKey = (email) => `otp:${email}`;
export const otpRateLimitKey = (email) => `rate:otp:${email}`;
export const loginRateLimitKey = (ip) => `rate:login:${ip}`;

export const refreshTokenKey = (jti) => `rt:${jti}`
