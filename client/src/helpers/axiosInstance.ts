import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_BACKEND_URL as string;

// Queue to hold pending requests while token is being refreshed
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (reason?: any) => void;
}> = [];

type ExtendedInternalAxiosRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

/**
 * Process all queued requests after token refresh completes
 */
const processQueue = (error: Error | null, token: string | null = null): void => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token!);
        }
    });
    failedQueue = [];
};

/**
 * Logout user by clearing tokens and redirecting to login page
 */
const logoutUser = (message: string = "Please Log In again..."): void => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");

    // Clear any queued requests
    processQueue(new Error("User logged out"), null);

    // Only show alert if not already on auth pages
    if (!window.location.pathname.includes('/auth/')) {
        window.alert(message);
        window.location.href = import.meta.env.VITE_LOGIN_URL as string || '/auth/sign-in';
    }
};

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

/**
 * Request interceptor to attach access token to every request
 */
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const accessToken = Cookies.get("accessToken");
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor to handle token refresh on 401 errors
 */
axiosInstance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        return response;
    },
    async (error: AxiosError): Promise<any> => {
        const originalRequest = error.config as ExtendedInternalAxiosRequestConfig | undefined;

        // Handle network errors, CORS issues, or missing config
        if (!error.response || !originalRequest) {
            return Promise.reject(error);
        }

        const status = error.response.status;

        // Skip 401 handling for these endpoints
        if (
            originalRequest.url?.includes('/logout') ||
            originalRequest.url?.includes('/login') ||
            originalRequest.url?.includes('/register') ||
            originalRequest.url?.includes('/me')
        ) {
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized errors (token expired or invalid)
        if (status === 401) {
            // Check if we already tried to refresh for this request
            if (originalRequest._retry) {
                // Already retried once and still got 401 -> logout
                console.error("Token refresh failed, logging out user");
                logoutUser("Session expired. Please log in again.");
                return Promise.reject(error);
            }

            // Mark this request as retried
            originalRequest._retry = true;

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            // Start the token refresh process
            isRefreshing = true;

            try {
                // CRITICAL: Don't send refreshToken in body - backend reads from cookies
                const response = await axios.post(
                    `${BASE_URL}users/refresh-token`,
                    {}, // Empty body - backend reads refreshToken from cookies
                    {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const { accessToken } = response.data.data;

                if (!accessToken) {
                    throw new Error("Invalid token response from server");
                }

                // Update default authorization header

                axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

                // Update the original request with new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                // Process all queued requests
                processQueue(null, accessToken);

                // Retry the original request
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                // Token refresh failed - logout user
                console.error("Failed to refresh token:", refreshError);
                processQueue(refreshError as Error, null);
                logoutUser("Session expired. Please log in again.");
                return Promise.reject(refreshError);

            } finally {
                // Always reset the refreshing flag
                isRefreshing = false;
            }
        }

        // For all other errors, just reject
        return Promise.reject(error);
    }
);

export default axiosInstance;



