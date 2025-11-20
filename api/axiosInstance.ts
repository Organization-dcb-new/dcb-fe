import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

// Buat instance axios dengan konfigurasi default
const apiClient = axios.create({
  baseURL: 'http://localhost:4000', // Ganti dengan URL API Anda
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
