import axios, { AxiosError } from "axios";

/**
    Base Axios Instance
 */
const axiosClient = axios.create({
  baseURL: "http://localhost:4000/api",
  timeout: 150000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Automatically attach token in headers
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Handle errors globally
 */
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError<any>) => {
    if (!error.response) {
      console.error("Network Error: Server not reachable");

      return Promise.reject({
        success: false,
        message: "Server not reachable. Please try again later.",
      });
    }

    const status = error.response.status;
    const message = error.response.data?.message || "Something went wrong!";

    console.error("API Error:", status, message);

    /**
     * Handle Unauthorized (Token Expired)
     */
    if (status === 401) {
      console.warn("Token expired. Logging out...");

      localStorage.removeItem("token");

      window.location.href = "/login"; // redirect user
    }

    /**
     * Handle Forbidden
     */
    if (status === 403) {
      return Promise.reject({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    /**
     * Handle Not Found
     */
    if (status === 404) {
      return Promise.reject({
        success: false,
        message: "API route not found!",
      });
    }

    /**
     * Handle Server Error
     */
    if (status >= 500) {
      return Promise.reject({
        success: false,
        message: "Server error. Please try again later.",
      });
    }

    return Promise.reject({
      success: false,
      message,
    });
  },
);

export default axiosClient;
