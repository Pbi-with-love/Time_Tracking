import axios from 'axios';
import { getAccessToken, setAccessToken } from './authToken';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let failedQueue = [];
let isRefreshing = false;

api.interceptors.response.use(
  (res) => res,

  /**
   * The important thing is return a callback (not a specific value)
   * A callback can be resolve or not yet resolve, this case return a callback api(originalRequest) to retry using new token to access endpoint
   */
  async (error) => {
    // error.config (url, method, body, headers)
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    /**
     * The main idea here is when refresh token, backend will execute rotation RT:
     * const result = await redis.del(refreshTokenKey(decoded.jti));
     * Therefore, if we are currently in "Dashboard" and it calls 3 API /tasks /tags /timestamps
     * only the first one hit backend, then the key is rotation, the others when reach backend will cause error and return unexpected behavior
     * Use an isRefreshing flag to ensure that only one request triggers the /refresh endpoint at a time.
     * 0ms:
     * Request 1 (GET /profile)       → 401 → interceptor
     * Request 2 (GET /notifications) → 401 → interceptor
     * Request 3 (GET /settings)      → 401 → interceptor
     * 1ms:
     * Request 1: isRefreshing = false → set true → /refresh
     * Request 2: isRefreshing = true  → Promise pending → Wait
     * Request 3: isRefreshing = true  → Promise pending → Wait
     * failedQueue = [resolve2, resolve3]
     */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${token}`,
        };
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const res = await api.post('/auth/refresh');
      const data = res.data;

      const newToken = data.accessToken;
      setAccessToken(newToken);

      failedQueue.forEach(({ resolve }) => resolve(newToken));
      // Reset immediately to prevent next req incoming but prev req is still exist in queue
      failedQueue = [];

      // Retry original request
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      };
      // Create a new req to server for retry
      return api(originalRequest);
    } catch (refreshErr) {
      failedQueue.forEach(({ reject }) => reject(refreshErr));
      failedQueue = [];

      setAccessToken(null);
      window.location.href = '/auth'; // Redirect to login page on refresh token failure
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);
