import axios from "axios";
import { getAmplifyAccessToken, clearAmplifyStorage , getAmplifyIdToken} from "../utils/amplifyStorage";

const apiUrl = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

// Request interceptor to add Authorization header using Amplify tokens
api.interceptors.request.use(
    (config) => {
        const token = getAmplifyIdToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Import fetchAuthSession dynamically to avoid circular dependency
                const { fetchAuthSession } = await import('@aws-amplify/auth');
                const session = await fetchAuthSession({ forceRefresh: true });
                const newAccessToken = session.tokens?.accessToken?.toString();
                
                if (newAccessToken) {
                    processQueue(null, newAccessToken);
                    
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } else {
                    throw new Error("Failed to refresh token");
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                
                // Clear Amplify storage and redirect to login
                clearAmplifyStorage();
                window.location.href = '/auth';
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
