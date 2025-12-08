import axios, { AxiosResponse, AxiosError } from 'axios'

// Create axios instance with base configuration
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle responses and errors
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the response data in the expected format
    return {
      ...response,
      data: response.data
    }
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response?.status === 401) {
      // Don't redirect for change password API failures
      const isChangePasswordRequest = error.config?.url?.includes('/admin/change-password')
      
      if (!isChangePasswordRequest) {
        // Clear token on unauthorized (except for change password)
        localStorage.removeItem('authToken')
        // Redirect to sign-in if needed
        window.location.href = '/signin'
      }
    }
    
    // Return error in consistent format
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

export default axiosClient