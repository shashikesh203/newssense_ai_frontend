import axios, { AxiosResponse, AxiosError } from 'axios'

// Create axios instance with base configuration
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json',
  },
})



export default axiosClient